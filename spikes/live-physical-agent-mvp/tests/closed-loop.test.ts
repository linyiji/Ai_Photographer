import assert from 'node:assert/strict';
import test from 'node:test';
import { CLOSED_LOOP_TRAJECTORIES, frame } from '../fixtures/closed-loop/trajectories.js';
import { CLOSED_LOOP_CONFIG, DEFAULT_TARGET } from '../closed-loop/config.js';
import { actionForIssue, computeDelta, LocalClosedLoopEngine, rankIssues } from '../closed-loop/engine.js';

const run = (name: keyof typeof CLOSED_LOOP_TRAJECTORIES) => {
  const engine = new LocalClosedLoopEngine();
  return CLOSED_LOOP_TRAJECTORIES[name].map((state) => engine.update(state));
};

test('all required deterministic trajectory fixtures exist', () => {
  assert.deepEqual(Object.keys(CLOSED_LOOP_TRAJECTORIES), [
    'subject-missing-then-enter', 'left-to-target', 'right-to-target', 'too-far-move-closer',
    'too-close-move-farther', 'x-and-scale-both-bad', 'improving-while-waiting', 'no-effect',
    'wrong-direction', 'overshoot-through-deadband', 'jitter-inside-deadband',
    'x-scale-priority-competition', 'oscillation-pressure', 'temporary-subject-loss', 'ready-stable-window',
  ]);
});

test('delta/deadband are finite and missing measurements stay explicit', () => {
  const valid = computeDelta(frame(0, 0.48, 0.61), DEFAULT_TARGET);
  assert.equal(valid.x.status, 'SATISFIED'); assert.equal(valid.scale.status, 'SATISFIED');
  assert.ok(Number.isFinite(valid.x.delta)); assert.ok(Number.isFinite(valid.scale.normalized_error));
  const missing = computeDelta(frame(0, null, null), DEFAULT_TARGET);
  assert.equal(missing.x.status, 'MISSING'); assert.equal(missing.x.delta, null); assert.equal(missing.scale.normalized_error, null);
});

test('physical action mapping is based on non-mirrored sensor coordinates', () => {
  const leftOfTarget = computeDelta(frame(0, 0.2, 0.6), DEFAULT_TARGET);
  const rightOfTarget = computeDelta(frame(0, 0.8, 0.6), DEFAULT_TARGET);
  assert.equal(actionForIssue('X_POSITION', leftOfTarget), 'MOVE_LEFT');
  assert.equal(actionForIssue('X_POSITION', rightOfTarget), 'MOVE_RIGHT');
  // Front-preview CSS mirroring is deliberately not an input, so it cannot invert physical guidance.
});

test('persistence emits exactly one highest-priority instruction', () => {
  const outputs = run('x-and-scale-both-bad');
  assert.equal(outputs[1].issue?.kind, 'X_POSITION');
  assert.equal(outputs[1].instruction?.action, 'MOVE_LEFT');
  assert.equal(outputs[1].metrics.instruction_count, 1);
});

test('scale actions are correct in both directions', () => {
  assert.equal(run('too-far-move-closer')[1].instruction?.action, 'MOVE_CLOSER');
  assert.equal(run('too-close-move-farther')[1].instruction?.action, 'MOVE_FARTHER');
});

test('WAITING is silent while movement improves and respects instruction gap', () => {
  const outputs = run('improving-while-waiting');
  assert.equal(outputs[1].runtime_state, 'INSTRUCTING');
  assert.equal(outputs[2].runtime_state, 'WAITING'); assert.equal(outputs[2].instruction, null);
  assert.equal(outputs[3].verification, 'IMPROVING'); assert.equal(outputs[3].runtime_state, 'WAITING');
  assert.equal(outputs[3].metrics.instruction_count, 1);
  assert.ok(CLOSED_LOOP_CONFIG.instruction_gap_ms >= 900);
});

test('verification distinguishes success, no effect, and wrong direction', () => {
  assert.equal(run('overshoot-through-deadband')[2].verification, 'SUCCESS');
  assert.equal(run('no-effect')[2].verification, 'NO_EFFECT');
  assert.equal(run('wrong-direction')[2].verification, 'WRONG_DIRECTION');
});

test('temporary subject loss enters SEARCHING without adding an instruction', () => {
  const outputs = run('temporary-subject-loss');
  assert.equal(outputs[2].runtime_state, 'SEARCHING');
  assert.equal(outputs[2].instruction, null);
  assert.equal(outputs[2].metrics.instruction_count, 1);
});

test('READY requires stable window and HOLD is emitted once without spam', () => {
  const outputs = run('ready-stable-window');
  assert.equal(outputs[0].ready, false); assert.equal(outputs[1].ready, false);
  assert.equal(outputs[2].runtime_state, 'READY'); assert.equal(outputs[2].instruction?.action, 'HOLD');
  assert.equal(outputs[3].runtime_state, 'READY'); assert.equal(outputs[3].instruction, null);
  assert.equal(outputs[3].metrics.instruction_count, 1);
});

test('priority pressure does not rapidly oscillate X and Scale while waiting', () => {
  const outputs = run('oscillation-pressure');
  assert.equal(outputs[1].issue?.kind, 'X_POSITION');
  assert.equal(outputs[2].runtime_state, 'WAITING'); assert.equal(outputs[3].runtime_state, 'WAITING');
  assert.equal(outputs[3].metrics.oscillation_count, 0);
});

test('candidate hysteresis requires 1.25x dominance before switching issues', () => {
  const engine = new LocalClosedLoopEngine();
  assert.equal(engine.update(frame(0, 0.25, 0.3)).issue?.kind, 'X_POSITION');
  assert.equal(engine.update(frame(100, 0.3, 0.1)).issue?.kind, 'X_POSITION');
  assert.equal(engine.update(frame(200, 0.3, 0.0)).issue?.kind, 'SCALE');
  assert.equal(engine.update(frame(250, 0.25, 0.3)).metrics.oscillation_count, 1);
});

test('Y can be measured but is explicitly exempt from unsafe action mapping', () => {
  const strictTarget = { ...DEFAULT_TARGET, id: 'strict-y', y_exempt: false };
  const state = frame(0, 0.5, 0.6, true, 0.2);
  const delta = computeDelta(state, strictTarget);
  const issue = rankIssues(state, delta).find((candidate) => candidate.kind === 'Y_POSITION');
  assert.equal(issue?.action, null); assert.equal(issue?.action_mapping, 'DEFERRED_ACTION_MAPPING');
});
