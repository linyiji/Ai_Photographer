import './style.css';
import { PERCEPTION_CONFIG } from '../perception/config.js';
import { PerceptionRuntime } from '../perception/runtime.js';
import type { PoseMeasurement, StructuredPerceptionState } from '../perception/types.js';
import { ACTION_COPY, CLOSED_LOOP_CONFIG, FRAMING_COMPATIBILITY_COPY, TARGET_PRESETS } from '../closed-loop/config.js';
import { LocalClosedLoopEngine } from '../closed-loop/engine.js';
import type { ClosedLoopSnapshot } from '../closed-loop/types.js';
import { ScalarTraceRecorder } from '../closed-loop/trace.js';
import { VisualGuidanceProjector } from '../visual-guidance/projector.js';
import type { NormalizedBox, VisualGuidanceState, VisualServoMode } from '../visual-guidance/types.js';
import { projectBoxToCover } from '../visual-guidance/viewport.js';
import { GUIDANCE_THEMES, renderGuidanceTheme } from '../visual-guidance/themes.js';
import { CameraSessionGuard, ownsActiveCameraSession } from '../camera/session-guard.js';
import { evaluateGate1PreArm, isGate1Scenario, type Gate1PreArmTelemetry } from '../closed-loop/gate1-acceptance.js';
import { precisionScaleCalibrationFor } from '../semantic-framing/profiles.js';
import { HumanStepServoV3 } from '../control-v3/controller.js';
import { LiveMeasurementV3Projector } from '../control-v3/measurement.js';
import { deriveLivePresentationStateV01 } from '../control-v3/presentation.js';
import { V3HumanStepTraceRecorder } from '../control-v3/trace.js';
import type { LiveMeasurementV3, V3Snapshot } from '../control-v3/types.js';
import { runV3BrowserScenario, V3_BROWSER_SCENARIOS, type V3BrowserScenario } from '../control-v3/browser-scenarios.js';

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
const visionCadence=requireElement<HTMLSelectElement>('vision-cadence');
const poseMessage = requireElement<HTMLParagraphElement>('pose-message');
const poseModelStatus = requireElement<HTMLElement>('pose-model-status');
const executionMode = requireElement<HTMLElement>('execution-mode');
const guidanceOverlayState = requireElement<HTMLElement>('guidance-overlay-state');
const guidanceOverlayText = requireElement<HTMLElement>('guidance-overlay-text');
const closedLoopHud = requireElement<HTMLElement>('closed-loop-hud');
const targetPreset = requireElement<HTMLSelectElement>('target-preset');
const controlPolicySelect = requireElement<HTMLSelectElement>('control-policy');
const closedLoopReset = requireElement<HTMLButtonElement>('closed-loop-reset');
const closedLoopArm = requireElement<HTMLButtonElement>('closed-loop-arm');
const closedLoopTrace = requireElement<HTMLButtonElement>('closed-loop-trace');
const guidanceMode = requireElement<HTMLSelectElement>('guidance-mode');
const guidanceGrid = requireElement<HTMLInputElement>('guidance-grid');
const semanticDebug = requireElement<HTMLInputElement>('semantic-debug');
const scaleGateScenario = requireElement<HTMLSelectElement>('scale-gate-scenario');
const gate1Precondition = requireElement<HTMLElement>('gate1-precondition');
const v2DebugGrid = requireElement<HTMLElement>('v2-debug-grid');
const v3DebugPanel = requireElement<HTMLElement>('v3-debug-panel');
const v3Fields={policy:requireElement<HTMLElement>('v3-policy'),stage:requireElement<HTMLElement>('v3-stage'),framing:requireElement<HTMLElement>('v3-framing'),x:requireElement<HTMLElement>('v3-x'),measurement:requireElement<HTMLElement>('v3-measurement'),stable:requireElement<HTMLElement>('v3-stable'),action:requireElement<HTMLElement>('v3-action'),outcome:requireElement<HTMLElement>('v3-outcome'),latency:requireElement<HTMLElement>('v3-latency')};
const gate1PreconditionResult = requireElement<HTMLElement>('gate1-precondition-result');
const gate1Expected = requireElement<HTMLElement>('gate1-expected');
const gate1BodyMode = requireElement<HTMLElement>('gate1-body-mode');
const gate1X = requireElement<HTMLElement>('gate1-x');
const gate1Scale = requireElement<HTMLElement>('gate1-scale');
const gate1XTarget = requireElement<HTMLElement>('gate1-x-target');
const gate1ScaleTarget = requireElement<HTMLElement>('gate1-scale-target');
const gate1XValid = requireElement<HTMLElement>('gate1-x-valid');
const gate1ScaleValid = requireElement<HTMLElement>('gate1-scale-valid');
const gate1PreconditionReason = requireElement<HTMLElement>('gate1-precondition-reason');
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
const debugPoseBox=requireElement<HTMLElement>('debug-pose-box'); const semanticAnchor=requireElement<HTMLElement>('semantic-anchor'); const semanticDebugCard=requireElement<HTMLElement>('semantic-debug-card'); const semanticMode=requireElement<HTMLElement>('semantic-mode'); const semanticMetrics=requireElement<HTMLElement>('semantic-metrics');
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
  recovery: requireElement<HTMLElement>('cl-recovery'), freshness: requireElement<HTMLElement>('cl-freshness'), controlAge: requireElement<HTMLElement>('cl-control-age'),
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
let latestV3Measurement: LiveMeasurementV3 | null = null;
let latestV3Snapshot: V3Snapshot | null = null;
let v3ControllerLatencies:number[]=[];
let displayedActionCopy: string | null = null;
let displayedActionUntilMs = 0;
let activeGate1PreArm: Gate1PreArmTelemetry | null = null;
let gate1ArmAttempted = false;
const cameraSessionGuard = new CameraSessionGuard();

