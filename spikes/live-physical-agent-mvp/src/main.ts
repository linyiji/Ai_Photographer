import './style.css';
import { PERCEPTION_CONFIG } from '../perception/config.js';
import { PerceptionRuntime } from '../perception/runtime.js';
import type { PoseMeasurement, StructuredPerceptionState } from '../perception/types.js';
import { ACTION_COPY, CLOSED_LOOP_CONFIG, TARGET_PRESETS } from '../closed-loop/config.js';
import { LocalClosedLoopEngine } from '../closed-loop/engine.js';
import type { ClosedLoopSnapshot } from '../closed-loop/types.js';
import { ScalarTraceRecorder } from '../closed-loop/trace.js';
import { VisualGuidanceProjector } from '../visual-guidance/projector.js';
import type { NormalizedBox, VisualGuidanceState, VisualServoMode } from '../visual-guidance/types.js';
import { projectBoxToCover } from '../visual-guidance/viewport.js';
import { GUIDANCE_THEMES, renderGuidanceTheme } from '../visual-guidance/themes.js';

type FacingMode = 'user' | 'environment';
type PermissionStateLabel = PermissionState | 'not_requested' | 'unsupported' | 'error';

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: #${id}`);
  return element as T;
};

const video = requireElement<HTMLVideoElement>('preview');
const cameraStage = requireElement<HTMLElement>('camera-stage');
const emptyState = requireElement<HTMLDivElement>('empty-state');
const emptyTitle = requireElement<HTMLElement>('empty-title');
const emptyCopy = requireElement<HTMLElement>('empty-copy');
const hud = requireElement<HTMLDivElement>('hud');
const coordinateStrip = requireElement<HTMLDivElement>('coordinate-strip');
const hudToggle = requireElement<HTMLButtonElement>('hud-toggle');
const startButton = requireElement<HTMLButtonElement>('start-button');
const stopButton = requireElement<HTMLButtonElement>('stop-button');
const switchButton = requireElement<HTMLButtonElement>('switch-button');
const message = requireElement<HTMLParagraphElement>('message');
const permissionValue = requireElement<HTMLElement>('permission-value');
const facingValue = requireElement<HTMLElement>('facing-value');
const mirrorValue = requireElement<HTMLElement>('mirror-value');
const cameraCountValue = requireElement<HTMLElement>('camera-count-value');
const sensorCoordinate = requireElement<HTMLElement>('sensor-coordinate');
const previewCoordinate = requireElement<HTMLElement>('preview-coordinate');
const dimensionValue = requireElement<HTMLElement>('dimension-value');
const fpsValue = requireElement<HTMLElement>('fps-value');
const lateValue = requireElement<HTMLElement>('late-value');
const elapsedValue = requireElement<HTMLElement>('elapsed-value');
const sessionIndicator = requireElement<HTMLElement>('session-indicator');
const schedulerBadge = requireElement<HTMLElement>('scheduler-badge');
const capabilityList = requireElement<HTMLDListElement>('capability-list');
const perceptionHud = requireElement<HTMLElement>('perception-hud');
const poseInitButton = requireElement<HTMLButtonElement>('pose-init-button');
const poseMessage = requireElement<HTMLParagraphElement>('pose-message');
const poseModelStatus = requireElement<HTMLElement>('pose-model-status');
const executionMode = requireElement<HTMLElement>('execution-mode');
const guidanceOverlayState = requireElement<HTMLElement>('guidance-overlay-state');
const guidanceOverlayText = requireElement<HTMLElement>('guidance-overlay-text');
const closedLoopHud = requireElement<HTMLElement>('closed-loop-hud');
const targetPreset = requireElement<HTMLSelectElement>('target-preset');
const closedLoopReset = requireElement<HTMLButtonElement>('closed-loop-reset');
const closedLoopArm = requireElement<HTMLButtonElement>('closed-loop-arm');
const closedLoopTrace = requireElement<HTMLButtonElement>('closed-loop-trace');
const guidanceMode = requireElement<HTMLSelectElement>('guidance-mode');
const guidanceGrid = requireElement<HTMLInputElement>('guidance-grid');
const guidanceTheme = requireElement<HTMLSelectElement>('guidance-theme');
const visualOverlay = requireElement<HTMLElement>('visual-servo-overlay');
const visualGrid = requireElement<HTMLElement>('visual-grid');
const acceptableZone = requireElement<HTMLElement>('acceptable-zone');
const targetBox = requireElement<HTMLElement>('target-box');
const subjectBox = requireElement<HTMLElement>('subject-box');
const subjectLockLabel = requireElement<HTMLElement>('subject-lock-label');
const directionVisual = requireElement<HTMLElement>('direction-visual');
const directionIcon = requireElement<HTMLElement>('direction-icon');
const directionLabel = requireElement<HTMLElement>('direction-label');
const stopVisual = requireElement<HTMLElement>('stop-visual');
const readyVisual = requireElement<HTMLElement>('ready-visual');
const stopIcon = requireElement<HTMLElement>('stop-icon');
const readyIcon = requireElement<HTMLElement>('ready-icon');
const trackingVisual = requireElement<HTMLElement>('tracking-visual');
const closedLoopFields = {
  runtimeState: requireElement<HTMLElement>('cl-runtime-state'), ready: requireElement<HTMLElement>('cl-ready'),
  instruction: requireElement<HTMLElement>('cl-instruction'), target: requireElement<HTMLElement>('cl-target'),
  current: requireElement<HTMLElement>('cl-current'), delta: requireElement<HTMLElement>('cl-delta'),
  error: requireElement<HTMLElement>('cl-error'), issue: requireElement<HTMLElement>('cl-issue'),
  issueAge: requireElement<HTMLElement>('cl-issue-age'), action: requireElement<HTMLElement>('cl-action'),
  waiting: requireElement<HTMLElement>('cl-waiting'), verification: requireElement<HTMLElement>('cl-verification'),
  stable: requireElement<HTMLElement>('cl-stable'), countsA: requireElement<HTMLElement>('cl-counts-a'),
  countsB: requireElement<HTMLElement>('cl-counts-b'), countsC: requireElement<HTMLElement>('cl-counts-c'),
  timeTarget: requireElement<HTMLElement>('cl-time-target'), decisions: requireElement<HTMLElement>('cl-decisions'),
  trial: requireElement<HTMLElement>('cl-trial'), episode: requireElement<HTMLElement>('cl-episode'),
  episodeDelta: requireElement<HTMLElement>('cl-episode-delta'), episodeError: requireElement<HTMLElement>('cl-episode-error'),
  episodeFlags: requireElement<HTMLElement>('cl-episode-flags'), terminal: requireElement<HTMLElement>('cl-terminal'),
  subtype: requireElement<HTMLElement>('cl-subtype'), rates: requireElement<HTMLElement>('cl-rates'),
  braking: requireElement<HTMLElement>('cl-braking'), stop: requireElement<HTMLElement>('cl-stop'),
  readySource: requireElement<HTMLElement>('cl-ready-source'), passive: requireElement<HTMLElement>('cl-passive'),
  recovery: requireElement<HTMLElement>('cl-recovery'),
  visualStatus: requireElement<HTMLElement>('cl-visual-status'), visualLock: requireElement<HTMLElement>('cl-visual-lock'),
  visualJitter: requireElement<HTMLElement>('cl-visual-jitter'), visualEntry: requireElement<HTMLElement>('cl-visual-entry'),
  visualLatency: requireElement<HTMLElement>('cl-visual-latency'), visualTiming: requireElement<HTMLElement>('cl-visual-timing'),
  theme: requireElement<HTMLElement>('cl-theme'),
};
const perceptionFields = {
  previewFps: requireElement<HTMLElement>('p-preview-fps'),
  targetHz: requireElement<HTMLElement>('p-target-hz'),
  visionHz: requireElement<HTMLElement>('p-vision-hz'),
  stateHz: requireElement<HTMLElement>('p-state-hz'),
  inferenceCurrent: requireElement<HTMLElement>('p-inference-current'),
  inferenceP50: requireElement<HTMLElement>('p-inference-p50'),
  inferenceP95: requireElement<HTMLElement>('p-inference-p95'),
  frameCount: requireElement<HTMLElement>('p-frame-count'),
  skippedBusy: requireElement<HTMLElement>('p-skipped-busy'),
  confidence: requireElement<HTMLElement>('p-confidence'),
  subjectPresent: requireElement<HTMLElement>('p-subject-present'),
  rawFiltered: requireElement<HTMLElement>('p-raw-filtered'),
  center: requireElement<HTMLElement>('p-center'),
  ratios: requireElement<HTMLElement>('p-ratios'),
  velocity: requireElement<HTMLElement>('p-velocity'),
  velocityScale: requireElement<HTMLElement>('p-velocity-scale'),
  stable: requireElement<HTMLElement>('p-stable'),
  measurementAge: requireElement<HTMLElement>('p-measurement-age'),
  lossReacquire: requireElement<HTMLElement>('p-loss-reacquire'),
  validLandmarks: requireElement<HTMLElement>('p-valid-landmarks'),
  subjectRatio: requireElement<HTMLElement>('p-subject-ratio'),
  memory: requireElement<HTMLElement>('p-memory'),
};

