import './style.css';
import { CameraRuntime } from '../camera/camera-runtime.js';
import { DeviceOrientationProvider } from '../motion/device-orientation-provider.js';
import type { OrientationSource } from '../motion/orientation-provider.js';
import { canonicalManifestJson } from '../spatial/scene-sweep-manifest.js';
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
    recordTrial(); stopAcquisition();
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
  const frameMetrics = metricsFromImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), performance.now(), latestYaw);
  candidateBlurScores.push(frameMetrics.blur_score); candidateExposureMeans.push(frameMetrics.exposure_mean);
  runtime.setCameraSourceDimensions(video.videoWidth, video.videoHeight);
  const selected = runtime.observeFrame(frameMetrics);
  telemetry.candidate(performance.now() - started, selected); render();
};

$('start').addEventListener('click', async () => {
  $<HTMLButtonElement>('start').disabled = true; $<HTMLButtonElement>('start').textContent = '启动中…';
  $<HTMLButtonElement>('next-sweep').hidden = true; $<HTMLSelectElement>('mode').disabled = true;
  runtime = new SceneSweepRuntime(currentMode(), `sweep-${Date.now()}`, Date.now());
  telemetry.start(performance.now()); resetTrialTelemetry(); orientation.resetBaseline(); orientationSource = 'DEVICE_ORIENTATION';
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
    runtime?.observeOrientation(sample); render();
  });
  candidateTimer = window.setInterval(sampleFrame, 125);
  setText('message', orientationState === 'ACTIVE' ? '方向传感器已启用；先静止约 3 秒，再缓慢转动。' : '相机可用，但方向传感器不可用。'); render();
});

$('fixture').addEventListener('click', () => {
  clearInterval(fixtureTimer);
  const target = modeTarget();
  runtime = new SceneSweepRuntime(currentMode(), `fixture-${currentMode().toLowerCase()}-${Date.now()}`, Date.now());
  telemetry.start(performance.now()); resetTrialTelemetry(); orientationSource = 'CONTROLLED_FIXTURE';
  $('empty').style.display = 'none'; $('finish').toggleAttribute('disabled', false); $('cancel').toggleAttribute('disabled', false);
  setText('message', '确定性 Fixture：无相机、无网络、无 Provider。');
  let yaw = 0;
  const tick = (): void => {
    if (!runtime || runtime.session.status === 'COMPLETE') { stopAcquisition(); return; }
    latestYaw = yaw; telemetry.orientation();
    const timestamp = Date.now();
    if (firstOrientationAt === null) firstOrientationAt = timestamp;
    if (timestamp - firstOrientationAt <= 3000) initialYawSamples.push(yaw);
    runtime.observeOrientation({ timestamp_ms: timestamp, relative_yaw_deg: yaw, raw_heading_deg: yaw, confidence: 'HIGH', status: 'ACTIVE', screen_orientation: 'PORTRAIT_PRIMARY', source: 'CONTROLLED_FIXTURE' });
    const candidate: FrameMetrics = { timestamp_ms: timestamp, yaw_deg: yaw, width: 640, height: 480, blur_score: 30, exposure_mean: 128, highlight_clipping_ratio: 0, shadow_clipping_ratio: 0, fingerprint: [(yaw % 24) / 24, 1 - (yaw % 24) / 24] };
    const started = performance.now(); const selected = runtime.observeFrame(candidate);
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
window.addEventListener('pagehide', () => { orientation.stop(); camera.stop(); });
