import type { StructuredPerceptionState } from '../../perception/types.js';
import { DEFAULT_TARGET } from '../../closed-loop/config.js';
const S = DEFAULT_TARGET.height_ratio;
export function frame(timestamp_ms: number, center_x: number | null, height_ratio: number | null, stable = false, center_y: number | null = 0.5, velocity_x = 0, velocity_scale = 0): StructuredPerceptionState {
  const present = center_x !== null && center_y !== null && height_ratio !== null;
  return { timestamp_ms, sequence: Math.round(timestamp_ms / 100), coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED', subject: { present, confidence: present ? 0.9 : 0, center_x, center_y, width_ratio: present ? 0.3 : null, height_ratio, velocity_x: present ? velocity_x : null, velocity_y: present ? 0 : null, velocity_scale: present ? velocity_scale : null, stable }, measurement_age_ms: present ? 0 : 500, subject_loss_count: present ? 0 : 1, reacquisition_count: 0 };
}
const xSuccess = [frame(0,.2,S),frame(300,.2,S),frame(700,.35,S,false,.5,.2),frame(1500,.5,S,true),frame(1900,.5,S,true),frame(2500,.5,S,true),frame(3100,.5,S,true)];
const scaleSuccess = [frame(0,.5,.12),frame(300,.5,.12),frame(700,.5,.25,false,.5,0,.2),frame(1500,.5,S,true),frame(1900,.5,S,true)];
export const CLOSED_LOOP_TRAJECTORIES = {
  'delayed-user-response':[frame(0,.2,S),frame(300,.2,S),frame(900,.2,S,true),frame(1300,.35,S,false),frame(1700,.5,S,true),frame(2100,.5,S,true)],
  'correct-gradual-x':xSuccess,
  'correct-gradual-scale':scaleSuccess,
  'target-cross-into-deadband':[frame(0,.2,S),frame(300,.2,S),frame(800,.53,S,false),frame(1500,.53,S,true),frame(1900,.53,S,true)],
  'target-overshoot-outside-deadband':[frame(0,.2,S),frame(300,.2,S),frame(800,.65,S,false),frame(1500,.65,S,true),frame(1900,.65,S,true)],
  'true-wrong-direction':[frame(0,.2,S),frame(300,.2,S),frame(800,.1,S,false),frame(1500,.1,S,true),frame(1900,.1,S,true)],
  'no-motion':[frame(0,.2,S),frame(300,.2,S),frame(1300,.2,S,true),frame(1700,.2,S,true)],
  'jitter-only':[frame(0,.2,S),frame(300,.2,S),frame(1300,.205,S,true),frame(1700,.195,S,true)],
  'improving-then-stop':[frame(0,.2,S),frame(300,.2,S),frame(800,.35,S,false),frame(1500,.4,S,true),frame(1900,.4,S,true)],
  'improve-then-regress-before-settle':[frame(0,.2,S),frame(300,.2,S),frame(800,.4,S,false),frame(1200,.15,S,false),frame(1600,.18,S,true),frame(2000,.18,S,true)],
  'repeated-no-effect-reissue':[frame(0,.2,S),frame(300,.2,S),frame(1300,.2,S,true),frame(1700,.2,S,true),frame(2000,.2,S),frame(2300,.2,S),frame(3300,.2,S,true),frame(3700,.2,S,true)],
  'ready-after-success':xSuccess,
  'ready-blocked-before-terminal':[frame(0,.2,S),frame(300,.2,S),frame(800,.5,S,true),frame(1000,.5,S,true)],
  'hold-not-counted-as-instruction':[frame(0,.5,S,true),frame(600,.5,S,true),frame(900,.5,S,true),frame(1300,.5,S,true)],
  'trial-timer-invariant':xSuccess,
  'eight-render-frames-one-instruction-event':[frame(0,.2,S),frame(300,.2,S),frame(400,.2,S),frame(500,.2,S),frame(600,.2,S),frame(700,.2,S),frame(800,.2,S),frame(900,.2,S),frame(1000,.2,S)],
  'x-then-scale-sequential-corrections':[...xSuccess.slice(0,5).map((f)=>({...f,subject:{...f.subject,height_ratio:.12}})),frame(2200,.5,.12),frame(2500,.5,.12),frame(2900,.5,.25,false),frame(3600,.5,S,true),frame(4000,.5,S,true)],
  'temporary-subject-loss-during-episode':[frame(0,.2,S),frame(300,.2,S),frame(700,null,null),frame(1000,.35,S,false),frame(1500,.5,S,true),frame(1900,.5,S,true)],
  'servo-correct-inside-deadband':[frame(0,.2,S),frame(300,.2,S),frame(700,.43,S,false,.5,.3),frame(950,.49,S,true),frame(1350,.49,S,true),frame(2000,.49,S,true)],
  'servo-stops-halfway':[frame(0,.2,S),frame(300,.2,S),frame(700,.32,S,false,.5,.12),frame(1100,.36,S,true),frame(1500,.36,S,true)],
  'servo-correct-overshoot':[frame(0,.2,S),frame(300,.2,S),frame(700,.44,S,false,.5,.32),frame(950,.64,S,false,.5,.25),frame(1300,.64,S,true),frame(1700,.64,S,true)],
  'servo-fast-overshoot':[frame(0,.2,S),frame(300,.2,S),frame(600,.40,S,false,.5,.65),frame(750,.68,S,false,.5,.6),frame(1150,.68,S,true),frame(1550,.68,S,true)],
  'servo-slow-overshoot':[frame(0,.2,S),frame(300,.2,S),frame(800,.38,S,false,.5,.12),frame(1300,.44,S,false,.5,.12),frame(1800,.57,S,false,.5,.1),frame(2200,.62,S,true),frame(2600,.62,S,true)],
  'servo-no-motion':[frame(0,.2,S),frame(300,.2,S),frame(1300,.2,S,true),frame(1700,.2,S,true)],
  'servo-late-motion':[frame(0,.2,S),frame(300,.2,S),frame(1250,.2,S,true),frame(1500,.36,S,false,.5,.2),frame(1900,.4,S,true),frame(2300,.4,S,true)],
  'servo-jitter-only':[frame(0,.2,S),frame(300,.2,S),frame(1300,.205,S,true),frame(1700,.195,S,true)],
  'servo-true-wrong':[frame(0,.2,S),frame(300,.2,S),frame(800,.1,S,false,.5,-.2),frame(1500,.1,S,true),frame(1900,.1,S,true)],
  'servo-axis-coupled':[frame(0,.2,.12),frame(300,.2,.12),frame(700,.43,.2,false,.5,.3,.2),frame(1100,.49,.22,true),frame(1500,.49,.22,true)],
  'servo-stop-success':[frame(0,.2,S),frame(300,.2,S),frame(700,.43,S,false,.5,.3),frame(950,.49,S,true),frame(1350,.49,S,true),frame(2000,.49,S,true)],
  'servo-stop-once':[frame(0,.2,S),frame(300,.2,S),frame(650,.41,S,false,.5,.3),frame(750,.44,S,false,.5,.3),frame(850,.47,S,false,.5,.2),frame(1100,.49,S,true),frame(1500,.49,S,true)],
  'servo-stop-not-ordinary':[frame(0,.2,S),frame(300,.2,S),frame(700,.43,S,false,.5,.3),frame(900,.48,S,true),frame(1300,.48,S,true)],
  'servo-stop-hysteresis':[frame(0,.2,S),frame(300,.2,S),frame(650,.42,S,false,.5,.3),frame(750,.41,S,false,.5,-.05),frame(850,.45,S,false,.5,.2),frame(950,.43,S,false,.5,-.1),frame(1300,.49,S,true),frame(1700,.49,S,true)],
  'servo-wrong-then-satisfied':[frame(0,.2,S),frame(300,.2,S),frame(800,.1,S,false,.5,-.2),frame(1500,.1,S,true),frame(1900,.1,S,true),frame(2200,.5,S,true),frame(2800,.5,S,true),frame(3450,.5,S,true)],
  'servo-pending-to-ready':[frame(0,.2,S),frame(300,.2,S),frame(800,.1,S,false,.5,-.2),frame(1500,.1,S,true),frame(1900,.1,S,true),frame(2200,.5,S,true),frame(2800,.5,S,true),frame(3450,.5,S,true)],
  'servo-pending-breaks':[frame(0,.2,S),frame(300,.2,S),frame(800,.1,S,false,.5,-.2),frame(1500,.1,S,true),frame(1900,.1,S,true),frame(2200,.5,S,true),frame(2700,.7,S,false),frame(3000,.7,S),frame(3300,.7,S)],
  'servo-success-normal-ready':xSuccess,
  'servo-hold-distinct-stop':[frame(0,.2,S),frame(300,.2,S),frame(700,.43,S,false,.5,.3),frame(950,.49,S,true),frame(1350,.49,S,true),frame(2000,.49,S,true)],
  'servo-partial-refinement':[frame(0,.2,S),frame(300,.2,S),frame(700,.32,S,false,.5,.12),frame(1100,.36,S,true),frame(1500,.36,S,true),frame(1800,.36,S),frame(2200,.36,S),frame(2500,.43,S,false,.5,.15),frame(2900,.49,S,true),frame(3300,.49,S,true)],
  'servo-ready-source':[frame(0,.2,S),frame(300,.2,S),frame(700,.43,S,false,.5,.3),frame(950,.49,S,true),frame(1350,.49,S,true),frame(2000,.49,S,true)],
  'servo-high-velocity-crossing':[frame(0,.2,S),frame(300,.2,S),frame(650,.42,S,false,.5,.7),frame(750,.62,S,false,.5,.7),frame(1150,.62,S,true),frame(1550,.62,S,true)],
  'servo-low-velocity-crossing':[frame(0,.2,S),frame(300,.2,S),frame(900,.42,S,false,.5,.1),frame(1400,.48,S,false,.5,.1),frame(1900,.56,S,false,.5,.08),frame(2300,.56,S,true),frame(2700,.56,S,true)],
  'servo-axis-switch-after-terminal':[frame(0,.2,.12),frame(300,.2,.12),frame(700,.43,.2,false,.5,.3,.2),frame(1100,.49,.2,true),frame(1500,.49,.2,true),frame(1800,.49,.2),frame(2200,.49,.2),frame(2500,.49,.3,false,.5,0,.2),frame(2900,.49,S,true),frame(3300,.49,S,true)],
  'servo-local-recovery':[frame(0,.2,S),frame(300,.2,S),frame(1300,.2,S,true),frame(1700,.2,S,true),frame(2000,.2,S),frame(2300,.2,S),frame(3300,.2,S,true),frame(3700,.2,S,true),frame(4000,.2,S),frame(4300,.2,S),frame(5300,.2,S,true),frame(5700,.2,S,true),frame(6000,.2,S),frame(6300,.2,S),frame(7300,.2,S,true),frame(7700,.2,S,true)],
  'servo-local-auto-recovery':[frame(0,.2,S),frame(300,.2,S),frame(1300,.2,S,true),frame(1700,.2,S,true),frame(2000,.2,S),frame(2300,.2,S),frame(3300,.2,S,true),frame(3700,.2,S,true),frame(4000,.2,S),frame(4300,.2,S),frame(5300,.2,S,true),frame(5700,.2,S,true),frame(6000,.2,S),frame(6300,.2,S),frame(7300,.2,S,true),frame(7700,.2,S,true),frame(8200,.2,S,true),frame(9000,.2,S,true),frame(9300,.2,S,true)],
} as const;