const simulatedUnsupported = new URLSearchParams(window.location.search).get('simulateUnsupported') === '1';
const supportsMediaDevices = !simulatedUnsupported && Boolean(navigator.mediaDevices?.getUserMedia);

const formatMetric = (value: number | null | undefined, digits = 3): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(digits);

let currentTarget = TARGET_PRESETS[0];
const closedLoop = new LocalClosedLoopEngine(currentTarget);
const scalarTrace = new ScalarTraceRecorder();
const visualProjector = new VisualGuidanceProjector();
const v3Controller = new HumanStepServoV3(currentTarget);
const v3Projector = new LiveMeasurementV3Projector();
const v3Trace = new V3HumanStepTraceRecorder();
type ControlPolicy='V2'|'V3';
const requestedDebugPolicy=new URLSearchParams(window.location.search).get('controlPolicy');
controlPolicySelect.value=requestedDebugPolicy==='V3'?'V3':'V2';
if(controlPolicySelect.value==='V3')scaleGateScenario.value='V3_FRAMING_ONLY';
const activePolicy=():ControlPolicy=>controlPolicySelect.value==='V3'?'V3':'V2';

const perceptionRuntime = new PerceptionRuntime({
  onStatus: (status, mode, text) => {
    poseModelStatus.textContent = `MODEL · ${status}`;
    executionMode.textContent = `MODE · ${mode}`;
    poseMessage.textContent = text;
    poseMessage.dataset.kind = status === 'ERROR' || status === 'MISSING' ? 'error' : 'info';
    poseInitButton.disabled = status === 'LOADING' || status === 'READY';
    if (!latestClosedLoop && stream) {
      guidanceOverlayState.textContent = `P1 LOCAL · MODEL ${status}`;
      guidanceOverlayText.textContent = status === 'READY' ? '模型已就绪 · 点击“ARM 新试验”开始' : status === 'LOADING' ? '正在加载本机姿态模型，请稍候' : status === 'ERROR' || status === 'MISSING' ? '本机模型启动失败 · 请查看下方错误' : '正在准备本机分析';
    }
  },
  onState: (state, rawMeasurement) => {
    latestPerceptionState = state;
    latestRawMeasurement = rawMeasurement;
    if(activePolicy()==='V3'){
      const decisionAt=performance.now();latestV3Measurement=v3Projector.project(state,currentTarget,Math.max(0,decisionAt-state.timestamp_ms));const started=performance.now();latestV3Snapshot=v3Controller.update(latestV3Measurement);v3ControllerLatencies.push(performance.now()-started);if(v3ControllerLatencies.length>240)v3ControllerLatencies.shift();v3Trace.append(latestV3Snapshot);latestClosedLoop=null;latestVisualGuidance=visualProjector.updateV3(state,latestV3Snapshot,currentTarget,rawMeasurement,{mode:guidanceMode.value as VisualServoMode,grid:guidanceGrid.checked,now:performance.now()});
    }else{
      latestClosedLoop = closedLoop.update(state, { decision_timestamp_ms: performance.now(), camera_facing: activeFacingMode === 'user' ? 'FRONT' : activeFacingMode === 'environment' ? 'REAR' : 'UNKNOWN', preview_mirror_state: activeFacingMode === 'user' ? 'MIRRORED' : activeFacingMode === 'environment' ? 'NON_MIRRORED' : 'UNKNOWN' });
      latestVisualGuidance = visualProjector.update(state, latestClosedLoop, rawMeasurement, { mode: guidanceMode.value as VisualServoMode, grid: guidanceGrid.checked, now: performance.now() });
      scalarTrace.append(state, latestClosedLoop, latestVisualGuidance, guidanceTheme.value);
      if (latestClosedLoop.instruction && latestClosedLoop.instruction.action !== 'HOLD') {displayedActionCopy = latestClosedLoop.instruction.copy_zh;displayedActionUntilMs = state.timestamp_ms + 1100;}
    }
    renderPerceptionState();
    renderClosedLoop();
    renderGate1Precondition();
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

const GATE1_REASON_COPY: Readonly<Record<string, string>> = Object.freeze({
  SUBJECT_NOT_PRESENT: '人物未进入画面',
  BODY_MODE_NOT_STABLE: 'BodyMode 尚未稳定 600ms',
  BODY_MODE_MUST_BE_UPPER_BODY: '请退后并保持，直到 BodyMode=UPPER_BODY',
  BODY_MODE_NOT_PRECISION_COMPATIBLE: '当前身体范围不足：请退后直到 UPPER_BODY',
  X_MEASUREMENT_INVALID: 'X 精调不稳定：请正对镜头并静止片刻',
  SCALE_MEASUREMENT_INVALID: 'Scale 精调尚不可用：先完成 UPPER_BODY',
  X_MUST_START_OUTSIDE_TARGET: 'X 必须在目标区外',
  SCALE_MUST_START_IN_TARGET: 'Scale 必须在目标区内',
  X_MUST_START_IN_TARGET: 'X 必须在目标区内',
  SCALE_MUST_START_OUTSIDE_TARGET: 'Scale 必须在目标区外',
  X_RELATION_UNKNOWN: '无法判断 X 起始关系',
  SCALE_RELATION_UNKNOWN: '无法判断 Scale 起始关系',
});

function renderGate1Precondition(): void {
  const scenario = scaleGateScenario.value;
  gate1Precondition.hidden = activePolicy()==='V3'||!isGate1Scenario(scenario);
  if (!isGate1Scenario(scenario)) return;
  const current = activeGate1PreArm ?? evaluateGate1PreArm(scenario, latestPerceptionState, currentTarget);
  const blocked = gate1ArmAttempted && !current.precondition_valid;
  gate1Precondition.dataset.valid = String(current.precondition_valid);
  gate1Precondition.dataset.armBlocked = String(blocked);
  gate1PreconditionResult.textContent = current.precondition_valid ? `${current.expected_trial_coverage} READY TO ARM ✓` : blocked ? 'ARM 已阻止 ✕' : 'NOT READY';
  closedLoopArm.textContent = blocked ? 'ARM 条件未满足' : 'ARM 新试验';
  gate1Expected.textContent = current.expected_trial_coverage;
  gate1BodyMode.textContent = `${current.pre_arm_body_mode} ${current.pre_arm_body_mode_stable ? '✓' : '✕'}`;
  gate1X.textContent = `${formatMetric(current.pre_arm_anchor_x)} / ${current.pre_arm_x_relation}`;
  gate1Scale.textContent = `${formatMetric(current.pre_arm_scale)} / ${current.pre_arm_scale_relation}`;
  gate1XTarget.textContent = `${(current.pre_arm_x_target-current.pre_arm_x_tolerance).toFixed(3)}–${(current.pre_arm_x_target+current.pre_arm_x_tolerance).toFixed(3)}`;
  gate1ScaleTarget.textContent = current.pre_arm_scale_target === null || current.pre_arm_scale_tolerance === null
    ? '需先进入 UPPER_BODY'
    : `${(current.pre_arm_scale_target-current.pre_arm_scale_tolerance).toFixed(3)}–${(current.pre_arm_scale_target+current.pre_arm_scale_tolerance).toFixed(3)} · ${current.pre_arm_scale_metric_type}`;
  gate1XValid.textContent = current.pre_arm_x_valid ? 'VALID ✓' : 'INVALID ✕';
  gate1ScaleValid.textContent = current.pre_arm_scale_valid ? 'VALID ✓' : 'INVALID ✕';
  gate1PreconditionReason.textContent = current.precondition_valid
    ? '起始覆盖有效；现在可以 ARM。移动要慢，看到“停一下”立即停止并保持不动。'
    : `${blocked ? '无法 ARM：' : ''}${current.precondition_failure_reason.map((reason) => GATE1_REASON_COPY[reason] ?? reason).join('；')}`;
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
  if(activePolicy()==='V3'){renderV3Visual();return;}
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
  applyProjectedBox(acceptableZone, zoneBox); targetBox.classList.remove('is-visible'); applyProjectedBox(subjectBox, visual.tracked_subject_box);
  renderSemanticDebug();
  subjectLockLabel.textContent = visual.tracking_status === 'LOCKED' ? '人物已锁定' : visual.tracking_status === 'HELD' ? '人物暂时遮挡' : '人物锁定中';
  const direction = visual.direction_hint; const directionPresentation = direction === 'MOVE_LEFT' ? [visual.display_axis_sign < 0 ? '←' : '→','持续往左 · 看到“停一下”再停'] : direction === 'MOVE_RIGHT' ? [visual.display_axis_sign < 0 ? '←' : '→','持续往右 · 看到“停一下”再停'] : direction === 'MOVE_CLOSER' ? ['⊕','持续靠近 · 看到“停一下”再停'] : direction === 'MOVE_FARTHER' ? ['⊖','持续退后 · 看到“停一下”再停'] : null;
  directionVisual.classList.toggle('is-visible', Boolean(directionPresentation) && !visual.braking && !visual.ready); if (directionPresentation) { directionIcon.textContent=renderedTheme.direction_glyph??directionPresentation[0]; directionLabel.textContent=directionPresentation[1]; }
  stopIcon.textContent=renderedTheme.stop_glyph; readyIcon.textContent=renderedTheme.ready_glyph;
  stopVisual.classList.toggle('is-visible', visual.braking && !visual.ready); readyVisual.classList.toggle('is-visible', visual.ready);
  trackingVisual.textContent = visual.tracking_status === 'LOCKED' ? (visual.inside_target ? '人物已在目标框内' : visual.near_target ? '接近目标框' : '跟随箭头，把人物移进目标框') : visual.tracking_status === 'HELD' ? '暂时未识别 · 请保持位置' : visual.tracking_status === 'UNLOCKED' ? '请让人物进入画面' : '把人物放进目标框';
  closedLoopFields.theme.textContent=`${renderedTheme.theme.theme_id} / ${semanticDiff}`;
}

const percentile=(values:ReadonlyArray<number>,p:number):number=>{if(!values.length)return 0;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];};
function renderV3Visual():void{
  const snapshot=latestV3Snapshot;const presentation=deriveLivePresentationStateV01(snapshot);const action=presentation.action;
  visualOverlay.dataset.status=presentation.state==='READY'?'READY':action?'CORRECTING':presentation.state==='ACQUIRING'?'LOST':'TRACKING';visualGrid.classList.toggle('is-visible',guidanceGrid.checked);
  stopVisual.classList.remove('is-visible');applyProjectedBox(subjectBox,latestVisualGuidance?.tracked_subject_box??null);applyProjectedBox(targetBox,latestVisualGuidance?.target_box??null);const zone=latestVisualGuidance?.acceptable_zone;applyProjectedBox(acceptableZone,zone?{left:zone.left,top:zone.top,width:zone.right-zone.left,height:zone.bottom-zone.top,center_x:(zone.left+zone.right)/2,center_y:(zone.top+zone.bottom)/2}:null);subjectLockLabel.textContent=latestVisualGuidance?.tracking_status==='LOCKED'?'人物已锁定':'人物锁定中';
  readyVisual.classList.toggle('is-visible',presentation.state==='READY');directionVisual.classList.toggle('is-visible',Boolean(action));
  if(action){directionLabel.textContent=presentation.overlay_copy_zh;directionIcon.textContent=action==='MOVE_LEFT_SMALL'?'←':action==='MOVE_RIGHT_SMALL'?'→':action==='MOVE_CLOSER_SMALL'?'＋':'−';}
  trackingVisual.textContent=presentation.overlay_copy_zh;
}

function renderV3Control():void{
  const snapshot=latestV3Snapshot;const measurement=latestV3Measurement??snapshot?.measurement??null;const presentation=deriveLivePresentationStateV01(snapshot);const action=snapshot?.active_action??null;
  v3DebugPanel.hidden=false;v2DebugGrid.hidden=true;v3Fields.policy.textContent='CONTROL POLICY · V3 · EXPERIMENTAL';v3Fields.stage.textContent=snapshot?.stage??'ACQUIRE';v3Fields.framing.textContent=measurement?.framing_relation??'UNKNOWN';v3Fields.x.textContent=measurement?.x_relation??'UNKNOWN';v3Fields.measurement.textContent=measurement?.measurement_quality??'INVALID';v3Fields.stable.textContent=measurement?.stable?'YES':'NO';v3Fields.action.textContent=action??'—';v3Fields.outcome.textContent=snapshot?.outcome??'—';v3Fields.latency.textContent=`${percentile(v3ControllerLatencies,.5).toFixed(3)} / ${percentile(v3ControllerLatencies,.95).toFixed(3)} ms`;
  closedLoopFields.runtimeState.textContent=`STATE · ${snapshot?.stage??'IDLE'}`;closedLoopFields.ready.textContent=`READY · ${String(snapshot?.ready??false).toUpperCase()}`;
  closedLoopFields.instruction.textContent=presentation.primary_copy_zh;guidanceOverlayState.textContent=`V3 · ${presentation.state}`;guidanceOverlayText.textContent=presentation.primary_copy_zh;closedLoopReset.textContent='重置 V3 试验';closedLoopArm.textContent='ARM V3 新试验';
}

function renderSemanticDebug():void{
  const framing=latestPerceptionState?.framing;const enabled=semanticDebug.checked&&Boolean(framing);semanticDebugCard.hidden=!enabled;
  if(!enabled||!framing){debugPoseBox.classList.remove('is-visible');semanticAnchor.classList.remove('is-visible');return;}
  const raw=framing.raw_pose_box;applyProjectedBox(debugPoseBox,raw?{left:raw.min_x,top:raw.min_y,width:raw.width_ratio,height:raw.height_ratio,center_x:raw.center_x,center_y:raw.center_y}:null);
  if(framing.anchor_x!==null){const shoulder=framing.groups.SHOULDERS.pair_center,hip=framing.groups.HIPS.pair_center;const y=shoulder&&hip?(shoulder.y+hip.y)/2:shoulder?.y??hip?.y??framing.display_box?.center_y??.5;const rect=cameraStage.getBoundingClientRect();const projected=projectBoxToCover({left:framing.anchor_x,top:y,width:.001,height:.001,center_x:framing.anchor_x,center_y:y},{container_width:rect.width,container_height:rect.height,source_width:video.videoWidth||rect.width,source_height:video.videoHeight||rect.height,mirrored:activeFacingMode==='user'});semanticAnchor.style.left=`${projected.left}px`;semanticAnchor.style.top=`${projected.top}px`;semanticAnchor.classList.add('is-visible');}
  semanticMode.textContent=`MODE · ${framing.body_mode} · ${(framing.body_mode_confidence*100).toFixed(0)}% · ${framing.torso_orientation} · ${framing.filter_type}`;semanticMetrics.textContent=`ANCHOR ${formatMetric(framing.anchor_x)} (${framing.anchor_x_source}) · DIST ${formatMetric(framing.distance_proxy.value)} ${framing.distance_proxy.valid?'VALID':framing.distance_proxy.validity_reason} (${framing.distance_proxy.source}) · SCALE ${formatMetric(framing.scale)} ${framing.valid_for_precision_scale?'VALID':framing.scale_validity_reason} (${framing.scale_metric_type??'—'}) · U ${formatMetric(framing.uncertainty_x)}/${formatMetric(framing.uncertainty_scale)} · CROP ${Object.entries(framing.cropped_edges).filter(([,v])=>v).map(([k])=>k).join(',')||'NONE'}`;
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
  v3DebugPanel.hidden=activePolicy()!=='V3';v2DebugGrid.hidden=activePolicy()==='V3';
  if(activePolicy()==='V3'){renderV3Control();return;}
  const snapshot = latestClosedLoop;
  const target = snapshot?.target ?? currentTarget;
  const currentFraming = latestPerceptionState?.framing;
  const semanticScaleTarget = currentFraming
    ? precisionScaleCalibrationFor(target,currentFraming.body_mode,currentFraming.scale_metric_type)?.target_scale_value ?? null
    : target.height_ratio;
  closedLoopFields.target.textContent = `${formatMetric(target.center_x)} / ${formatMetric(target.center_y)} / ${formatMetric(semanticScaleTarget)}`;
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
    closedLoopFields.recovery.textContent = '0 ms'; closedLoopFields.freshness.textContent = '— / 0'; closedLoopFields.controlAge.textContent = '0 / 0 / 0 ms';
    closedLoopFields.visualStatus.textContent = `LOST / ${guidanceMode.value}`; closedLoopFields.visualLock.textContent = 'UNLOCKED / 0.000';
    closedLoopFields.visualJitter.textContent = '0.0000 / 0.0000'; closedLoopFields.visualEntry.textContent = '0 / 0';
    closedLoopFields.visualLatency.textContent = '0 / 0 ms'; closedLoopFields.visualTiming.textContent = '— / —';
    closedLoopFields.theme.textContent = `${guidanceTheme.value||'DEFAULT'} / 0`;
    return;
  }
  const subject = snapshot.current; const framing=latestPerceptionState?.framing; const metrics = snapshot.metrics;
  closedLoopFields.runtimeState.textContent = `STATE · ${snapshot.runtime_state}`;
  closedLoopReset.textContent = snapshot.runtime_state === 'LOCAL_RECOVERY_REQUIRED' ? '继续本机引导' : '重置本机引导';
  closedLoopFields.ready.textContent = `READY · ${String(snapshot.ready).toUpperCase()}`;
  const presentation = closedLoopPresentation(snapshot);
  closedLoopFields.instruction.textContent = presentation.text;
  guidanceOverlayState.textContent = presentation.state;
  guidanceOverlayText.textContent = presentation.text;
  closedLoopFields.current.textContent = `${formatMetric(framing?.anchor_x??subject.center_x)} / ${formatMetric(subject.center_y)} / ${formatMetric(framing?.scale??subject.height_ratio)}`;
  closedLoopFields.delta.textContent = `${formatMetric(snapshot.delta.x.delta)} / ${formatMetric(snapshot.delta.y.delta)} / ${formatMetric(snapshot.delta.scale.delta)}`;
  closedLoopFields.error.textContent = `${formatMetric(snapshot.delta.x.normalized_error)} / ${formatMetric(snapshot.delta.y.normalized_error)} / ${formatMetric(snapshot.delta.scale.normalized_error)}`;
  closedLoopFields.issue.textContent = `${snapshot.issue?.kind ?? 'NONE'} / ${formatMetric(snapshot.issue?.score, 2)}`;
  closedLoopFields.issueAge.textContent = `${snapshot.issue_age_ms.toFixed(0)} ms`;
  closedLoopFields.action.textContent = `${snapshot.active_action ?? 'NONE'} / ${snapshot.action_age_ms === null ? '—' : `${snapshot.action_age_ms.toFixed(0)} ms`}`;
  closedLoopFields.waiting.textContent = `${snapshot.waiting_remaining_ms.toFixed(0)} / ${CLOSED_LOOP_CONFIG.instruction_gap_ms} ms`;
  closedLoopFields.verification.textContent = snapshot.verification;
  closedLoopFields.stable.textContent = `${String(framing?.stable??subject.stable).toUpperCase()} / ${snapshot.stable_duration_ms.toFixed(0)} ms`;
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
  closedLoopFields.freshness.textContent = `${snapshot.control_observation.fresh?'FRESH':snapshot.control_observation.suppression_reason} / ${metrics.stale_suppressed_count}`;
  closedLoopFields.controlAge.textContent = `${metrics.control_observation_age_ms_p50.toFixed(0)} / ${metrics.control_observation_age_ms_p95.toFixed(0)} / ${metrics.control_observation_age_ms_max.toFixed(0)} ms`;
  const visual = latestVisualGuidance;
  closedLoopFields.visualStatus.textContent = `${visual?.visual_status ?? 'LOST'} / ${visual?.overlay_mode ?? guidanceMode.value}`;
  closedLoopFields.visualLock.textContent = `${visual?.tracking_status ?? 'UNLOCKED'} / ${(visual?.tracking_confidence ?? 0).toFixed(3)}`;
  closedLoopFields.visualJitter.textContent = `${(visual?.metrics.raw_box_jitter ?? 0).toFixed(4)} / ${(visual?.metrics.stabilized_box_jitter ?? 0).toFixed(4)}`;
  closedLoopFields.visualLatency.textContent = `${(visual?.metrics.visual_projection_latency_ms_p50 ?? 0).toFixed(0)} / ${(visual?.metrics.visual_projection_latency_ms_p95 ?? 0).toFixed(0)} / ${(visual?.metrics.visual_projection_latency_ms_max ?? 0).toFixed(0)} ms`;
  closedLoopFields.visualTiming.textContent = `${visual?.metrics.target_crossing_delay_ms === null || visual?.metrics.target_crossing_delay_ms === undefined ? '—' : `${visual.metrics.target_crossing_delay_ms.toFixed(0)} ms`} / ${visual?.metrics.time_inside_target_before_ready_ms === null || visual?.metrics.time_inside_target_before_ready_ms === undefined ? '—' : `${visual.metrics.time_inside_target_before_ready_ms.toFixed(0)} ms`}`;
  closedLoopFields.visualEntry.textContent = `${visual?.metrics.target_box_entry_count ?? 0} / ${visual?.metrics.target_box_exit_count ?? 0}`;
  closedLoopFields.countsA.textContent = `${metrics.ordinary_instruction_count} / ${metrics.stop_cue_count} / ${metrics.hold_count} / ${metrics.successful_corrections}`;
  closedLoopFields.countsB.textContent = `${metrics.improving_count} / ${metrics.no_effect_count}`;
  closedLoopFields.countsC.textContent = `${metrics.wrong_direction_count} / ${metrics.oscillation_count}`;
  closedLoopFields.timeTarget.textContent = metrics.time_to_target_ms === null ? '—' : `${(metrics.time_to_target_ms / 1000).toFixed(1)} s`;
  closedLoopFields.decisions.textContent = String(metrics.local_decisions);
}

function closedLoopPresentation(snapshot: ClosedLoopSnapshot): { state: string; text: string } {
  if (snapshot.trial_state === 'DISARMED') return { state: 'P2 LOCAL · DISARMED', text: '模型已就绪 · 点击“ARM 新试验”开始' };
  if (snapshot.runtime_state === 'SEARCHING') return { state: 'P2 LOCAL · SEARCHING', text: '请进入画面' };
  if(snapshot.runtime_state==='MEASUREMENT_UNCERTAIN')return {state:'P2 LOCAL · MEASUREMENT UNCERTAIN',text:'保持片刻 · 正在确认人物构图'};
  if(snapshot.runtime_state==='FRAMING_COMPATIBILITY')return {state:`P2 LOCAL · FRAMING COMPATIBILITY · ${latestPerceptionState?.framing?.body_mode??'—'}`,text:snapshot.instruction?.copy_zh??FRAMING_COMPATIBILITY_COPY[snapshot.framing_compatibility??'UNCERTAIN']};
  if (snapshot.runtime_state === 'INSTRUCTING' && snapshot.instruction) {
    return { state: `P2 LOCAL · ${snapshot.issue?.kind ?? 'ACTION'}`, text: snapshot.instruction.copy_zh };
  }
  if (displayedActionCopy && snapshot.timestamp_ms <= displayedActionUntilMs) {
    return { state: `P2 LOCAL · ACTION · ${snapshot.active_action ?? 'LOCAL'}`, text: displayedActionCopy };
  }
  if (snapshot.runtime_state === 'WAITING_FOR_MOTION' || snapshot.runtime_state === 'TRACKING_MOTION') {
    return (latestPerceptionState?.framing?.stable??snapshot.current.stable)
      ? { state: `P2 LOCAL · VERIFY IN ${snapshot.waiting_remaining_ms.toFixed(0)} ms`, text: '保持不动 · 正在确认' }
      : { state: 'P2 LOCAL · WAITING / SILENT', text: '移动中 · 暂停新指令' };
  }
  if (snapshot.runtime_state === 'BRAKING') return { state: 'P2 LOCAL · BRAKING', text: ACTION_COPY.STOP_HERE };
  if (snapshot.runtime_state === 'VERIFYING') return { state: 'P2 LOCAL · VERIFYING', text: '正在确认调整结果' };
  if (snapshot.runtime_state === 'SATISFIED_PENDING_CONFIRMATION') return { state: `P2 LOCAL · PASSIVE CONFIRM ${snapshot.passive_confirmation_remaining_ms.toFixed(0)} ms`, text: '保持不动 · 正在确认' };
  if (snapshot.runtime_state === 'READY') return { state: 'P2 LOCAL · READY', text: ACTION_COPY.HOLD };
  if (snapshot.runtime_state === 'LOCAL_RECOVERY_REQUIRED') return { state: `P2 LOCAL · AUTO RECOVERY ${snapshot.local_recovery_remaining_ms.toFixed(0)} ms`, text: '连续调整未完成 · 请站稳，系统将自动继续；也可点击“继续本机引导”' };
  if (snapshot.issue?.kind === 'X_POSITION') return { state: `P2 LOCAL · CONFIRM X ${snapshot.issue_age_ms.toFixed(0)}/${CLOSED_LOOP_CONFIG.issue_persistence_ms} ms`, text: '把人物框移进目标框' };
  if (snapshot.issue?.kind === 'SCALE') return { state: `P2 LOCAL · CONFIRM SCALE ${snapshot.issue_age_ms.toFixed(0)}/${CLOSED_LOOP_CONFIG.issue_persistence_ms} ms`, text: '调整距离，让人物框贴近目标框' };
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
  cameraSessionGuard.invalidate();
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
  v3Controller.reset();v3Projector.reset();v3Trace.clear();latestV3Measurement=null;latestV3Snapshot=null;v3ControllerLatencies=[];
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

  const requestId = cameraSessionGuard.beginRequest();
  startButton.disabled = true;
  switchButton.disabled = true;
  setMessage(`正在请求${facingMode === 'user' ? '前置' : '后置'}摄像头…`);
  const previousStream = stream;
  stream = null;
  video.srcObject = null;
  previousStream?.getTracks().forEach((track) => track.stop());
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

    if (!cameraSessionGuard.isCurrent(requestId)) {
      nextStream.getTracks().forEach((track) => track.stop());
      return;
    }

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
    if (!latestClosedLoop) {
      guidanceOverlayState.textContent = 'P1 LOCAL · CAMERA READY';
      guidanceOverlayText.textContent = perceptionRuntime.currentModelStatus === 'READY' ? '模型已就绪 · 点击“ARM 新试验”开始' : '正在加载本机姿态模型，请稍候';
    }

    videoTrack?.addEventListener('ended', () => {
      if (!ownsActiveCameraSession(stream, nextStream)) return;
      stopCamera({ preserveMessage: true });
      setMessage('摄像头媒体轨道已结束。', 'error');
    }, { once: true });
  } catch (error) {
    if (!cameraSessionGuard.isCurrent(requestId)) return;
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
visionCadence.addEventListener('change',()=>{const hz=Number(visionCadence.value);perceptionRuntime.setVisionTargetHz(hz);poseMessage.textContent=`Vision cadence switched to ${hz} Hz · one inference in flight · no backlog`;});

targetPreset.addEventListener('change', () => {
  const selected = TARGET_PRESETS.find((preset) => preset.id === targetPreset.value) ?? TARGET_PRESETS[0];
  currentTarget = selected; closedLoop.setTarget(selected);v3Controller.setTarget(selected); latestClosedLoop = null;latestV3Measurement=null;latestV3Snapshot=null;
  visualProjector.reset(); latestVisualGuidance = null;
  displayedActionCopy = null; displayedActionUntilMs = 0; activeGate1PreArm = null; gate1ArmAttempted = false; renderClosedLoop(); renderGate1Precondition(); renderVisualGuidance();
});

guidanceMode.addEventListener('change',()=>{ if(latestPerceptionState&&latestClosedLoop) latestVisualGuidance=visualProjector.update(latestPerceptionState,latestClosedLoop,latestRawMeasurement,{mode:guidanceMode.value as VisualServoMode,grid:guidanceGrid.checked,now:performance.now()}); renderVisualGuidance(); renderClosedLoop(); });
guidanceGrid.addEventListener('change',()=>{ if(latestPerceptionState&&latestClosedLoop) latestVisualGuidance=visualProjector.update(latestPerceptionState,latestClosedLoop,latestRawMeasurement,{mode:guidanceMode.value as VisualServoMode,grid:guidanceGrid.checked,now:performance.now()}); renderVisualGuidance(); });
semanticDebug.addEventListener('change',renderSemanticDebug);
guidanceTheme.addEventListener('change',()=>renderVisualGuidance());
scaleGateScenario.addEventListener('change', () => { activeGate1PreArm = null; gate1ArmAttempted = false; renderGate1Precondition(); });
controlPolicySelect.addEventListener('change',()=>{closedLoop.reset();v3Controller.reset();v3Projector.reset();scalarTrace.clear();v3Trace.clear();latestClosedLoop=null;latestV3Measurement=null;latestV3Snapshot=null;latestVisualGuidance=null;v3ControllerLatencies=[];displayedActionCopy=null;displayedActionUntilMs=0;activeGate1PreArm=null;gate1ArmAttempted=false;if(activePolicy()==='V3'&&!scaleGateScenario.value.startsWith('V3_'))scaleGateScenario.value='V3_FRAMING_ONLY';visualProjector.reset();renderClosedLoop();renderGate1Precondition();renderVisualGuidance();setMessage(activePolicy()==='V3'?'V3 实验控制已选择；仅本测试会话有效，V2 仍是默认。':'已恢复 V2 当前默认控制。');});

closedLoopReset.addEventListener('click', () => {
  if(activePolicy()==='V3'){v3Controller.reset();v3Projector.reset();v3Trace.clear();latestV3Measurement=null;latestV3Snapshot=null;v3ControllerLatencies=[];renderClosedLoop();renderVisualGuidance();setMessage('V3 实验已重置；请选择 ARM 开始新的单步试验。');return;}
  if (latestClosedLoop?.runtime_state === 'LOCAL_RECOVERY_REQUIRED' && closedLoop.resumeAfterLocalRecovery(performance.now())) {
    displayedActionCopy = null; displayedActionUntilMs = 0;
    setMessage('已继续本机引导；历史 Episode 与标量 Trace 保留，不会重复编号。');
    return;
  }
  closedLoop.reset(); latestClosedLoop = null; displayedActionCopy = null; displayedActionUntilMs = 0; activeGate1PreArm = null; gate1ArmAttempted = false;
  visualProjector.reset(); latestVisualGuidance = null; renderClosedLoop(); renderGate1Precondition(); renderVisualGuidance();
});
closedLoopArm.addEventListener('click', () => {
  if(activePolicy()==='V3'){v3Controller.arm(performance.now());v3Trace.clear();latestV3Snapshot=null;renderClosedLoop();renderVisualGuidance();setMessage('V3 试验已 ARM：每条指令只做一次小调整，然后自然停下。');return;}
  const scenario = scaleGateScenario.value;
  const preArm = isGate1Scenario(scenario) ? evaluateGate1PreArm(scenario, latestPerceptionState, currentTarget) : null;
  if (preArm && !preArm.precondition_valid) {
    activeGate1PreArm = null; gate1ArmAttempted = true; renderGate1Precondition();
    gate1Precondition.animate([
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(255,144,122,0)' },
      { transform: 'scale(1.012)', boxShadow: '0 0 0 4px rgba(255,144,122,.42)' },
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(255,144,122,0)' },
    ], { duration: 650, easing: 'ease-out' });
    setMessage(`Gate 1 ARM 已阻止：${preArm.precondition_failure_reason.map((reason) => GATE1_REASON_COPY[reason] ?? reason).join('；')}`, 'error');
    return;
  }
  closedLoop.armTrial(performance.now()); scalarTrace.clear();
  gate1ArmAttempted = false;
  if (preArm) { activeGate1PreArm = preArm; scalarTrace.beginGate1Trial(preArm); } else activeGate1PreArm = null;
  latestClosedLoop = null; displayedActionCopy = null; displayedActionUntilMs = 0;
  visualProjector.reset(); latestVisualGuidance = null; renderClosedLoop(); renderGate1Precondition(); renderVisualGuidance(); setMessage('试验已 ARM；起始覆盖已锁定。缓慢连续移动，看到“停一下”立即停止并保持不动。');
});
closedLoopTrace.addEventListener('click', () => {
  const previewFps=Number.parseFloat(fpsValue.textContent??'0')||0;const runtimeTelemetry=perceptionRuntime.snapshot(previewFps);const scenario=scaleGateScenario.value;
  const context={scenario_label:scenario,generated_at_iso:new Date().toISOString(),runtime_telemetry:runtimeTelemetry,session:{user_agent:navigator.userAgent,viewport_width:window.innerWidth,viewport_height:window.innerHeight,orientation:screen.orientation?.type??(window.innerHeight>=window.innerWidth?'portrait':'landscape'),camera_facing:activeFacingMode==='user'?'FRONT':activeFacingMode==='environment'?'REAR':'UNKNOWN',preview_mirror_state:activeFacingMode==='user'?'MIRRORED':activeFacingMode==='environment'?'NON_MIRRORED':'UNKNOWN',target_id:currentTarget.id,theme_id:guidanceTheme.value,vision_target_hz:runtimeTelemetry.vision_target_hz,scheduler}};
  const isV3=activePolicy()==='V3';const blob = new Blob([isV3?v3Trace.json(context):scalarTrace.json(context)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = isV3?`live-p2-v3-${scenario.toLowerCase()}-${Date.now()}.json`:`live-p2-scale-${scenario.toLowerCase()}-${Date.now()}.json`; link.click();
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
renderGate1Precondition();
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
          displayedActionUntilMs = state.timestamp_ms + 1100;
        }
        renderPerceptionState();
        renderClosedLoop();
        renderVisualGuidance();
      }, index * 600);
    });
  });
}

const v3ReplayName=new URLSearchParams(window.location.search).get('v3Replay');
if(v3ReplayName&&V3_BROWSER_SCENARIOS.includes(v3ReplayName as V3BrowserScenario)){
  controlPolicySelect.value='V3';v3Controller.reset();v3Trace.clear();const snapshots=runV3BrowserScenario(v3ReplayName as V3BrowserScenario);poseMessage.textContent=`V3 SYNTHETIC REPLAY · ${v3ReplayName} · NO CAMERA / NO PROVIDER`;
  snapshots.forEach((snapshot,index)=>window.setTimeout(()=>{latestV3Snapshot=snapshot;latestV3Measurement=snapshot.measurement;v3Trace.append(snapshot);renderClosedLoop();renderGate1Precondition();renderVisualGuidance();if(index===snapshots.length-1){document.documentElement.dataset.v3BrowserGate='PASS';document.documentElement.dataset.v3Scenario=v3ReplayName;}},index*120));
}
