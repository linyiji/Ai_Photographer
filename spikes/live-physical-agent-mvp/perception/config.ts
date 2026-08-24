import type { PerceptionConfig } from './types.js';

export const PERCEPTION_CONFIG: Readonly<PerceptionConfig> = Object.freeze({
  visionTargetHz: 8,
  visibilityThreshold: 0.55,
  presenceThreshold: 0.55,
  minimumValidLandmarks: 8,
  emaAlpha: 0.35,
  stableWindowMs: 400,
  stableVelocityThreshold: 0.08,
  stableScaleVelocityThreshold: 0.08,
  subjectLossPersistenceMs: 250,
  inferenceHistoryLimit: 600,
});

export const POSE_MODEL = Object.freeze({
  identity: 'pose_landmarker_lite / float16 / version 1',
  localPath: '/models/pose_landmarker_lite.task',
  officialUrl: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
  sha256: '59929e1d1ee95287735ddd833b19cf4ac46d29bc7afddbbf6753c459690d574a',
  sizeBytes: 5_777_746,
});

export const POSE_OPTIONS = Object.freeze({
  runningMode: 'VIDEO' as const,
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  outputSegmentationMasks: false,
  delegate: 'CPU' as const,
});