let stream: MediaStream | null = null;
let requestedFacingMode: FacingMode = 'environment';
let activeFacingMode: FacingMode | 'unknown' = 'unknown';
let permissionState: PermissionStateLabel = 'not_requested';
let sessionStartedAt = 0;
let frameHandle: number | null = null;
let scheduler: 'rvfc' | 'raf-fallback' | 'none' = 'none';
let lastFrameAt = 0;
let frameIntervals: number[] = [];
let lateFrames = 0;
let droppedFrames = 0;
let lastPresentedFrames: number | null = null;
let elapsedTimer: number | null = null;
let cameraCount: number | null = null;
let latestPerceptionState: StructuredPerceptionState | null = null;
let latestRawMeasurement: PoseMeasurement | null = null;
let latestClosedLoop: ClosedLoopSnapshot | null = null;
let latestVisualGuidance: VisualGuidanceState | null = null;
let displayedActionCopy: string | null = null;
let displayedActionUntilMs = 0;

const simulatedUnsupported = new URLSearchParams(window.location.search).get('simulateUnsupported') === '1';
const supportsMediaDevices = !simulatedUnsupported && Boolean(navigator.mediaDevices?.getUserMedia);

const formatMetric = (value: number | null | undefined, digits = 3): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(digits);

let currentTarget = TARGET_PRESETS[0];
const closedLoop = new LocalClosedLoopEngine(currentTarget);
const scalarTrace = new ScalarTraceRecorder();
const visualProjector = new VisualGuidanceProjector();

const perceptionRuntime = new PerceptionRuntime({
  onStatus: (status, mode, text) => {
    poseModelStatus.textContent = `MODEL · ${status}`;
    executionMode.textContent = `MODE · ${mode}`;
    poseMessage.textContent = text;
    poseMessage.dataset.kind = status === 'ERROR' || status === 'MISSING' ? 'error' : 'info';
    poseInitButton.disabled = status === 'LOADING' || status === 'READY';
  },
  onState: (state, rawMeasurement) => {
    latestPerceptionState = state;
    latestRawMeasurement = rawMeasurement;
    latestClosedLoop = closedLoop.update(state);
    latestVisualGuidance = visualProjector.update(state, latestClosedLoop, rawMeasurement, { mode: guidanceMode.value as VisualServoMode, grid: guidanceGrid.checked, now: performance.now() });
    scalarTrace.append(state, latestClosedLoop, latestVisualGuidance, guidanceTheme.value);
    if (latestClosedLoop.instruction && latestClosedLoop.instruction.action !== 'HOLD') {
      displayedActionCopy = latestClosedLoop.instruction.copy_zh;
      displayedActionUntilMs = state.timestamp_ms + 700;
    }
    renderPerceptionState();
    renderClosedLoop();
    renderVisualGuidance();
  },
  onError: (text) => {
    poseMessage.textContent = text;
    poseMessage.dataset.kind = 'error';
  },
});

function setMessage(text: string, kind: 'info' | 'error' = 'info'): void {
  message.textContent = text;
  message.dataset.kind = kind;
}

