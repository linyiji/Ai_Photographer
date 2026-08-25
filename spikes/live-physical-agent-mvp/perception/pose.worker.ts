import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { PERCEPTION_CONFIG, POSE_OPTIONS } from './config.js';
import { extractPoseMeasurement } from './geometry.js';
import { PerceptionStateTracker } from './state-tracker.js';
import type { PerceptionWorkerRequest, PerceptionWorkerResponse } from './types.js';

let landmarker: PoseLandmarker | null = null;
let tracker: PerceptionStateTracker | null = null;

const send = (message: PerceptionWorkerResponse): void => self.postMessage(message);

self.onmessage = async (event: MessageEvent<PerceptionWorkerRequest>) => {
  const message = event.data;
  if (message.type === 'init') {
    try {
      const fileset = await FilesetResolver.forVisionTasks(message.wasmBaseUrl, true);
      landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: message.modelUrl,
          delegate: POSE_OPTIONS.delegate,
        },
        runningMode: POSE_OPTIONS.runningMode,
        numPoses: POSE_OPTIONS.numPoses,
        minPoseDetectionConfidence: POSE_OPTIONS.minPoseDetectionConfidence,
        minPosePresenceConfidence: POSE_OPTIONS.minPosePresenceConfidence,
        minTrackingConfidence: POSE_OPTIONS.minTrackingConfidence,
        outputSegmentationMasks: POSE_OPTIONS.outputSegmentationMasks,
      });
      tracker = new PerceptionStateTracker(message.config);
      send({ type: 'ready', mode: 'WORKER' });
    } catch (error) {
      send({ type: 'error', stage: 'init', message: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (message.type === 'reset') {
    tracker?.reset();
    return;
  }

  if (message.type === 'close') {
    landmarker?.close();
    landmarker = null;
    tracker = null;
    self.close();
    return;
  }

  const { frame, timestamp } = message;
  const startedAt = performance.now();
  try {
    if (!landmarker || !tracker) throw new Error('Pose worker is not initialized');
    const result = landmarker.detectForVideo(frame, timestamp);
    const measurement = extractPoseMeasurement(result.landmarks[0] ?? [], timestamp, PERCEPTION_CONFIG);
    const state = tracker.update(measurement, timestamp);
    send({
      type: 'result',
      state,
      rawMeasurement: measurement,
      inferenceMs: performance.now() - startedAt,
    });
  } catch (error) {
    send({ type: 'error', stage: 'inference', message: error instanceof Error ? error.message : String(error) });
  } finally {
    frame.close();
  }
};
