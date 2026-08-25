import type { StructuredPerceptionState } from '../../perception/types.js';
import { DEFAULT_TARGET } from '../../closed-loop/config.js';

const TARGET_SCALE = DEFAULT_TARGET.height_ratio;

export function frame(timestamp_ms: number, center_x: number | null, height_ratio: number | null, stable = false, center_y: number | null = 0.5): StructuredPerceptionState {
  const present = center_x !== null && center_y !== null && height_ratio !== null;
  return {
    timestamp_ms, sequence: Math.round(timestamp_ms / 100), coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED',
    subject: {
      present, confidence: present ? 0.9 : 0, center_x, center_y,
      width_ratio: present ? 0.3 : null, height_ratio,
      velocity_x: present ? 0 : null, velocity_y: present ? 0 : null, velocity_scale: present ? 0 : null,
      stable,
    },
    measurement_age_ms: present ? 0 : 500,
    subject_loss_count: present ? 0 : 1,
    reacquisition_count: 0,
  };
}

export const CLOSED_LOOP_TRAJECTORIES = {
  'subject-missing-then-enter': [frame(0, null, null), frame(400, 0.5, TARGET_SCALE, true), frame(1000, 0.5, TARGET_SCALE, true)],
  'left-to-target': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(800, 0.36, TARGET_SCALE), frame(1500, 0.5, TARGET_SCALE, true), frame(2100, 0.5, TARGET_SCALE, true), frame(2200, 0.5, TARGET_SCALE, true)],
  'right-to-target': [frame(0, 0.8, TARGET_SCALE), frame(300, 0.8, TARGET_SCALE), frame(1500, 0.5, TARGET_SCALE, true)],
  'too-far-move-closer': [frame(0, 0.5, 0.15), frame(300, 0.5, 0.15), frame(1500, 0.5, TARGET_SCALE, true)],
  'too-close-move-farther': [frame(0, 0.5, 0.65), frame(300, 0.5, 0.65), frame(1500, 0.5, TARGET_SCALE, true)],
  'x-and-scale-both-bad': [frame(0, 0.2, 0.1), frame(300, 0.2, 0.1), frame(1500, 0.5, 0.1, true), frame(1800, 0.5, 0.1, true)],
  'improving-while-waiting': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(800, 0.35, TARGET_SCALE), frame(1500, 0.35, TARGET_SCALE, true)],
  'no-effect': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(1500, 0.2, TARGET_SCALE, true)],
  'wrong-direction': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(1500, 0.1, TARGET_SCALE, true)],
  'overshoot-through-deadband': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(1500, 0.54, TARGET_SCALE, true)],
  'jitter-inside-deadband': [frame(0, 0.48, 0.34, true), frame(300, 0.52, 0.37, true), frame(600, 0.49, 0.33, true)],
  'x-scale-priority-competition': [frame(0, 0.2, 0.1), frame(300, 0.2, 0.1)],
  'oscillation-pressure': [frame(0, 0.2, 0.3), frame(300, 0.2, 0.3), frame(600, 0.3, 0.2), frame(900, 0.2, 0.3)],
  'temporary-subject-loss': [frame(0, 0.2, TARGET_SCALE), frame(300, 0.2, TARGET_SCALE), frame(600, null, null), frame(900, 0.3, TARGET_SCALE)],
  'ready-stable-window': [frame(0, 0.5, TARGET_SCALE, true), frame(599, 0.5, TARGET_SCALE, true), frame(600, 0.5, TARGET_SCALE, true), frame(900, 0.5, TARGET_SCALE, true)],
} as const;
