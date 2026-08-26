import './style.css';
import { CameraRuntime } from '../camera/camera-runtime.js';
import { DeviceOrientationProvider } from '../motion/device-orientation-provider.js';
import type { OrientationSource } from '../motion/orientation-provider.js';
import { analyzeSceneSweep } from '../p1/analyze-scene-sweep.js';
import { clonePixelFrame, syntheticVisualFixtures } from '../p1/synthetic-fixtures.js';
import type { PhotographyViewCandidateV01, PlacementAnchor, SceneSweepAnalysisResult, TransientKeyframePixels } from '../p1/types.js';
import { GeometryFrameSelector } from '../p2/geometry-frame-selector.js';
import { analyzeCorrespondence } from '../p2/opencv-correspondence.js';
import { loadOpenCv } from '../p2/opencv-loader.js';
import { buildClientSpatialEvidence } from '../p2/spatial-evidence.js';
import type { CorrespondenceDiagnostics, SpatialEvidenceV01 } from '../p2/types.js';
import { canonicalManifestJson } from '../spatial/scene-sweep-manifest.js';
import { YawMap } from '../spatial/yaw-map.js';
import { metricsFromImageData } from '../sweep/quality-gate.js';
import { SceneSweepRuntime } from '../sweep/sweep-runtime.js';
import type { FrameMetrics, SweepMode } from '../sweep/types.js';
import { SweepTelemetry } from '../telemetry/telemetry.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const setText = (id: string, text: string): void => { $(id).textContent = text; };
const video = $<HTMLVideoElement>('preview');
const camera = new CameraRuntime(video);
const orientation = new DeviceOrientationProvider();
const telemetry = new SweepTelemetry();
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

type TrialEvidence = {
  sweep_id: string; mode: SweepMode; status: string; duration_ms: number | null;
  coverage_deg: number; direction: string; keyframe_count: number; selected_yaws_deg: number[];
  rejections: Record<string, number>; camera_state: string; camera_dimensions: string;
  preview_fps_median: number | null; preview_fps_min: number | null;
  orientation_state: string; orientation_source: OrientationSource; orientation_hz: number;
  initial_stationary_yaw_range_deg: number | null; quality_eval_ms_p50: number | null;
  quality_eval_ms_p95: number | null; blur_score_min_p50_p95: number[];
  exposure_mean_min_p50_max: number[]; queue_length: number; privacy: object; network: object;
};
type P1TrialEvidence = {
  sweep_id: string; mode: SweepMode; descriptor_count: number; prepared_frame_count: number; region_count: number; candidate_count: number;
  analysis_ms: { descriptor: number; region: number; candidate: number; total: number; };
  view_candidates: { view_id: string; yaw_deg: number; placement_anchors: PlacementAnchor[]; technical_reason_codes: string[]; }[];
  direction_map: { node_count: number; depth: 'UNKNOWN'; metric_geometry: 'NOT_SUPPORTED'; };
  preview_fps_median: number | null; privacy: object; qualitative_pending: true;
};
type P2TrialEvidence = { sweep_id: string; geometry_frame_count: number; frame_budget: number; estimated_memory_bytes: number; correspondence: CorrespondenceDiagnostics; spatial_evidence: SpatialEvidenceV01; preview_fps_median: number | null; };

let runtime: SceneSweepRuntime | null = null;
let latestYaw = 0;
let candidateTimer = 0;
let fixtureTimer = 0;
let firstOrientationAt: number | null = null;
let initialYawSamples: number[] = [];
let previewFpsSamples: number[] = [];
let candidateBlurScores: number[] = [];
let candidateExposureMeans: number[] = [];
let orientationSource: OrientationSource = 'CONTROLLED_FIXTURE';
const completedTrials: TrialEvidence[] = [];
const recordedTrialIds = new Set<string>();
const transientKeyframes = new Map<string, TransientKeyframePixels>();
const analyzedSweepIds = new Set<string>();
const p1Trials: P1TrialEvidence[] = [];
let latestP1Analysis: SceneSweepAnalysisResult | null = null;
const geometrySelector = new GeometryFrameSelector();
const analyzedP2SweepIds = new Set<string>();
const p2Trials: P2TrialEvidence[] = [];
let latestP2Evidence: SpatialEvidenceV01 | null = null;
let latestP2Correspondence: CorrespondenceDiagnostics | null = null;