function setPermission(next: PermissionStateLabel): void {
  permissionState = next;
  permissionValue.textContent = next.toUpperCase();
}

function formatElapsed(milliseconds: number): string {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function updateCoordinateState(): void {
  const mirrored = activeFacingMode === 'user';
  video.classList.toggle('is-mirrored', mirrored);
  mirrorValue.textContent = mirrored ? 'ON · PREVIEW ONLY' : 'OFF';
  sensorCoordinate.textContent = 'RAW · NON-MIRRORED';
  previewCoordinate.textContent = mirrored ? 'MIRRORED X-AXIS' : 'NON-MIRRORED';
  facingValue.textContent = activeFacingMode.toUpperCase();
}

function applyProjectedBox(element: HTMLElement, box: NormalizedBox | null): void {
  element.classList.toggle('is-visible', Boolean(box));
  if (!box) return;
  const rect = cameraStage.getBoundingClientRect();
  const projected = projectBoxToCover(box, { container_width: rect.width, container_height: rect.height, source_width: video.videoWidth || rect.width, source_height: video.videoHeight || rect.height, mirrored: activeFacingMode === 'user' });
  element.style.left = `${projected.left}px`; element.style.top = `${projected.top}px`; element.style.width = `${projected.width}px`; element.style.height = `${projected.height}px`;
}

function renderVisualGuidance(): void {
  const visual = latestVisualGuidance;
  visualOverlay.dataset.mode = guidanceMode.value; cameraStage.dataset.guidanceMode = guidanceMode.value;
  if (!visual) {
    visualOverlay.dataset.status = 'LOST'; for (const element of [acceptableZone,targetBox,subjectBox,directionVisual,stopVisual,readyVisual]) element.classList.remove('is-visible');
    visualGrid.classList.toggle('is-visible', guidanceGrid.checked); trackingVisual.textContent = '正在寻找人物'; return;
  }
  visualOverlay.dataset.status = visual.visual_status; visualGrid.classList.toggle('is-visible', visual.grid_enabled);
  const renderedTheme = renderGuidanceTheme(visual,guidanceTheme.value); const defaultTheme = renderGuidanceTheme(visual,'DEFAULT'); const semanticDiff = renderedTheme.semantic_signature===defaultTheme.semantic_signature?0:1;
  visualOverlay.dataset.theme = renderedTheme.theme.theme_id; visualOverlay.style.setProperty('--guide',renderedTheme.theme.visual_tokens.guide); visualOverlay.style.setProperty('--target',renderedTheme.theme.visual_tokens.target); visualOverlay.style.setProperty('--near',renderedTheme.theme.visual_tokens.near); visualOverlay.style.setProperty('--danger',renderedTheme.theme.visual_tokens.danger); visualOverlay.style.setProperty('--line',renderedTheme.theme.visual_tokens.line_width); visualOverlay.style.setProperty('--corner',renderedTheme.theme.visual_tokens.corner_radius);
  const zoneBox: NormalizedBox = { left: visual.acceptable_zone.left, top: visual.acceptable_zone.top, width: visual.acceptable_zone.right-visual.acceptable_zone.left, height: visual.acceptable_zone.bottom-visual.acceptable_zone.top, center_x:(visual.acceptable_zone.left+visual.acceptable_zone.right)/2, center_y:(visual.acceptable_zone.top+visual.acceptable_zone.bottom)/2 };
  applyProjectedBox(acceptableZone, zoneBox); applyProjectedBox(targetBox, visual.target_box); applyProjectedBox(subjectBox, visual.tracked_subject_box);
  subjectLockLabel.textContent = visual.tracking_status === 'LOCKED' ? '人物已锁定' : visual.tracking_status === 'HELD' ? '人物暂时遮挡' : '人物锁定中';
  const direction = visual.direction_hint; const directionPresentation = direction === 'MOVE_LEFT' ? ['←','往左一点'] : direction === 'MOVE_RIGHT' ? ['→','往右一点'] : direction === 'MOVE_CLOSER' ? ['⊕','靠近目标框'] : direction === 'MOVE_FARTHER' ? ['⊖','退入目标框'] : null;
  directionVisual.classList.toggle('is-visible', Boolean(directionPresentation) && !visual.braking && !visual.ready); if (directionPresentation) { directionIcon.textContent=renderedTheme.direction_glyph??directionPresentation[0]; directionLabel.textContent=directionPresentation[1]; }
  stopIcon.textContent=renderedTheme.stop_glyph; readyIcon.textContent=renderedTheme.ready_glyph;
  stopVisual.classList.toggle('is-visible', visual.braking && !visual.ready); readyVisual.classList.toggle('is-visible', visual.ready);
  trackingVisual.textContent = visual.tracking_status === 'LOCKED' ? (visual.inside_target ? '已进入目标区域' : visual.near_target ? '接近目标区域' : renderedTheme.lock_ornament) : visual.tracking_status === 'HELD' ? '短暂丢失 · 保持锁定' : visual.tracking_status === 'UNLOCKED' ? '正在寻找人物' : '正在锁定人物';
  closedLoopFields.theme.textContent=`${renderedTheme.theme.theme_id} / ${semanticDiff}`;
}

function renderCapabilities(): void {
  const capabilities: Array<[string, string]> = [
    ['Secure context', window.isSecureContext ? 'YES' : 'NO'],
    ['MediaDevices API', supportsMediaDevices ? 'YES' : 'NO'],
    ['Frame callback', typeof video.requestVideoFrameCallback === 'function' ? 'YES' : 'NO · RAF FALLBACK'],
    ['Touch input', navigator.maxTouchPoints > 0 ? `YES · ${navigator.maxTouchPoints} POINTS MAX` : 'NO'],
    ['Viewport', `${window.innerWidth} × ${window.innerHeight} CSS PX`],
    ['Pixel ratio', String(window.devicePixelRatio)],
    ['Orientation', screen.orientation?.type ?? 'API UNAVAILABLE'],
    ['Network state', navigator.onLine ? 'ONLINE' : 'OFFLINE'],
    ['Frame storage/upload', 'NONE / 0']
  ];

  capabilityList.replaceChildren(
    ...capabilities.map(([label, value]) => {
      const wrapper = document.createElement('div');
      const term = document.createElement('dt');
      const detail = document.createElement('dd');
      term.textContent = label;
      detail.textContent = value;
      wrapper.append(term, detail);
      return wrapper;
    })
  );
}

function renderPerceptionState(): void {
  const state = latestPerceptionState;
  const subject = state?.subject;
  perceptionFields.subjectPresent.textContent = String(subject?.present ?? false).toUpperCase();
  perceptionFields.confidence.textContent = `${formatMetric(subject?.confidence)} / ${formatMetric(subject?.pose_presence)}`;
  perceptionFields.rawFiltered.textContent = latestRawMeasurement && subject
    ? `${formatMetric(latestRawMeasurement.center_x)},${formatMetric(latestRawMeasurement.center_y)} / ${formatMetric(subject.center_x)},${formatMetric(subject.center_y)}`
    : '— / —';
  perceptionFields.center.textContent = `${formatMetric(subject?.center_x)} / ${formatMetric(subject?.center_y)}`;
  perceptionFields.ratios.textContent = `${formatMetric(subject?.width_ratio)} / ${formatMetric(subject?.height_ratio)}`;
  perceptionFields.velocity.textContent = `${formatMetric(subject?.velocity_x)} / ${formatMetric(subject?.velocity_y)}`;
  perceptionFields.velocityScale.textContent = formatMetric(subject?.velocity_scale);
  perceptionFields.stable.textContent = String(subject?.stable ?? false).toUpperCase();
  perceptionFields.measurementAge.textContent = state?.measurement_age_ms === null || state?.measurement_age_ms === undefined
    ? '—'
    : `${state.measurement_age_ms.toFixed(0)} ms`;
  perceptionFields.lossReacquire.textContent = `${state?.subject_loss_count ?? 0} / ${state?.reacquisition_count ?? 0}`;
  perceptionFields.validLandmarks.textContent = String(subject?.valid_landmark_count ?? 0);
}

function renderPerceptionTelemetry(): void {
  const previewFps = Number.parseFloat(fpsValue.textContent ?? '0') || 0;
  const telemetry = perceptionRuntime.snapshot(previewFps);
  perceptionFields.previewFps.textContent = telemetry.preview_fps_avg.toFixed(1);
  perceptionFields.targetHz.textContent = telemetry.vision_target_hz.toFixed(1);
  perceptionFields.visionHz.textContent = telemetry.vision_hz_avg.toFixed(1);
  perceptionFields.stateHz.textContent = telemetry.state_hz_avg.toFixed(1);
  perceptionFields.inferenceCurrent.textContent = `${telemetry.inference_ms_current.toFixed(1)} ms`;
  perceptionFields.inferenceP50.textContent = `${telemetry.inference_ms_p50.toFixed(1)} ms`;
  perceptionFields.inferenceP95.textContent = `${telemetry.inference_ms_p95.toFixed(1)} ms`;
  perceptionFields.frameCount.textContent = `${telemetry.scheduled_frames} / ${telemetry.processed_frames}`;
  perceptionFields.skippedBusy.textContent = String(telemetry.skipped_busy_frames);
  perceptionFields.subjectRatio.textContent = telemetry.subject_detected_ratio.toFixed(3);
  perceptionFields.memory.textContent = telemetry.memory_mb === null ? 'UNAVAILABLE' : `${telemetry.memory_mb.toFixed(1)} MB`;
}

function renderClosedLoop(): void {
  const snapshot = latestClosedLoop;
  const target = snapshot?.target ?? currentTarget;
  closedLoopFields.target.textContent = `${formatMetric(target.center_x)} / ${formatMetric(target.center_y)} / ${formatMetric(target.height_ratio)}`;
  if (!snapshot) {
    closedLoopFields.runtimeState.textContent = 'STATE · IDLE'; closedLoopFields.ready.textContent = 'READY · FALSE';
    closedLoopFields.instruction.textContent = '等待本机状态输入';
    guidanceOverlayState.textContent = 'P2 LOCAL · IDLE';
    guidanceOverlayText.textContent = '启动相机后开始本机引导';
    for (const field of [closedLoopFields.current, closedLoopFields.delta, closedLoopFields.error]) field.textContent = '— / — / —';
    closedLoopFields.issue.textContent = '— / —'; closedLoopFields.issueAge.textContent = '0 ms';
    closedLoopFields.action.textContent = '— / —'; closedLoopFields.waiting.textContent = `0 / ${CLOSED_LOOP_CONFIG.instruction_gap_ms} ms`;
    closedLoopFields.verification.textContent = 'NONE'; closedLoopFields.stable.textContent = 'FALSE / 0 ms';
    closedLoopFields.countsA.textContent = '0 / 0 / 0 / 0'; closedLoopFields.countsB.textContent = '0 / 0';
    closedLoopFields.countsC.textContent = '0 / 0'; closedLoopFields.timeTarget.textContent = '—'; closedLoopFields.decisions.textContent = '0';
    closedLoopFields.trial.textContent = 'DISARMED / —'; closedLoopFields.episode.textContent = '— / —';
    closedLoopFields.episodeDelta.textContent = '— / —'; closedLoopFields.episodeError.textContent = '— / —';
    closedLoopFields.episodeFlags.textContent = 'FALSE / FALSE / FALSE'; closedLoopFields.terminal.textContent = '— / —';
    closedLoopFields.subtype.textContent = '—'; closedLoopFields.rates.textContent = '— / — / —';
    closedLoopFields.braking.textContent = 'FALSE / —'; closedLoopFields.stop.textContent = 'FALSE / 0';
    closedLoopFields.readySource.textContent = 'FALSE / —'; closedLoopFields.passive.textContent = '0 ms';
    closedLoopFields.recovery.textContent = '0 ms';
    closedLoopFields.visualStatus.textContent = `LOST / ${guidanceMode.value}`; closedLoopFields.visualLock.textContent = 'UNLOCKED / 0.000';
    closedLoopFields.visualJitter.textContent = '0.0000 / 0.0000'; closedLoopFields.visualEntry.textContent = '0 / 0';
    closedLoopFields.visualLatency.textContent = '0 / 0 ms'; closedLoopFields.visualTiming.textContent = '— / —';
    closedLoopFields.theme.textContent = `${guidanceTheme.value||'DEFAULT'} / 0`;
    return;
  }
  const subject = snapshot.current; const metrics = snapshot.metrics;
  closedLoopFields.runtimeState.textContent = `STATE · ${snapshot.runtime_state}`;
  closedLoopReset.textContent = snapshot.runtime_state === 'LOCAL_RECOVERY_REQUIRED' ? '继续本机引导' : '重置本机引导';
  closedLoopFields.ready.textContent = `READY · ${String(snapshot.ready).toUpperCase()}`;
  const presentation = closedLoopPresentation(snapshot);
  closedLoopFields.instruction.textContent = presentation.text;
  guidanceOverlayState.textContent = presentation.state;
  guidanceOverlayText.textContent = presentation.text;
  closedLoopFields.current.textContent = `${formatMetric(subject.center_x)} / ${formatMetric(subject.center_y)} / ${formatMetric(subject.height_ratio)}`;
  closedLoopFields.delta.textContent = `${formatMetric(snapshot.delta.x.delta)} / ${formatMetric(snapshot.delta.y.delta)} / ${formatMetric(snapshot.delta.scale.delta)}`;
  closedLoopFields.error.textContent = `${formatMetric(snapshot.delta.x.normalized_error)} / ${formatMetric(snapshot.delta.y.normalized_error)} / ${formatMetric(snapshot.delta.scale.normalized_error)}`;
  closedLoopFields.issue.textContent = `${snapshot.issue?.kind ?? 'NONE'} / ${formatMetric(snapshot.issue?.score, 2)}`;
  closedLoopFields.issueAge.textContent = `${snapshot.issue_age_ms.toFixed(0)} ms`;
  closedLoopFields.action.textContent = `${snapshot.active_action ?? 'NONE'} / ${snapshot.action_age_ms === null ? '—' : `${snapshot.action_age_ms.toFixed(0)} ms`}`;
  closedLoopFields.waiting.textContent = `${snapshot.waiting_remaining_ms.toFixed(0)} / ${CLOSED_LOOP_CONFIG.instruction_gap_ms} ms`;
  closedLoopFields.verification.textContent = snapshot.verification;
  closedLoopFields.stable.textContent = `${String(subject.stable).toUpperCase()} / ${snapshot.stable_duration_ms.toFixed(0)} ms`;
  const episode = snapshot.episode;
  closedLoopFields.trial.textContent = `${snapshot.trial_state} / ${snapshot.trial_elapsed_ms === null ? '—' : `${(snapshot.trial_elapsed_ms / 1000).toFixed(1)} s`}`;
  closedLoopFields.episode.textContent = `${episode?.episode_id ?? '—'} / ${episode?.state ?? '—'}`;
  closedLoopFields.episodeDelta.textContent = `${formatMetric(episode?.baseline_signed_delta)} / ${formatMetric(episode?.current_signed_delta)}`;
  closedLoopFields.episodeError.textContent = `${formatMetric(episode?.best_normalized_error)} / ${formatMetric(episode?.final_settled_error)}`;
  closedLoopFields.episodeFlags.textContent = `${String(Boolean(episode?.motion_detected_at)).toUpperCase()} / ${String(episode?.target_crossed ?? false).toUpperCase()} / ${String(episode?.entered_deadband ?? false).toUpperCase()}`;
  closedLoopFields.terminal.textContent = `${episode?.terminal_outcome ?? '—'} / ${metrics.correction_success_rate === null ? '—' : `${(metrics.correction_success_rate * 100).toFixed(1)}%`}`;
  closedLoopFields.subtype.textContent = episode?.no_effect_subtype ?? '—';
  closedLoopFields.rates.textContent = `${metrics.action_compliance_rate === null ? '—' : `${(metrics.action_compliance_rate*100).toFixed(1)}%`} / ${metrics.axis_completion_rate === null ? '—' : `${(metrics.axis_completion_rate*100).toFixed(1)}%`} / ${metrics.correction_success_rate === null ? '—' : `${(metrics.correction_success_rate*100).toFixed(1)}%`}`;
  closedLoopFields.braking.textContent = `${String(snapshot.near_target_corridor).toUpperCase()} / ${formatMetric(snapshot.predicted_delta)}`;
  closedLoopFields.stop.textContent = `${String(episode?.stop_cue_issued_at !== null && episode?.stop_cue_issued_at !== undefined).toUpperCase()} / ${metrics.stop_cue_count}`;
  closedLoopFields.readySource.textContent = `${String(snapshot.geometry_satisfied).toUpperCase()} / ${snapshot.ready_source ?? '—'}`;
  closedLoopFields.passive.textContent = `${snapshot.passive_confirmation_remaining_ms.toFixed(0)} ms`;
  closedLoopFields.recovery.textContent = `${snapshot.local_recovery_remaining_ms.toFixed(0)} ms`;
  const visual = latestVisualGuidance;
  closedLoopFields.visualStatus.textContent = `${visual?.visual_status ?? 'LOST'} / ${visual?.overlay_mode ?? guidanceMode.value}`;
  closedLoopFields.visualLock.textContent = `${visual?.tracking_status ?? 'UNLOCKED'} / ${(visual?.tracking_confidence ?? 0).toFixed(3)}`;
  closedLoopFields.visualJitter.textContent = `${(visual?.metrics.raw_box_jitter ?? 0).toFixed(4)} / ${(visual?.metrics.stabilized_box_jitter ?? 0).toFixed(4)}`;
  closedLoopFields.visualLatency.textContent = `${(visual?.metrics.visual_projection_latency_ms ?? 0).toFixed(0)} / ${(visual?.projection_age ?? 0).toFixed(0)} ms`;
  closedLoopFields.visualTiming.textContent = `${visual?.metrics.target_crossing_delay_ms === null || visual?.metrics.target_crossing_delay_ms === undefined ? '—' : `${visual.metrics.target_crossing_delay_ms.toFixed(0)} ms`} / ${visual?.metrics.time_inside_target_before_ready_ms === null || visual?.metrics.time_inside_target_before_ready_ms === undefined ? '—' : `${visual.metrics.time_inside_target_before_ready_ms.toFixed(0)} ms`}`;
  closedLoopFields.visualEntry.textContent = `${visual?.metrics.target_box_entry_count ?? 0} / ${visual?.metrics.target_box_exit_count ?? 0}`;
  closedLoopFields.countsA.textContent = `${metrics.ordinary_instruction_count} / ${metrics.stop_cue_count} / ${metrics.hold_count} / ${metrics.successful_corrections}`;
  closedLoopFields.countsB.textContent = `${metrics.improving_count} / ${metrics.no_effect_count}`;
  closedLoopFields.countsC.textContent = `${metrics.wrong_direction_count} / ${metrics.oscillation_count}`;
  closedLoopFields.timeTarget.textContent = metrics.time_to_target_ms === null ? '—' : `${(metrics.time_to_target_ms / 1000).toFixed(1)} s`;
  closedLoopFields.decisions.textContent = String(metrics.local_decisions);
}

function closedLoopPresentation(snapshot: ClosedLoopSnapshot): { state: string; text: string } {
  if (snapshot.runtime_state === 'SEARCHING') return { state: 'P2 LOCAL · SEARCHING', text: '请进入画面' };
  if (snapshot.runtime_state === 'INSTRUCTING' && snapshot.instruction) {
    return { state: `P2 LOCAL · ${snapshot.issue?.kind ?? 'ACTION'}`, text: snapshot.instruction.copy_zh };
  }
  if (displayedActionCopy && snapshot.timestamp_ms <= displayedActionUntilMs) {
    return { state: `P2 LOCAL · ACTION · ${snapshot.active_action ?? 'LOCAL'}`, text: displayedActionCopy };
  }
  if (snapshot.runtime_state === 'WAITING_FOR_MOTION' || snapshot.runtime_state === 'TRACKING_MOTION') {
    return snapshot.current.stable
      ? { state: `P2 LOCAL · VERIFY IN ${snapshot.waiting_remaining_ms.toFixed(0)} ms`, text: '保持不动 · 正在确认' }
      : { state: 'P2 LOCAL · WAITING / SILENT', text: '移动中 · 暂停新指令' };
  }
  if (snapshot.runtime_state === 'BRAKING') return { state: 'P2 LOCAL · BRAKING', text: ACTION_COPY.STOP_HERE };
  if (snapshot.runtime_state === 'VERIFYING') return { state: 'P2 LOCAL · VERIFYING', text: '正在确认调整结果' };
  if (snapshot.runtime_state === 'SATISFIED_PENDING_CONFIRMATION') return { state: `P2 LOCAL · PASSIVE CONFIRM ${snapshot.passive_confirmation_remaining_ms.toFixed(0)} ms`, text: '保持不动 · 正在确认' };
  if (snapshot.runtime_state === 'READY') return { state: 'P2 LOCAL · READY', text: ACTION_COPY.HOLD };
  if (snapshot.runtime_state === 'LOCAL_RECOVERY_REQUIRED') return { state: `P2 LOCAL · AUTO RECOVERY ${snapshot.local_recovery_remaining_ms.toFixed(0)} ms`, text: '连续调整未完成 · 请站稳，系统将自动继续；也可点击“继续本机引导”' };
  if (snapshot.issue?.kind === 'X_POSITION') return { state: `P2 LOCAL · CONFIRM X ${snapshot.issue_age_ms.toFixed(0)}/${CLOSED_LOOP_CONFIG.issue_persistence_ms} ms`, text: '正在确认水平位置' };
  if (snapshot.issue?.kind === 'SCALE') return { state: `P2 LOCAL · CONFIRM SCALE ${snapshot.issue_age_ms.toFixed(0)}/${CLOSED_LOOP_CONFIG.issue_persistence_ms} ms`, text: '正在确认距离' };
  if (snapshot.issue?.kind === 'Y_POSITION') return { state: 'P2 LOCAL · Y DEFERRED', text: '垂直位置仅观测' };
  return { state: `P2 LOCAL · ${snapshot.runtime_state}`, text: '保持不动 · 正在分析' };
}

async function readPermissionState(): Promise<void> {
  if (!navigator.permissions?.query || !supportsMediaDevices) return;
  try {
    const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
    if (permissionState === 'not_requested') setPermission(result.state);
    result.addEventListener('change', () => setPermission(result.state));
  } catch {
    // Safari does not expose camera through the Permissions API. Actual getUserMedia
    // results remain the permission authority in that case.
  }
}

async function refreshCameraInventory(): Promise<void> {
  if (!navigator.mediaDevices?.enumerateDevices || !supportsMediaDevices) {
    cameraCount = 0;
  } else {
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameraCount = devices.filter((device) => device.kind === 'videoinput').length;
  }
  cameraCountValue.textContent = String(cameraCount);
  switchButton.disabled = !stream || cameraCount < 2;
  switchButton.textContent = cameraCount < 2 ? '单镜头模式' : '切换前 / 后摄';
}

function resetMetrics(): void {
  lastFrameAt = 0;
  frameIntervals = [];
  lateFrames = 0;
  droppedFrames = 0;
  lastPresentedFrames = null;
  fpsValue.textContent = '0.0';
  lateValue.textContent = '0 / 0';
  elapsedValue.textContent = '00:00';
}

function observeFrame(now: number, presentedFrames?: number): void {
  if (lastFrameAt > 0) {
    const interval = now - lastFrameAt;
    frameIntervals.push(interval);
    if (frameIntervals.length > 90) frameIntervals.shift();
    if (interval > 50) lateFrames += 1;
    const average = frameIntervals.reduce((sum, value) => sum + value, 0) / frameIntervals.length;
    fpsValue.textContent = (1000 / average).toFixed(1);
  }

  if (presentedFrames !== undefined && lastPresentedFrames !== null) {
    droppedFrames += Math.max(0, presentedFrames - lastPresentedFrames - 1);
  }
  if (presentedFrames !== undefined) lastPresentedFrames = presentedFrames;

  lastFrameAt = now;
  lateValue.textContent = `${lateFrames} / ${droppedFrames}`;
  if (stream) perceptionRuntime.sample(video, now);
}

function startFrameScheduler(): void {
  stopFrameScheduler();

  if (typeof video.requestVideoFrameCallback === 'function') {
    scheduler = 'rvfc';
    schedulerBadge.textContent = 'SCHEDULER · VIDEO FRAME CALLBACK';
    const onVideoFrame: VideoFrameRequestCallback = (now, metadata) => {
      if (!stream) return;
      observeFrame(now, metadata.presentedFrames);
      frameHandle = video.requestVideoFrameCallback?.(onVideoFrame) ?? null;
    };
    frameHandle = video.requestVideoFrameCallback(onVideoFrame);
    return;
  }

  scheduler = 'raf-fallback';
  schedulerBadge.textContent = 'SCHEDULER · RAF FALLBACK @ 30HZ';
  let lastSampleAt = 0;
  const onAnimationFrame = (now: number) => {
    if (!stream) return;
    if (now - lastSampleAt >= 1000 / 30) {
      observeFrame(now);
      lastSampleAt = now;
    }
    frameHandle = window.requestAnimationFrame(onAnimationFrame);
  };
  frameHandle = window.requestAnimationFrame(onAnimationFrame);
}

function stopFrameScheduler(): void {
  if (frameHandle !== null) {
    if (scheduler === 'rvfc') video.cancelVideoFrameCallback?.(frameHandle);
    if (scheduler === 'raf-fallback') window.cancelAnimationFrame(frameHandle);
  }
  frameHandle = null;
  scheduler = 'none';
  schedulerBadge.textContent = 'SCHEDULER · —';
}

function startElapsedTimer(): void {
  if (elapsedTimer !== null) window.clearInterval(elapsedTimer);
  elapsedTimer = window.setInterval(() => {
    elapsedValue.textContent = formatElapsed(performance.now() - sessionStartedAt);
    renderPerceptionTelemetry();
  }, 250);
}

function stopElapsedTimer(): void {
  if (elapsedTimer !== null) window.clearInterval(elapsedTimer);
  elapsedTimer = null;
}

function stopCamera(options: { preserveMessage?: boolean } = {}): void {
  stopFrameScheduler();
  stopElapsedTimer();
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
  video.srcObject = null;
  video.classList.remove('is-active', 'is-mirrored');
  emptyState.hidden = false;
  emptyTitle.textContent = '相机尚未启动';
  emptyCopy.textContent = '点击下方按钮后才会请求摄像头权限';
  sessionIndicator.textContent = 'IDLE';
  startButton.disabled = false;
  stopButton.disabled = true;
  switchButton.disabled = true;
  activeFacingMode = 'unknown';
  dimensionValue.textContent = '—';
  updateCoordinateState();
  perceptionRuntime.resetSession();
  closedLoop.reset();
  latestPerceptionState = null;
  latestRawMeasurement = null;
  latestClosedLoop = null;
  latestVisualGuidance = null;
  visualProjector.reset();
  displayedActionCopy = null;
  displayedActionUntilMs = 0;
  renderPerceptionState();
  renderPerceptionTelemetry();
  renderClosedLoop();
  renderVisualGuidance();
  if (!options.preserveMessage) setMessage('相机会话已停止；所有媒体轨道已释放。');
}

function describeCameraError(error: unknown): string {
  if (!(error instanceof DOMException)) return '相机启动失败：未知错误。';
  switch (error.name) {
    case 'NotAllowedError':
      return '相机权限被拒绝。请在浏览器站点设置中允许后重试。';
    case 'NotFoundError':
      return '未发现可用摄像头。';
    case 'NotReadableError':
      return '摄像头当前不可读取，可能正被其他应用占用。';
    case 'OverconstrainedError':
      return '所选前/后摄约束不可用，将保留可重试状态。';
    case 'SecurityError':
      return '浏览器安全策略阻止了相机访问；手机测试必须使用可信 HTTPS。';
    default:
      return `相机启动失败：${error.name}。`;
  }
}

async function startCamera(facingMode: FacingMode): Promise<void> {
  if (!supportsMediaDevices) {
    setPermission('unsupported');
    emptyTitle.textContent = '此环境不支持摄像头';
    emptyCopy.textContent = '需要支持 MediaDevices.getUserMedia 的安全浏览器环境';
    setMessage('Camera API 不可用；已展示受控错误路径。', 'error');
    return;
  }

  if (!window.isSecureContext) {
    setPermission('error');
    setMessage('当前不是安全上下文。手机必须通过可信 HTTPS 打开。', 'error');
    return;
  }

  startButton.disabled = true;
  switchButton.disabled = true;
  setMessage(`正在请求${facingMode === 'user' ? '前置' : '后置'}摄像头…`);
  stream?.getTracks().forEach((track) => track.stop());
  perceptionRuntime.resetSession();
  visualProjector.reset(); latestVisualGuidance = null;

  try {
    const nextStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 }
      }
    });

    stream = nextStream;
    video.srcObject = stream;
    await video.play();

    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();
    const reportedFacing = settings?.facingMode;
    activeFacingMode = reportedFacing === 'user' || reportedFacing === 'environment' ? reportedFacing : facingMode;
    requestedFacingMode = activeFacingMode;
    setPermission('granted');
    updateCoordinateState();
    dimensionValue.textContent = `${video.videoWidth} × ${video.videoHeight}`;
    video.classList.add('is-active');
    emptyState.hidden = true;
    sessionIndicator.textContent = 'LIVE';
    startButton.disabled = true;
    stopButton.disabled = false;
    resetMetrics();
    sessionStartedAt = performance.now();
    startElapsedTimer();
    startFrameScheduler();
    void perceptionRuntime.initialize().catch(() => {
      // Status and the explicit model/runtime error are rendered by the runtime.
    });
    await refreshCameraInventory();
    setMessage(`${activeFacingMode === 'user' ? '前置' : '后置'}摄像头已启动；画面仅在本机预览。`);

    videoTrack?.addEventListener('ended', () => {
      if (stream) stopCamera({ preserveMessage: true });
      setMessage('摄像头媒体轨道已结束。', 'error');
    }, { once: true });
  } catch (error) {
    setPermission(error instanceof DOMException && error.name === 'NotAllowedError' ? 'denied' : 'error');
    stopCamera({ preserveMessage: true });
    setMessage(describeCameraError(error), 'error');
  }
}

