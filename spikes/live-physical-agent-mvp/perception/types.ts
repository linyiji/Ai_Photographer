import type { FramingMeasurement, SemanticRawMeasurement, VisibleSensorRect } from '../semantic-framing/types.js';

export interface PerceptionConfig {
  visionTargetHz: number;
  visibilityThreshold: number;
  presenceThreshold: number;
  minimumValidLandmarks: number;
  emaAlpha: number;
  stableWindowMs: number;
  stableVelocityThreshold: number;
  stableScaleVelocityThreshold: number;
  subjectLossPersistenceMs: number;
  inferenceHistoryLimit: number;
}

export interface LandmarkSample {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
}

export interface PoseMeasurement {
  timestamp_ms: number;
  confidence: number;
  pose_presence: number;
  valid_landmark_count: number;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
  center_x: number;
  center_y: number;
  width_ratio: number;
  height_ratio: number;
}

export interface SubjectPerceptionState {
  present: boolean;
  confidence: number;
  center_x: number | null;
  center_y: number | null;
  width_ratio: number | null;
  height_ratio: number | null;
  velocity_x: number | null;
  velocity_y: number | null;
  velocity_scale: number | null;
  stable: boolean;
  valid_landmark_count?: number;
  pose_presence?: number;
}

export interface StructuredPerceptionState {
  timestamp_ms: number;
  sequence: number;
  coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED';
  subject: SubjectPerceptionState;
  measurement_age_ms: number | null;
  subject_loss_count: number;
  reacquisition_count: number;
  framing?: FramingMeasurement | null;
}

export type PerceptionExecutionMode = 'UNINITIALIZED' | 'WORKER' | 'BOUNDED_MAIN_THREAD_FALLBACK' | 'FAILED';
export type PoseModelStatus = 'LAZY' | 'LOADING' | 'READY' | 'MISSING' | 'ERROR';

export interface PerceptionTelemetrySnapshot {
  duration_ms: number;
  preview_fps_avg: number;
  vision_target_hz: number;
  vision_hz_avg: number;
  state_hz_avg: number;
  inference_ms_current: number;
  inference_ms_p50: number;
  inference_ms_p95: number;
  scheduled_frames: number;
  processed_frames: number;
  skipped_busy_frames: number;
  subject_detected_ratio: number;
  subject_loss_count: number;
  reacquisition_count: number;
  measurement_age_ms: number | null;
  worker_mode: PerceptionExecutionMode;
  memory_mb: number | null;
  cpu_observation: 'BROWSER_API_UNAVAILABLE';
  thermal_observation: 'BROWSER_API_UNAVAILABLE';
  raw_video_upload: 0;
  backend_per_frame_calls: 0;
  provider_calls: 0;
  luna_calls: 0;
}

export interface WorkerInitMessage {
  type: 'init';
  wasmBaseUrl: string;
  modelUrl: string;
  config: PerceptionConfig;
}

export interface WorkerProcessMessage {
  type: 'process';
  frame: ImageBitmap;
  timestamp: number;
  visibleSensorRect: VisibleSensorRect;
}

export interface WorkerResetMessage { type: 'reset' }
export interface WorkerCloseMessage { type: 'close' }

export type PerceptionWorkerRequest = WorkerInitMessage | WorkerProcessMessage | WorkerResetMessage | WorkerCloseMessage;

export type PerceptionWorkerResponse =
  | { type: 'ready'; mode: 'WORKER' }
  | { type: 'progress'; stage: 'wasm' | 'model' }
  | { type: 'result'; state: StructuredPerceptionState; rawMeasurement: PoseMeasurement | null; semanticRawMeasurement: SemanticRawMeasurement | null; inferenceMs: number }
  | { type: 'error'; stage: 'init' | 'inference'; message: string };