const currentMode = (): SweepMode => $<HTMLSelectElement>('mode').value as SweepMode;
const modeTarget = (): number => ({ QUICK_SWEEP: 110, WIDE_SWEEP: 180, FULL_SWEEP: 360 })[currentMode()];
const rounded = (value: number, digits = 1): number => Number(value.toFixed(digits));
const percentile = (values: readonly number[], ratio: number): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * ratio)] ?? null;
};
const stationaryRange = (): number | null => initialYawSamples.length < 2 ? null : Math.max(...initialYawSamples) - Math.min(...initialYawSamples);
const resetTrialTelemetry = (): void => { firstOrientationAt = null; initialYawSamples = []; previewFpsSamples = []; candidateBlurScores = []; candidateExposureMeans = []; };
const updateEvidenceText = (): void => { $<HTMLTextAreaElement>('device-evidence').value = JSON.stringify(completedTrials, null, 2); };
const updateP1EvidenceText = (): void => { $<HTMLTextAreaElement>('p1-device-evidence').value = JSON.stringify(p1Trials, null, 2); };
const updateP2EvidenceText = (): void => { $<HTMLTextAreaElement>('p2-device-evidence').value = JSON.stringify(p2Trials, null, 2); };
const reasonLabel: Record<string, string> = {
  BALANCED_EXPOSURE: '曝光可用', GOOD_SHARPNESS: '清晰度可用', PENALTY_LOW_SHARPNESS: '清晰度受限',
  PENALTY_OVEREXPOSED: '高光受限', PENALTY_UNDEREXPOSED: '暗部受限',
};
const directionLabel = (yaw: number): string => Math.abs(yaw) < 1 ? '相对起点 0°' : yaw > 0 ? `相对起点向右 ${Math.abs(yaw).toFixed(0)}°` : `相对起点向左 ${Math.abs(yaw).toFixed(0)}°`;
const pixelFrameThumbnail = (width: number, height: number, data: Uint8ClampedArray): string => {
  const thumbnail = document.createElement('canvas'); thumbnail.width = width; thumbnail.height = height;
  thumbnail.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(data), width, height), 0, 0);
  return thumbnail.toDataURL('image/jpeg', 0.72);
};
const imageDataToTransient = (imageData: ImageData, keyframeId: string): TransientKeyframePixels => {
  return { keyframe_id: keyframeId, pixels: { width: imageData.width, height: imageData.height, data: new Uint8ClampedArray(imageData.data) }, thumbnail_url: pixelFrameThumbnail(imageData.width, imageData.height, imageData.data) };
};
const renderViewCandidateCard = (candidate: PhotographyViewCandidateV01, index: number): HTMLElement => {
  const article = document.createElement('article'); article.className = 'opportunity-card';
  const transient = transientKeyframes.get(candidate.representative_keyframe_id);
  const visual = document.createElement('div'); visual.className = 'opportunity-visual';
  if (transient?.thumbnail_url) { const image = document.createElement('img'); image.src = transient.thumbnail_url; image.alt = `候选方向 ${index + 1}`; visual.append(image); }
  for (const placement of candidate.placement_candidates) { const marker = document.createElement('div'); marker.className = `placement-marker ${placement.image_anchor.toLowerCase()}`; marker.textContent = '候选'; marker.title = `${placement.image_anchor} · 仅为画面候选标记`; visual.append(marker); }
  const body = document.createElement('div'); body.className = 'opportunity-body';
  const title = document.createElement('h3'); title.textContent = `候选视角 ${index + 1} · ${directionLabel(candidate.relative_camera_yaw_deg)}`;
  const meta = document.createElement('p'); meta.textContent = '候选人物位置：左侧 / 中间 / 右侧 · 留待后续 AI 或用户选择';
  const reasons = document.createElement('div'); reasons.className = 'reason-list';
  for (const code of candidate.technical_reason_codes.slice(0, 3)) { const tag = document.createElement('span'); tag.textContent = reasonLabel[code] ?? '技术质量已记录'; reasons.append(tag); }
  const status = document.createElement('span'); status.textContent = '角度分散候选'; reasons.prepend(status);
  body.append(title, meta, reasons); article.append(visual, body); return article;
};

