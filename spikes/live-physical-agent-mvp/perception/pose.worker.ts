import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { PERCEPTION_CONFIG, POSE_OPTIONS } from './config.js';
import { extractPoseMeasurement } from './geometry.js';
import { PerceptionStateTracker } from './state-tracker.js';
import { extractSemanticRawMeasurement } from '../semantic-framing/measurement.js';
import { SemanticFramingTracker } from '../semantic-framing/tracker.js';
import type { PerceptionWorkerRequest, PerceptionWorkerResponse } from './types.js';

let landmarker: PoseLandmarker | null = null;
let tracker: PerceptionStateTracker | null = null;
let framingTracker: SemanticFramingTracker | null = null;

const send = (message: PerceptionWorkerResponse): void => self.postMessage(message);

self.onmessage = async (event: MessageEvent<PerceptionWorkerRequest>) => {
  const message = event.data;
  if (message.type === 'init') {
    try {
      send({ type: 'progress', stage: 'wasm' });
      const fileset = await FilesetResolver.forVisionTasks(message.wasmBaseUrl, true);
      send({ type: 'progress', stage: 'model' });
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
      framingTracker = new SemanticFramingTracker();
      send({ type: 'ready', mode: 'WORKER' });
    } catch (error) {
      send({ type: 'error', stage: 'init', message: error instanceof Error ? error.message : String(error) });
    }
    return;
  }

  if (message.type === 'reset') {
    tracker?.reset();
    framingTracker?.reset();
    return;
  }

  if (message.type === 'close') {
    landmarker?.close();
    landmarker = null;
    tracker = null;
    framingTracker = null;
    self.close();
    return;
  }

  const { frame, timestamp, visibleSensorRect } = message;
  const startedAt = performance.now();
  try {
    if (!landmarker || !tracker || !framingTracker) throw new Error('Pose worker is not initialized');
    const result = landmarker.detectForVideo(frame, timestamp);
    const landmarks=result.landmarks[0] ?? [];
    const measurement = extractPoseMeasurement(landmarks, timestamp, PERCEPTION_CONFIG);
    const state = tracker.update(measurement, timestamp);
    const semanticRawMeasurement=landmarks.length?extractSemanticRawMeasurement(landmarks,timestamp,PERCEPTION_CONFIG,visibleSensorRect,measurement):null;
    state.framing=framingTracker.update(semanticRawMeasurement,timestamp,state.sequence);
    send({
      type: 'result',
      state,
      rawMeasurement: measurement,
      semanticRawMeasurement,
      inferenceMs: performance.now() - startedAt,
    });
  } catch (error) {
    send({ type: 'error', stage: 'inference', message: error instanceof Error ? error.message : String(error) });
  } finally {
    frame.close();
  }
};