startButton.addEventListener('click', () => void startCamera(requestedFacingMode));
stopButton.addEventListener('click', () => stopCamera());
switchButton.addEventListener('click', () => {
  requestedFacingMode = activeFacingMode === 'user' ? 'environment' : 'user';
  void startCamera(requestedFacingMode);
});

hudToggle.addEventListener('click', () => {
  const hidden = !hud.hidden;
  hud.hidden = hidden;
  coordinateStrip.hidden = hidden;
  perceptionHud.hidden = hidden;
  closedLoopHud.hidden = hidden;
  hudToggle.textContent = hidden ? '显示 HUD' : '隐藏 HUD';
  hudToggle.setAttribute('aria-pressed', String(!hidden));
});

poseInitButton.addEventListener('click', () => {
  void perceptionRuntime.initialize().catch(() => {
    // Status and the explicit model/runtime error are rendered by the runtime.
  });
});

targetPreset.addEventListener('change', () => {
  const selected = TARGET_PRESETS.find((preset) => preset.id === targetPreset.value) ?? TARGET_PRESETS[0];
  currentTarget = selected; closedLoop.setTarget(selected); latestClosedLoop = null;
  visualProjector.reset(); latestVisualGuidance = null;
  displayedActionCopy = null; displayedActionUntilMs = 0; renderClosedLoop(); renderVisualGuidance();
});