const renderDirectionMap = (analysis: SceneSweepAnalysisResult): void => {
  const map = $('direction-map'); map.replaceChildren();
  for (const node of analysis.direction_map.nodes) { const dot = document.createElement('span'); dot.className = 'direction-node'; dot.style.left = `${node.arc_position * 100}%`; dot.title = directionLabel(node.relative_yaw_deg); map.append(dot); }
};

const runP1Analysis = (): void => {
  if (!runtime || runtime.session.status !== 'COMPLETE' || analyzedSweepIds.has(runtime.session.sweep_id)) return;
  const manifest = runtime.manifest(), yawMap = new YawMap(manifest.ordered_keyframes).serialize();
  latestP1Analysis = analyzeSceneSweep(manifest, yawMap, [...transientKeyframes.values()]);
  analyzedSweepIds.add(runtime.session.sweep_id);
  renderDirectionMap(latestP1Analysis);
  const cards = $('opportunity-cards'); cards.replaceChildren(...latestP1Analysis.view_candidates.map(renderViewCandidateCard));
  $('p1-results').hidden = false; setText('p1-latency', `${latestP1Analysis.timings.total_ms.toFixed(1)} ms`);
  setText('p1-regions', String(latestP1Analysis.context.angular_regions.length)); setText('p1-opportunities', String(latestP1Analysis.view_candidates.length));
  setText('p1-timings', `${latestP1Analysis.timings.descriptor_ms.toFixed(1)} / ${latestP1Analysis.timings.region_ms.toFixed(1)} / ${latestP1Analysis.timings.candidate_ms.toFixed(1)} ms`);
  $<HTMLButtonElement>('download-p1').disabled = false;
  const trial = completedTrials.find((item) => item.sweep_id === manifest.sweep_id);
  p1Trials.push({ sweep_id: manifest.sweep_id, mode: manifest.mode, descriptor_count: latestP1Analysis.descriptors.length, prepared_frame_count: latestP1Analysis.frame_set.frames.length, region_count: latestP1Analysis.context.angular_regions.length, candidate_count: latestP1Analysis.view_candidates.length, analysis_ms: { descriptor: latestP1Analysis.timings.descriptor_ms, region: latestP1Analysis.timings.region_ms, candidate: latestP1Analysis.timings.candidate_ms, total: latestP1Analysis.timings.total_ms }, view_candidates: latestP1Analysis.view_candidates.map((item) => ({ view_id: item.view_id, yaw_deg: rounded(item.relative_camera_yaw_deg), placement_anchors: item.placement_candidates.map((candidate) => candidate.image_anchor), technical_reason_codes: item.technical_reason_codes })), direction_map: { node_count: latestP1Analysis.direction_map.nodes.length, depth: latestP1Analysis.direction_map.depth, metric_geometry: latestP1Analysis.direction_map.metric_geometry }, preview_fps_median: trial?.preview_fps_median ?? null, privacy: latestP1Analysis.context.privacy, qualitative_pending: true });
  updateP1EvidenceText();
};

const emptyCorrespondence = (reason: string): CorrespondenceDiagnostics => ({ engine: 'GFTT_PYRLK', detected_feature_count: 0, tracked_feature_count: 0, match_retention: 0, inlier_ratio: 0, median_displacement_px: 0, median_parallax_px: 0, p75_parallax_px: 0, latency_ms: 0, pair_count: 0, failure_reason: reason });
const runP2Analysis = async (): Promise<void> => {
  if (!runtime || runtime.session.status !== 'COMPLETE' || analyzedP2SweepIds.has(runtime.session.sweep_id)) return;
  const sweepId = runtime.session.sweep_id; analyzedP2SweepIds.add(sweepId); setText('p2-status', '分析中'); $('p2-results').hidden = false;
  const input = geometrySelector.input(sweepId);
  let correspondence = emptyCorrespondence(input.frames.length < 2 ? 'INSUFFICIENT_FRAMES' : 'OPENCV_WASM_UNAVAILABLE');
  if (input.frames.length >= 2) {
    try { correspondence = analyzeCorrespondence(await loadOpenCv(), input, 'GFTT_PYRLK'); }
    catch (error) { correspondence = emptyCorrespondence(error instanceof Error ? error.message : 'OPENCV_WASM_UNAVAILABLE'); }
  }
  if (runtime?.session.sweep_id !== sweepId) return;
  latestP2Correspondence = correspondence; latestP2Evidence = buildClientSpatialEvidence(input, correspondence, geometrySelector.selection_latency_ms);
  const trial = completedTrials.find(item => item.sweep_id === sweepId);
  p2Trials.push({ sweep_id: sweepId, geometry_frame_count: input.frames.length, frame_budget: input.selection_budget, estimated_memory_bytes: input.estimated_memory_bytes, correspondence, spatial_evidence: latestP2Evidence, preview_fps_median: trial?.preview_fps_median ?? null }); updateP2EvidenceText();
  setText('p2-status', latestP2Evidence.status); setText('p2-frames', `${input.frames.length} / ${input.selection_budget}`); setText('p2-classification', latestP2Evidence.parallax_classification); setText('p2-tracks', String(correspondence.tracked_feature_count)); setText('p2-inliers', correspondence.inlier_ratio.toFixed(3)); setText('p2-parallax', `${correspondence.median_parallax_px.toFixed(2)} px`); setText('p2-latency', `${latestP2Evidence.diagnostics.total_latency_ms.toFixed(1)} ms`); $<HTMLButtonElement>('download-p2').disabled = false;
};

