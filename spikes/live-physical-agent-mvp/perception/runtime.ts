import type { PoseLandmarker } from '@mediapipe/tasks-vision';
import { PERCEPTION_CONFIG, POSE_MODEL, POSE_OPTIONS } from './config.js';
import { extractPoseMeasurement } from './geometry.js';
import { BoundedFrameScheduler } from './scheduler.js';
import { PerceptionStateTracker } from './state-tracker.js';
import { PerceptionTelemetry } from './telemetry.js';
import { extractSemanticRawMeasurement } from '../semantic-framing/measurement.js';
import { SemanticFramingTracker } from '../semantic-framing/tracker.js';
import { visibleSensorRectForCover } from '../visual-guidance/viewport.js';
import { WORKER_INITIALIZATION_TIMEOUT_MS, WorkerInitializationTimeoutError } from './initialization-policy.js';
import type {
  PerceptionExecutionMode,
  PerceptionTelemetrySnapshot,
  PerceptionWorkerResponse,
  PoseMeasurement,
  PoseModelStatus,
  StructuredPerceptionState,
} from './types.js';

interface RuntimeCallbacks {
  onStatus: (status: PoseModelStatus, mode: PerceptionExecutionMode, message: string) => void;
  onState: (state: StructuredPerceptionState, rawMeasurement: PoseMeasurement | null) => void;
  onError: (message: string) => void;
}

interface MemoryPerformance extends Performance {
  memory?: { usedJSHeapSize: number };
}

class ModelMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelMissingError';
  }
}

export class PerceptionRuntime {
  private worker: Worker | null = null;
  private fallbackLandmarker: PoseLandmarker | null = null;
  private fallbackTracker = new PerceptionStateTracker(PERCEPTION_CONFIG);
  private fallbackFramingTracker = new SemanticFramingTracker();
  private scheduler = new BoundedFrameScheduler(PERCEPTION_CONFIG.visionTargetHz);
  private telemetry = new PerceptionTelemetry(PERCEPTION_CONFIG.visionTargetHz, PERCEPTION_CONFIG.inferenceHistoryLimit);
  private mode: PerceptionExecutionMode = 'UNINITIALIZED';
  private modelStatus: PoseModelStatus = 'LAZY';
  private busy = false;
  private ready = false;
  private initializing: Promise<void> | null = null;
  private initResolve: (() => void) | null = null;
  private initReject: ((error: Error) => void) | null = null;

  constructor(private readonly callbacks: RuntimeCallbacks) {}

  get currentMode(): PerceptionExecutionMode { return this.mode; }
  get currentModelStatus(): PoseModelStatus { return this.modelStatus; }
  setVisionTargetHz(targetHz:number):void{if(![8,10,12].includes(targetHz))throw new Error('Semantic cadence candidate must be 8, 10, or 12 Hz');this.scheduler=new BoundedFrameScheduler(targetHz);this.telemetry=new PerceptionTelemetry(targetHz,PERCEPTION_CONFIG.inferenceHistoryLimit);this.telemetry.start(performance.now());}

  initialize(): Promise<void> {
    if (this.ready) return Promise.resolve();
    if (this.initializing) return this.initializing;

    this.modelStatus = 'LOADING';
    this.callbacks.onStatus(this.modelStatus, this.mode, '正在初始化 Worker Pose runtime…');
    this.initializing = this.ensureModelAvailable().then(() => this.initializeWorker()).catch(async (workerError: unknown) => {
      if (workerError instanceof ModelMissingError) {
        this.mode = 'FAILED';
        this.modelStatus = 'MISSING';
        this.callbacks.onStatus(this.modelStatus, this.mode, workerError.message);
        throw workerError;
      }
      if (workerError instanceof WorkerInitializationTimeoutError) {
        this.worker?.terminate();
        this.worker = null;
        this.mode = 'FAILED';
        this.modelStatus = 'ERROR';
        this.callbacks.onStatus(this.modelStatus, this.mode, workerError.message);
        throw workerError;
      }
      const reason = workerError instanceof Error ? workerError.message : String(workerError);
      this.callbacks.onStatus('LOADING', 'BOUNDED_MAIN_THREAD_FALLBACK', `Worker 不可用，初始化限频主线程 fallback：${reason}`);
      await this.initializeFallback();
    }).finally(() => {
      this.initializing = null;
    });
    return this.initializing;
  }