guidanceMode.addEventListener('change',()=>{ if(latestPerceptionState&&latestClosedLoop) latestVisualGuidance=visualProjector.update(latestPerceptionState,latestClosedLoop,latestRawMeasurement,{mode:guidanceMode.value as VisualServoMode,grid:guidanceGrid.checked,now:performance.now()}); renderVisualGuidance(); renderClosedLoop(); });
guidanceGrid.addEventListener('change',()=>{ if(latestPerceptionState&&latestClosedLoop) latestVisualGuidance=visualProjector.update(latestPerceptionState,latestClosedLoop,latestRawMeasurement,{mode:guidanceMode.value as VisualServoMode,grid:guidanceGrid.checked,now:performance.now()}); renderVisualGuidance(); });
guidanceTheme.addEventListener('change',()=>renderVisualGuidance());

closedLoopReset.addEventListener('click', () => {
  if (latestClosedLoop?.runtime_state === 'LOCAL_RECOVERY_REQUIRED' && closedLoop.resumeAfterLocalRecovery(performance.now())) {
    displayedActionCopy = null; displayedActionUntilMs = 0;
    setMessage('已继续本机引导；历史 Episode 与标量 Trace 保留，不会重复编号。');
    return;
  }
  closedLoop.reset(); latestClosedLoop = null; displayedActionCopy = null; displayedActionUntilMs = 0;
  visualProjector.reset(); latestVisualGuidance = null; renderClosedLoop(); renderVisualGuidance();
});
closedLoopArm.addEventListener('click', () => {
  closedLoop.armTrial(performance.now()); scalarTrace.clear(); latestClosedLoop = null; displayedActionCopy = null; displayedActionUntilMs = 0;
  visualProjector.reset(); latestVisualGuidance = null; renderClosedLoop(); renderVisualGuidance(); setMessage('试验已 ARM；请从目标外位置开始，首个普通指令发出时开始计时。');
});
closedLoopTrace.addEventListener('click', () => {
  const blob = new Blob([scalarTrace.json()], { type: 'application/json' }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `live-p2-scalar-trace-${Date.now()}.json`; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
});

window.addEventListener('resize', renderCapabilities);
screen.orientation?.addEventListener('change', renderCapabilities);
window.addEventListener('beforeunload', () => {
  stopCamera({ preserveMessage: true });
  perceptionRuntime.close();
});

renderCapabilities();
updateCoordinateState();
for (const preset of TARGET_PRESETS) targetPreset.add(new Option(preset.label, preset.id));
for (const theme of Object.values(GUIDANCE_THEMES)) guidanceTheme.add(new Option(theme.display_name,theme.theme_id));
guidanceTheme.value='DEFAULT';
perceptionFields.targetHz.textContent = PERCEPTION_CONFIG.visionTargetHz.toFixed(1);
renderPerceptionState();
renderPerceptionTelemetry();
renderClosedLoop();
renderVisualGuidance();
void readPermissionState();
void refreshCameraInventory();

if (!supportsMediaDevices) {
  setPermission('unsupported');
  emptyTitle.textContent = '此环境不支持摄像头';
  emptyCopy.textContent = '需要支持 MediaDevices.getUserMedia 的安全浏览器环境';
  setMessage('Camera API 不可用；已展示受控错误路径。', 'error');
}

const replayName = new URLSearchParams(window.location.search).get('closedLoopReplay');
if (replayName) {
  void import('../fixtures/closed-loop/trajectories.js').then(({ CLOSED_LOOP_TRAJECTORIES }) => {
    const trajectory = CLOSED_LOOP_TRAJECTORIES[replayName as keyof typeof CLOSED_LOOP_TRAJECTORIES];
    if (!trajectory) {
      closedLoopFields.instruction.textContent = `未知回放：${replayName}`;
      return;
    }
    poseMessage.textContent = `SYNTHETIC REPLAY · ${replayName} · NO CAMERA / NO PROVIDER`;
    closedLoop.armTrial(trajectory[0]?.timestamp_ms ?? 0);
    scalarTrace.clear();
    trajectory.forEach((state, index) => {
      window.setTimeout(() => {
        latestPerceptionState = state;
        latestRawMeasurement = null;
        latestClosedLoop = closedLoop.update(state);
        latestVisualGuidance = visualProjector.update(state, latestClosedLoop, null, { mode: guidanceMode.value as VisualServoMode, grid: guidanceGrid.checked, now: state.timestamp_ms });
        scalarTrace.append(state, latestClosedLoop, latestVisualGuidance, guidanceTheme.value);
        if (latestClosedLoop.instruction && latestClosedLoop.instruction.action !== 'HOLD') {
          displayedActionCopy = latestClosedLoop.instruction.copy_zh;
          displayedActionUntilMs = state.timestamp_ms + 700;
        }
        renderPerceptionState();
        renderClosedLoop();
        renderVisualGuidance();
      }, index * 600);
    });
  });
}