const recordTrial = (): void => {
  if (!runtime || runtime.session.status !== 'COMPLETE' || recordedTrialIds.has(runtime.session.sweep_id)) return;
  const manifest = runtime.manifest();
  const cameraSnapshot = camera.snapshot();
  const metrics = telemetry.snapshot(performance.now(), cameraSnapshot.fps, [cameraSnapshot.width, cameraSnapshot.height], 0);
  const positiveFps = previewFpsSamples.filter((value) => value > 0);
  const yawRange = stationaryRange();
  completedTrials.push({
    sweep_id: manifest.sweep_id, mode: manifest.mode, status: manifest.status,
    duration_ms: manifest.ended_at === null ? null : manifest.ended_at - manifest.started_at,
    coverage_deg: rounded(manifest.coverage_deg), direction: manifest.direction,
    keyframe_count: manifest.ordered_keyframes.length,
    selected_yaws_deg: manifest.ordered_keyframes.map((item) => rounded(item.yaw_deg)),
    rejections: { ...manifest.rejection_stats }, camera_state: cameraSnapshot.state,
    camera_dimensions: `${cameraSnapshot.width}x${cameraSnapshot.height}`,
    preview_fps_median: percentile(positiveFps, 0.5),
    preview_fps_min: positiveFps.length ? Math.min(...positiveFps) : null,
    orientation_state: orientation.state, orientation_source: manifest.orientation.source,
    orientation_hz: rounded(metrics.orientation_hz),
    initial_stationary_yaw_range_deg: yawRange === null ? null : rounded(yawRange),
    quality_eval_ms_p50: metrics.quality_eval_ms_p50 === null ? null : rounded(metrics.quality_eval_ms_p50, 2),
    quality_eval_ms_p95: metrics.quality_eval_ms_p95 === null ? null : rounded(metrics.quality_eval_ms_p95, 2),
    blur_score_min_p50_p95: candidateBlurScores.length ? [rounded(Math.min(...candidateBlurScores), 2), rounded(percentile(candidateBlurScores, 0.5)!, 2), rounded(percentile(candidateBlurScores, 0.95)!, 2)] : [],
    exposure_mean_min_p50_max: candidateExposureMeans.length ? [rounded(Math.min(...candidateExposureMeans), 2), rounded(percentile(candidateExposureMeans, 0.5)!, 2), rounded(Math.max(...candidateExposureMeans), 2)] : [],
    queue_length: metrics.queue_length, privacy: manifest.privacy, network: manifest.network,
  });
  recordedTrialIds.add(runtime.session.sweep_id);
  updateEvidenceText();
};

const stopAcquisition = (): void => {
  clearInterval(candidateTimer); clearInterval(fixtureTimer); orientation.stop();
  $('finish').toggleAttribute('disabled', runtime?.session.status === 'COMPLETE');
  $('download').toggleAttribute('disabled', runtime?.session.status !== 'COMPLETE');
};