  sample(video: HTMLVideoElement, timestampMs: number): void {
    if (!this.ready) return;
    const decision = this.scheduler.decide(timestampMs, this.busy);
    if (!decision.accepted) return;
    this.busy = true;
    const rect=video.getBoundingClientRect();
    const visibleSensorRect=visibleSensorRectForCover({container_width:rect.width,container_height:rect.height,source_width:video.videoWidth||rect.width,source_height:video.videoHeight||rect.height});

    if (this.mode === 'WORKER' && this.worker) {
      void createImageBitmap(video).then((frame) => {
        if (!this.worker || !this.ready) {
          frame.close();
          this.busy = false;
          return;
        }
        this.worker.postMessage({ type: 'process', frame, timestamp: timestampMs, visibleSensorRect }, [frame]);
      }).catch((error: unknown) => {
        this.busy = false;
        this.callbacks.onError(`Frame transfer failed: ${error instanceof Error ? error.message : String(error)}`);
      });
      return;
    }

    try {
      if (!this.fallbackLandmarker) throw new Error('Main-thread Pose fallback is not initialized');
      const startedAt = performance.now();
      const result = this.fallbackLandmarker.detectForVideo(video, timestampMs);
      const landmarks=result.landmarks[0] ?? [];
      const measurement = extractPoseMeasurement(landmarks, timestampMs, PERCEPTION_CONFIG);
      const state = this.fallbackTracker.update(measurement, timestampMs);
      const semanticRawMeasurement=landmarks.length?extractSemanticRawMeasurement(landmarks,timestampMs,PERCEPTION_CONFIG,visibleSensorRect,measurement):null;
      state.framing=this.fallbackFramingTracker.update(semanticRawMeasurement,timestampMs,state.sequence);
      this.recordResult(performance.now() - startedAt, state, measurement);
    } catch (error) {
      this.callbacks.onError(`Pose inference failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.busy = false;
    }
  }

  resetSession(nowMs = performance.now()): void {
    this.busy = false;
    this.scheduler.reset();
    this.telemetry.start(nowMs);
    this.fallbackTracker.reset();
    this.fallbackFramingTracker.reset();
    this.worker?.postMessage({ type: 'reset' });
  }

  snapshot(previewFps: number): PerceptionTelemetrySnapshot {
    const memory = (performance as MemoryPerformance).memory;
    const memoryMb = memory ? memory.usedJSHeapSize / (1024 * 1024) : null;
    return this.telemetry.snapshot(
      performance.now(),
      previewFps,
      this.scheduler.scheduledFrames,
      this.scheduler.skippedBusyFrames,
      this.mode,
      memoryMb,
    );
  }

  close(): void {
    this.ready = false;
    this.worker?.postMessage({ type: 'close' });
    this.worker?.terminate();
    this.worker = null;
    this.fallbackLandmarker?.close();
    this.fallbackLandmarker = null;
  }

  private async initializeWorker(): Promise<void> {
    this.worker = new Worker(new URL('./pose.worker.ts', import.meta.url), { type: 'module', name: 'xfx-pose-perception' });
    this.worker.onmessage = (event: MessageEvent<PerceptionWorkerResponse>) => this.handleWorkerMessage(event.data);
    this.worker.onerror = (event) => {
      const error = new Error(event.message || 'Pose worker script failed');
      if (!this.ready) this.initReject?.(error);
      else {
        this.busy = false;
        this.callbacks.onError(error.message);
      }
    };

    const readyPromise = new Promise<void>((resolve, reject) => {
      this.initResolve = resolve;
      this.initReject = reject;
    });
    const timeout = window.setTimeout(
      () => this.initReject?.(new WorkerInitializationTimeoutError()),
      WORKER_INITIALIZATION_TIMEOUT_MS,
    );
    this.worker.postMessage({
      type: 'init',
      wasmBaseUrl: new URL('/mediapipe-wasm', window.location.href).href,
      modelUrl: new URL(POSE_MODEL.localPath, window.location.href).href,
      config: PERCEPTION_CONFIG,
    });

    try {
      await readyPromise;
      this.mode = 'WORKER';
      this.ready = true;
      this.modelStatus = 'READY';
      this.telemetry.start(performance.now());
      this.callbacks.onStatus(this.modelStatus, this.mode, 'Pose Landmarker ready · Worker');
    } finally {
      window.clearTimeout(timeout);
      this.initResolve = null;
      this.initReject = null;
    }
  }

  private async ensureModelAvailable(): Promise<void> {
    const modelUrl = new URL(POSE_MODEL.localPath, window.location.href).href;
    try {
      const response = await fetch(modelUrl, { method: 'HEAD' });
      if (!response.ok) throw new ModelMissingError(`Pose model missing: HTTP ${response.status}. Run npm run setup:model.`);
      const contentLength = Number(response.headers.get('content-length'));
      if (contentLength !== POSE_MODEL.sizeBytes) {
        throw new ModelMissingError(`Pose model missing or invalid: expected ${POSE_MODEL.sizeBytes} bytes, received ${Number.isFinite(contentLength) ? contentLength : 'unknown'}. Run npm run setup:model.`);
      }
    } catch (error) {
      if (error instanceof ModelMissingError) throw error;
      throw new ModelMissingError(`Pose model unavailable. Run npm run setup:model. ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async initializeFallback(): Promise<void> {
    this.worker?.terminate();
    this.worker = null;
    const { FilesetResolver, PoseLandmarker: PoseLandmarkerClass } = await import('@mediapipe/tasks-vision');
    try {
      const fileset = await FilesetResolver.forVisionTasks(new URL('/mediapipe-wasm', window.location.href).href, false);
      this.fallbackLandmarker = await PoseLandmarkerClass.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: new URL(POSE_MODEL.localPath, window.location.href).href,
          delegate: POSE_OPTIONS.delegate,
        },
        runningMode: POSE_OPTIONS.runningMode,
        numPoses: POSE_OPTIONS.numPoses,
        minPoseDetectionConfidence: POSE_OPTIONS.minPoseDetectionConfidence,
        minPosePresenceConfidence: POSE_OPTIONS.minPosePresenceConfidence,
        minTrackingConfidence: POSE_OPTIONS.minTrackingConfidence,
        outputSegmentationMasks: POSE_OPTIONS.outputSegmentationMasks,
      });
      this.mode = 'BOUNDED_MAIN_THREAD_FALLBACK';
      this.ready = true;
      this.modelStatus = 'READY';
      this.telemetry.start(performance.now());
      this.callbacks.onStatus(this.modelStatus, this.mode, 'Pose Landmarker ready · bounded main-thread fallback');
    } catch (error) {
      this.mode = 'FAILED';
      const text = error instanceof Error ? error.message : String(error);
      this.modelStatus = /404|fetch/i.test(text) ? 'MISSING' : 'ERROR';
      this.callbacks.onStatus(this.modelStatus, this.mode, `Pose initialization failed: ${text}`);
      throw error;
    }
  }

  private handleWorkerMessage(message: PerceptionWorkerResponse): void {
    if (message.type === 'progress') {
      const text = message.stage === 'wasm'
        ? '正在加载本机视觉运行时（WASM）…'
        : '视觉运行时已就绪，正在加载姿态模型…';
      this.callbacks.onStatus('LOADING', 'WORKER', text);
      return;
    }
    if (message.type === 'ready') {
      this.initResolve?.();
      return;
    }
    if (message.type === 'error') {
      this.busy = false;
      if (message.stage === 'init') this.initReject?.(new Error(message.message));
      else this.callbacks.onError(`Pose worker inference failed: ${message.message}`);
      return;
    }
    this.busy = false;
    this.recordResult(message.inferenceMs, message.state, message.rawMeasurement);
  }

  private recordResult(inferenceMs: number, state: StructuredPerceptionState, rawMeasurement: PoseMeasurement | null): void {
    this.telemetry.record(inferenceMs, state);
    this.callbacks.onState(state, rawMeasurement);
  }
}
