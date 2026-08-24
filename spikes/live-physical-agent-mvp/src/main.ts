import './style.css';
import { PERCEPTION_CONFIG } from '../perception/config.js';
import { PerceptionRuntime } from '../perception/runtime.js';
import type { PoseMeasurement, StructuredPerceptionState } from '../perception/types.js';

type FacingMode = 'user' | 'environment';
type PermissionStateLabel = PermissionState | 'not_requested' | 'unsupported' | 'error';

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: #${id}`);
  return element as T;
};

const video = requireElement<HTMLVideoElement>('preview');
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

const simulatedUnsupported = new URLSearchParams(window.location.search).get('simulateUnsupported') === '1';
const supportsMediaDevices = !simulatedUnsupported && Boolean(navigator.mediaDevices?.getUserMedia);

const formatMetric = (value: number | null | undefined, digits = 3): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(digits);

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
    renderPerceptionState();
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
  latestPerceptionState = null;
  latestRawMeasurement = null;
  renderPerceptionState();
  renderPerceptionTelemetry();
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
  hudToggle.textContent = hidden ? '显示 HUD' : '隐藏 HUD';
  hudToggle.setAttribute('aria-pressed', String(!hidden));
});

poseInitButton.addEventListener('click', () => {
  void perceptionRuntime.initialize().catch(() => {
    // Status and the explicit model/runtime error are rendered by the runtime.
  });
});

window.addEventListener('resize', renderCapabilities);
screen.orientation?.addEventListener('change', renderCapabilities);
window.addEventListener('beforeunload', () => {
  stopCamera({ preserveMessage: true });
  perceptionRuntime.close();
});

renderCapabilities();
updateCoordinateState();
perceptionFields.targetHz.textContent = PERCEPTION_CONFIG.visionTargetHz.toFixed(1);
renderPerceptionState();
renderPerceptionTelemetry();
void readPermissionState();
void refreshCameraInventory();

if (!supportsMediaDevices) {
  setPermission('unsupported');
  emptyTitle.textContent = '此环境不支持摄像头';
  emptyCopy.textContent = '需要支持 MediaDevices.getUserMedia 的安全浏览器环境';
  setMessage('Camera API 不可用；已展示受控错误路径。', 'error');
}