const render = (): void => {
  if (!runtime) return;
  const coverage = runtime.coverage.snapshot();
  const cameraSnapshot = camera.snapshot();
  const metrics = telemetry.snapshot(performance.now(), cameraSnapshot.fps, [cameraSnapshot.width, cameraSnapshot.height], 0);
  if (cameraSnapshot.fps > 0) previewFpsSamples.push(cameraSnapshot.fps);
  if (previewFpsSamples.length > 600) previewFpsSamples.shift();
  const yawRange = stationaryRange();
  setText('status', `${runtime.session.mode} / ${runtime.session.status}`);
  setText('camera-state', cameraSnapshot.state);
  setText('dimensions', `${cameraSnapshot.width} × ${cameraSnapshot.height}`);
  setText('orientation-state', `${orientation.state} / ${orientationSource}`);
  setText('yaw', `${latestYaw.toFixed(1)}°`);
  setText('coverage', `${coverage.span_deg.toFixed(1)}° / ${modeTarget()}°`);
  setText('direction', coverage.direction);
  setText('keyframes', String(runtime.sampler.keyframes.length));
  setText('selected-yaws', runtime.sampler.keyframes.length ? runtime.sampler.keyframes.map((item) => item.yaw_deg.toFixed(1)).join(', ') : '—');
  setText('blur-rejections', String(runtime.sampler.rejections.BLUR));
  setText('exposure-rejections', String(runtime.sampler.rejections.UNDEREXPOSED + runtime.sampler.rejections.OVEREXPOSED));
  setText('duplicate-rejections', String(runtime.sampler.rejections.DUPLICATE));
  setText('fps', metrics.preview_fps.toFixed(1));
  setText('hz', metrics.orientation_hz.toFixed(1));
  setText('quality', metrics.quality_eval_ms_p50 === null ? '—' : `${metrics.quality_eval_ms_p50.toFixed(2)} / ${metrics.quality_eval_ms_p95?.toFixed(2)}`);
  setText('stationary-range', yawRange === null ? '采集中' : `${yawRange.toFixed(1)}°`);
  setText('privacy-counters', `${metrics.queue_length} / ${metrics.raw_video_upload}`);
  $('arc-fill').style.width = `${Math.min(100, coverage.span_deg / modeTarget() * 100)}%`;
  setText('hero', runtime.session.status === 'COMPLETE' ? '看完了' : '慢慢转动手机');
  if (runtime.session.status === 'COMPLETE') {
    recordTrial(); runP1Analysis(); void runP2Analysis(); stopAcquisition();
    $<HTMLButtonElement>('start').disabled = false;
    $<HTMLButtonElement>('start').textContent = '再扫一次';
    $<HTMLButtonElement>('next-sweep').hidden = false;
    $<HTMLButtonElement>('next-sweep').textContent = runtime.session.mode === 'QUICK_SWEEP' ? '扫更广一点（WIDE）' : '再拍一个 QUICK';
    $<HTMLSelectElement>('mode').disabled = false;
  }
};

const sampleFrame = (): void => {
  if (!runtime || runtime.session.status !== 'SWEEPING' || !video.videoWidth) return;
  const started = performance.now();
  canvas.width = 160; canvas.height = Math.max(1, Math.round(160 * video.videoHeight / video.videoWidth));
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const frameMetrics = metricsFromImageData(imageData, performance.now(), latestYaw);
  candidateBlurScores.push(frameMetrics.blur_score); candidateExposureMeans.push(frameMetrics.exposure_mean);
  runtime.setCameraSourceDimensions(video.videoWidth, video.videoHeight);
  geometrySelector.observe(frameMetrics, { width: imageData.width, height: imageData.height, data: imageData.data }, 'DEVICE_ORIENTATION');
  const selected = runtime.observeFrame(frameMetrics);
  if (selected) { const selectedKeyframe = runtime.sampler.keyframes.at(-1); if (selectedKeyframe) transientKeyframes.set(selectedKeyframe.keyframe_id, imageDataToTransient(imageData, selectedKeyframe.keyframe_id)); }
  telemetry.candidate(performance.now() - started, selected); render();
};

