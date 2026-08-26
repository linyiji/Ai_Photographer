import assert from 'node:assert/strict';
import test from 'node:test';
import { PERCEPTION_FIXTURES, poseBox } from '../fixtures/perception/synthetic-landmarks.js';
import { PERCEPTION_CONFIG } from '../perception/config.js';
import { extractPoseMeasurement } from '../perception/geometry.js';
import { BoundedFrameScheduler } from '../perception/scheduler.js';
import { PerceptionStateTracker } from '../perception/state-tracker.js';
import { WORKER_INITIALIZATION_TIMEOUT_MS, WorkerInitializationTimeoutError } from '../perception/initialization-policy.js';

test('slow cold start gets one bounded 120s attempt instead of a 45s fallback restart', () => {
  assert.equal(WORKER_INITIALIZATION_TIMEOUT_MS, 120_000);
  const error = new WorkerInitializationTimeoutError();
  assert.equal(error.name, 'WorkerInitializationTimeoutError');
  assert.match(error.message, /120s/);
  assert.match(error.message, /not restarted/);
});

const measurement = (name: string, index = 0) => {
  const frame = PERCEPTION_FIXTURES[name]?.[index];
  assert.ok(frame?.landmarks, `fixture ${name}[${index}] must have landmarks`);
  const result = extractPoseMeasurement(frame.landmarks, frame.timestamp_ms, PERCEPTION_CONFIG);
  assert.ok(result);
  return result;
};

test('geometry extracts bounded normalized dimensions and rejects invalid measurements', () => {
  const centered = measurement('centered-static');
  assert.ok(Math.abs(centered.center_x - 0.5) < 1e-9);
  assert.ok(Math.abs(centered.center_y - 0.5) < 1e-9);
  assert.ok(Math.abs(centered.width_ratio - 0.3) < 1e-9);
  assert.ok(Math.abs(centered.height_ratio - 0.6) < 1e-9);
  assert.equal(extractPoseMeasurement(poseBox(0.5, 0.5, 0.3, 0.6, 0.2), 0, PERCEPTION_CONFIG), null);
  assert.equal(extractPoseMeasurement([{ x: Number.NaN, y: 0.5, visibility: 1 }], 0, PERCEPTION_CONFIG), null);
  for (const value of Object.values(centered)) assert.ok(Number.isFinite(value));
  for (const value of [centered.min_x, centered.max_x, centered.min_y, centered.max_y, centered.center_x, centered.center_y, centered.width_ratio, centered.height_ratio]) {
    assert.ok(value >= 0 && value <= 1);
  }
});

test('EMA smooths raw measurements and velocity signs use timestamp-normalized sensor coordinates', () => {
  const tracker = new PerceptionStateTracker(PERCEPTION_CONFIG);
  const first = tracker.update(measurement('move-left-to-right', 0), 0);
  const secondRaw = measurement('move-left-to-right', 1);
  const second = tracker.update(secondRaw, 125);
  assert.ok(second.subject.center_x !== null && first.subject.center_x !== null);
  assert.ok(second.subject.center_x > first.subject.center_x);
  assert.ok(second.subject.center_x < secondRaw.center_x);
  assert.ok((second.subject.velocity_x ?? 0) > 0);

  const reverse = new PerceptionStateTracker(PERCEPTION_CONFIG);
  reverse.update(measurement('move-right-to-left', 0), 0);
  const reverseState = reverse.update(measurement('move-right-to-left', 1), 125);
  assert.ok((reverseState.subject.velocity_x ?? 0) < 0);
});

test('height velocity is positive closer and negative farther', () => {
  const closer = new PerceptionStateTracker(PERCEPTION_CONFIG);
  closer.update(measurement('closer', 0), 0);
  assert.ok((closer.update(measurement('closer', 1), 125).subject.velocity_scale ?? 0) > 0);

  const farther = new PerceptionStateTracker(PERCEPTION_CONFIG);
  farther.update(measurement('farther', 0), 0);
  assert.ok((farther.update(measurement('farther', 1), 125).subject.velocity_scale ?? 0) < 0);
});

test('stability requires a rolling quiet window and clears when movement resumes', () => {
  const tracker = new PerceptionStateTracker(PERCEPTION_CONFIG);
  let state = tracker.update(measurement('centered-static', 0), 0);
  assert.equal(state.subject.stable, false);
  for (let index = 1; index < PERCEPTION_FIXTURES['centered-static'].length; index += 1) {
    state = tracker.update(measurement('centered-static', index), index * 125);
  }
  assert.equal(state.subject.stable, true);
  state = tracker.update(extractPoseMeasurement(poseBox(0.7, 0.5, 0.3, 0.6), 625, PERCEPTION_CONFIG), 625);
  assert.equal(state.subject.stable, false);
});

test('temporary loss is bounded and reacquisition resets velocity without a stale jump', () => {
  const tracker = new PerceptionStateTracker(PERCEPTION_CONFIG);
  tracker.update(measurement('centered-static'), 0);
  const oneMissing = tracker.update(null, 125);
  assert.equal(oneMissing.subject.present, true);
  assert.equal(oneMissing.subject.stable, false);
  const lost = tracker.update(null, 375);
  assert.equal(lost.subject.present, false);
  assert.equal(lost.subject.center_x, null);
  assert.equal(lost.subject_loss_count, 1);
  const reacquiredMeasurement = extractPoseMeasurement(poseBox(0.7, 0.5, 0.3, 0.6), 500, PERCEPTION_CONFIG);
  const reacquired = tracker.update(reacquiredMeasurement, 500);
  assert.equal(reacquired.subject.present, true);
  assert.equal(reacquired.reacquisition_count, 1);
  assert.equal(reacquired.subject.velocity_x, 0);
});

test('near-threshold jitter settles to stable with finite bounded output', () => {
  const tracker = new PerceptionStateTracker(PERCEPTION_CONFIG);
  let state = tracker.update(measurement('jitter-near-threshold', 0), 0);
  for (let index = 1; index < PERCEPTION_FIXTURES['jitter-near-threshold'].length; index += 1) {
    state = tracker.update(measurement('jitter-near-threshold', index), index * 125);
  }
  assert.equal(state.subject.stable, true);
  for (const value of [state.subject.center_x, state.subject.center_y, state.subject.width_ratio, state.subject.height_ratio]) {
    assert.ok(value !== null && Number.isFinite(value) && value >= 0 && value <= 1);
  }
});

test('bounded scheduler never queues work while busy', () => {
  const scheduler = new BoundedFrameScheduler(8);
  assert.deepEqual(scheduler.decide(0, false), { due: true, accepted: true });
  assert.deepEqual(scheduler.decide(50, false), { due: false, accepted: false });
  assert.deepEqual(scheduler.decide(125, true), { due: true, accepted: false });
  assert.deepEqual(scheduler.decide(250, false), { due: true, accepted: true });
  assert.equal(scheduler.scheduledFrames, 3);
  assert.equal(scheduler.skippedBusyFrames, 1);
});