$('start').addEventListener('click', async () => {
  $<HTMLButtonElement>('start').disabled = true; $<HTMLButtonElement>('start').textContent = '启动中…';
  $<HTMLButtonElement>('next-sweep').hidden = true; $<HTMLSelectElement>('mode').disabled = true;
  runtime = new SceneSweepRuntime(currentMode(), `sweep-${Date.now()}`, Date.now());
  telemetry.start(performance.now()); resetTrialTelemetry(); transientKeyframes.clear(); geometrySelector.reset(); latestP1Analysis = null; latestP2Evidence = null; latestP2Correspondence = null; $('p1-results').hidden = true; $('p2-results').hidden = true; $<HTMLButtonElement>('download-p1').disabled = true; $<HTMLButtonElement>('download-p2').disabled = true; orientation.resetBaseline(); orientationSource = 'DEVICE_ORIENTATION';
  setText('message', '正在请求相机与方向权限…');
  const [cameraState, orientationState] = await Promise.all([camera.start(), orientation.requestPermission()]);
  if (cameraState.state !== 'ACTIVE') { setText('message', cameraState.message ?? '相机不可用'); $<HTMLButtonElement>('start').disabled = false; $<HTMLButtonElement>('start').textContent = '重试'; $<HTMLSelectElement>('mode').disabled = false; render(); return; }
  runtime.setCameraSourceDimensions(cameraState.width, cameraState.height);
  $<HTMLButtonElement>('start').textContent = '扫描中';
  $('empty').style.display = 'none'; $('finish').toggleAttribute('disabled', false); $('cancel').toggleAttribute('disabled', false);
  orientation.start((sample) => {
    latestYaw = sample.relative_yaw_deg; orientationSource = sample.source; telemetry.orientation();
    if (firstOrientationAt === null) firstOrientationAt = sample.timestamp_ms;
    if (sample.timestamp_ms - firstOrientationAt <= 3000) initialYawSamples.push(sample.relative_yaw_deg);
    runtime?.observeOrientation(sample); latestYaw = runtime?.currentYawDeg() ?? sample.relative_yaw_deg; render();
  });
  candidateTimer = window.setInterval(sampleFrame, 125);
  setText('message', orientationState === 'ACTIVE' ? '方向传感器已启用；先静止约 3 秒，再缓慢转动。' : '相机可用，但方向传感器不可用。'); render();
});

$('fixture').addEventListener('click', () => {
  clearInterval(fixtureTimer);
  const target = modeTarget();
  runtime = new SceneSweepRuntime(currentMode(), `fixture-${currentMode().toLowerCase()}-${Date.now()}`, Date.now());
  telemetry.start(performance.now()); resetTrialTelemetry(); transientKeyframes.clear(); geometrySelector.reset(); latestP1Analysis = null; latestP2Evidence = null; latestP2Correspondence = null; $('p1-results').hidden = true; $('p2-results').hidden = true; $<HTMLButtonElement>('download-p1').disabled = true; $<HTMLButtonElement>('download-p2').disabled = true; orientationSource = 'CONTROLLED_FIXTURE';
  $('empty').style.display = 'none'; $('finish').toggleAttribute('disabled', false); $('cancel').toggleAttribute('disabled', false);
  setText('message', '确定性 Fixture：无相机、无网络、无 Provider。');
  let yaw = 0, fixtureSequence = 0;
  const tick = (): void => {
    if (!runtime || runtime.session.status === 'COMPLETE') { stopAcquisition(); return; }
    latestYaw = yaw; telemetry.orientation();
    const timestamp = Date.now();
    if (firstOrientationAt === null) firstOrientationAt = timestamp;
    if (timestamp - firstOrientationAt <= 3000) initialYawSamples.push(yaw);
    runtime.observeOrientation({ timestamp_ms: timestamp, relative_yaw_deg: yaw, raw_heading_deg: yaw, confidence: 'HIGH', status: 'ACTIVE', screen_orientation: 'PORTRAIT_PRIMARY', source: 'CONTROLLED_FIXTURE' });
    latestYaw = runtime.currentYawDeg() ?? yaw;
    const candidate: FrameMetrics = { timestamp_ms: timestamp, yaw_deg: yaw, width: 640, height: 480, blur_score: 30, exposure_mean: 128, highlight_clipping_ratio: 0, shadow_clipping_ratio: 0, fingerprint: [(yaw % 24) / 24, 1 - (yaw % 24) / 24] };
    geometrySelector.observe({ ...candidate, timestamp_ms: timestamp + fixtureSequence * 125 }, clonePixelFrame(syntheticVisualFixtures['moderate-balanced']), 'CONTROLLED_FIXTURE'); fixtureSequence++;
    const started = performance.now(); const selected = runtime.observeFrame(candidate);
    if (selected) {
      const selectedKeyframe = runtime.sampler.keyframes.at(-1);
      if (selectedKeyframe) {
        const names = ['clean-left', 'high-clutter', 'moderate-balanced', 'clean-right'] as const;
        const fixture = syntheticVisualFixtures[names[Math.min(3, Math.floor(yaw / Math.max(1, target / 4)))] ?? 'moderate-balanced'];
        transientKeyframes.set(selectedKeyframe.keyframe_id, { keyframe_id: selectedKeyframe.keyframe_id, pixels: clonePixelFrame(fixture), thumbnail_url: pixelFrameThumbnail(fixture.width, fixture.height, fixture.data) });
      }
    }
    telemetry.candidate(performance.now() - started, selected); yaw += 6; render();
    if (yaw > target + 12) stopAcquisition();
  };
  tick(); fixtureTimer = window.setInterval(tick, 35);
});

$('next-sweep').addEventListener('click', () => {
  $<HTMLSelectElement>('mode').value = runtime?.session.mode === 'QUICK_SWEEP' ? 'WIDE_SWEEP' : 'QUICK_SWEEP';
  $<HTMLButtonElement>('start').click();
});

$('finish').addEventListener('click', () => { runtime?.finish(Date.now()); recordTrial(); stopAcquisition(); render(); });
$('cancel').addEventListener('click', () => { runtime?.cancel(Date.now()); stopAcquisition(); camera.stop(); render(); setText('hero', '已取消'); $<HTMLButtonElement>('start').disabled = false; $<HTMLButtonElement>('start').textContent = '重新开始'; $<HTMLButtonElement>('next-sweep').hidden = true; $<HTMLSelectElement>('mode').disabled = false; });
$('download').addEventListener('click', () => {
  if (!runtime) return;
  const blob = new Blob([canonicalManifestJson(runtime.manifest())], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${runtime.session.sweep_id}.json`; link.click();
  setText('message', `Manifest 已导出：${link.download}`); setTimeout(() => URL.revokeObjectURL(link.href), 0);
});
$('copy-evidence').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($<HTMLTextAreaElement>('device-evidence').value); setText('message', `已复制 ${completedTrials.length} 次试验证据。`); }
  catch { setText('message', '无法自动复制；请长按下方证据文本手动复制。'); }
});
$('download-p1').addEventListener('click', () => {
  if (!runtime || !latestP1Analysis) return;
  const output = { context: latestP1Analysis.context, frame_set: latestP1Analysis.frame_set, direction_map: latestP1Analysis.direction_map, view_candidates: latestP1Analysis.view_candidates, descriptors: latestP1Analysis.descriptors, timings: latestP1Analysis.timings };
  const blob = new Blob([JSON.stringify(output, null, 2) + '\n'], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${runtime.session.sweep_id}-p1.json`; link.click();
  setText('message', `P1 标量结果已导出：${link.download}`); setTimeout(() => URL.revokeObjectURL(link.href), 0);
});
$('copy-p1-evidence').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($<HTMLTextAreaElement>('p1-device-evidence').value); setText('message', `已复制 ${p1Trials.length} 次 P1 评估证据。`); }
  catch { setText('message', '无法自动复制；请长按 P1 证据文本手动复制。'); }
});
$('download-p2').addEventListener('click', () => {
  if (!runtime || !latestP2Evidence || !latestP2Correspondence) return;
  const blob = new Blob([JSON.stringify({ correspondence: latestP2Correspondence, spatial_evidence: latestP2Evidence }, null, 2) + '\n'], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${runtime.session.sweep_id}-p2.json`; link.click(); setText('message', `P2 标量结果已导出：${link.download}`); setTimeout(() => URL.revokeObjectURL(link.href), 0);
});
$('copy-p2-evidence').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($<HTMLTextAreaElement>('p2-device-evidence').value); setText('message', `已复制 ${p2Trials.length} 次 P2 评估证据。`); }
  catch { setText('message', '无法自动复制；请长按 P2 证据文本手动复制。'); }
});
window.addEventListener('pagehide', () => { orientation.stop(); camera.stop(); });
