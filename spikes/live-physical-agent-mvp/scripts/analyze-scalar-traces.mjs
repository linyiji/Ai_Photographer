import { readFile } from 'node:fs/promises';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Provide one or more xfx-live-p2-scalar-trace-v1 JSON files.');
const tolerance = { X_POSITION: 0.05, SCALE: 0.07 };
const value = (row, issue) => issue === 'X_POSITION' ? row.delta_x : row.delta_scale;
const velocity = (row, issue) => issue === 'X_POSITION' ? row.velocity_x : row.velocity_scale;
const otherValue = (row, issue) => issue === 'X_POSITION' ? row.delta_scale / 0.07 : row.delta_x / 0.05;
const abs = Math.abs;

function analyzeEpisode(trial, rows) {
  const issued = rows.find((r) => r.instruction_event && r.instruction_event.action !== 'HOLD');
  const terminal = rows.find((r) => r.episode_state === 'TERMINAL');
  if (!issued || !terminal) return null;
  const issue = issued.active_issue;
  const base = value(issued, issue); const baseError = abs(base) / tolerance[issue];
  const samples = rows.filter((r) => Number.isFinite(value(r, issue)));
  const errors = samples.map((r) => abs(value(r, issue)) / tolerance[issue]);
  const bestError = Math.min(...errors); const bestIndex = errors.indexOf(bestError); const best = samples[bestIndex];
  const finalDelta = value(terminal, issue); const finalError = abs(finalDelta) / tolerance[issue];
  const entered = errors.some((e) => e <= 1); const crossed = samples.some((r) => value(r, issue) * base < 0);
  const leftAfterEntry = entered && finalError > 1.25;
  const corridor = samples.find((r) => abs(value(r, issue)) / tolerance[issue] <= 1.5);
  const deadband = samples.find((r) => abs(value(r, issue)) / tolerance[issue] <= 1);
  const motion = samples.find((r) => abs((abs(value(r, issue)) / tolerance[issue]) - baseError) >= 0.18);
  const velocities = samples.map((r) => abs(velocity(r, issue) ?? 0));
  const peakVelocity = Math.max(...velocities); const finalVelocity = velocity(terminal, issue) ?? 0;
  const progress = baseError ? (baseError - bestError) / baseError : 0;
  const otherBase = otherValue(issued, issue); const otherFinal = otherValue(terminal, issue);
  const otherChange = abs(otherFinal) - abs(otherBase);
  let subtype = null;
  if (terminal.verification === 'NO_EFFECT') {
    // Physical target entry/crossing is the strongest causal signal and takes
    // precedence over response timing. Late motion can coexist with overshoot,
    // but silence through the useful stopping point is the dominant failure.
    if ((crossed || entered) && (leftAfterEntry || finalError > 1.25)) subtype = 'OVERSHOOT';
    else if (!motion && peakVelocity < 0.02) subtype = errors.reduce((a, b) => Math.max(a, b), 0) - Math.min(...errors) < 0.18 ? 'JITTER_OR_UNCERTAIN' : 'NO_MOTION';
    else if (motion && motion.timestamp - issued.timestamp > 900) subtype = 'LATE_RESPONSE';
    else if (abs(finalVelocity) > 0.04 && terminal.stable) subtype = 'PREMATURE_SETTLE';
    else if (progress >= 0.2 && otherChange > 0.75) subtype = 'AXIS_COUPLED';
    else if (progress >= 0.2) subtype = 'INSUFFICIENT_PROGRESS';
    else if (peakVelocity < 0.03) subtype = 'JITTER_OR_UNCERTAIN';
    else subtype = 'UNCLASSIFIED';
  }
  let wrongAudit = null;
  if (terminal.verification === 'WRONG_DIRECTION') {
    // A coupled-axis change does not excuse worsening on the commanded axis.
    // It is only an artifact when that commanded axis itself made useful progress.
    wrongAudit = crossed ? 'TARGET_CROSS_OVERSHOOT' : otherChange > 0.75 && progress >= 0.2 ? 'AXIS_COUPLING_ARTIFACT' : peakVelocity < 0.03 ? 'MEASUREMENT_UNCERTAIN' : 'TRUE_WRONG_DIRECTION';
  }
  return {
    trial_id: trial, episode_id: issued.episode_id, issue, action: issued.instruction_event.action,
    issued_at: issued.timestamp, terminal_at: terminal.timestamp,
    baseline_signed_delta: base, baseline_normalized_error: baseError,
    motion_detected_at: motion?.timestamp ?? null, motion_start_delta: motion ? value(motion, issue) : null,
    best_signed_delta: value(best, issue), best_normalized_error: bestError, best_at: best.timestamp,
    final_signed_delta: finalDelta, final_normalized_error: finalError,
    target_crossed: crossed, entered_deadband: entered, left_deadband_after_entry: leftAfterEntry,
    near_target_corridor_entered_at: corridor?.timestamp ?? null,
    deadband_entered_at: deadband?.timestamp ?? null,
    velocity_at_corridor_entry: corridor ? velocity(corridor, issue) : null,
    velocity_at_deadband_entry: deadband ? velocity(deadband, issue) : null,
    normalized_travel_after_corridor_entry: corridor ? finalError - abs(value(corridor, issue)) / tolerance[issue] : null,
    directional_progress_ratio: progress, total_signed_displacement: finalDelta - base,
    peak_velocity: peakVelocity, final_velocity: finalVelocity,
    time_to_motion_start: motion ? motion.timestamp - issued.timestamp : null,
    time_to_settle: terminal.timestamp - (motion?.timestamp ?? issued.timestamp), episode_duration: terminal.timestamp - issued.timestamp,
    other_axis_normalized_change: otherChange, terminal_outcome: terminal.verification,
    no_effect_subtype: subtype, wrong_direction_audit: wrongAudit,
    ready_after_episode: false, ready_delay: null,
    action_compliant: Boolean(motion && progress >= 0.2 && wrongAudit !== 'TRUE_WRONG_DIRECTION'), axis_completed: terminal.verification === 'SUCCESS', next_episode_issue: null, next_episode_action: null,
  };
}

const episodes = [];
for (let index = 0; index < files.length; index += 1) {
  const parsed = JSON.parse(await readFile(files[index], 'utf8'));
  if (parsed.format !== 'xfx-live-p2-scalar-trace-v1' || parsed.raw_media !== false) throw new Error(`Invalid trace: ${files[index]}`);
  const groups = Map.groupBy(parsed.rows.filter((r) => r.episode_id != null), (r) => r.episode_id);
  const traceEpisodes = [];
  for (const rows of groups.values()) { const result = analyzeEpisode(String.fromCharCode(65 + index), rows); if (result) traceEpisodes.push(result); }
  traceEpisodes.sort((a, b) => a.episode_id - b.episode_id);
  for (let episodeIndex = 0; episodeIndex < traceEpisodes.length; episodeIndex += 1) {
    const episode = traceEpisodes[episodeIndex]; const next = traceEpisodes[episodeIndex + 1];
    episode.next_episode_issue = next?.issue ?? null; episode.next_episode_action = next?.action ?? null;
    const after = parsed.rows.filter((row) => row.timestamp >= episode.terminal_at && (!next || row.timestamp < next.issued_at));
    const ready = after.find((row) => row.runtime_state === 'READY');
    episode.ready_after_episode = Boolean(ready); episode.ready_delay = ready ? ready.timestamp - episode.terminal_at : null;
    episodes.push(episode);
  }
}
const taxonomy = Object.fromEntries(['NO_MOTION','INSUFFICIENT_PROGRESS','OVERSHOOT','JITTER_OR_UNCERTAIN','AXIS_COUPLED','PREMATURE_SETTLE','LATE_RESPONSE','UNCLASSIFIED'].map((k) => [k, episodes.filter((e) => e.no_effect_subtype === k).length]));
const wrong = Object.fromEntries(['TRUE_WRONG_DIRECTION','TARGET_CROSS_OVERSHOOT','AXIS_COUPLING_ARTIFACT','MEASUREMENT_UNCERTAIN'].map((k) => [k, episodes.filter((e) => e.wrong_direction_audit === k).length]));
const terminal = episodes.length; const successes = episodes.filter((e) => e.terminal_outcome === 'SUCCESS').length;
const output = { format: 'xfx-live-p2-episode-analysis-v1', traces: files.length, terminal_episodes: terminal, success: successes, no_effect: episodes.filter((e) => e.terminal_outcome === 'NO_EFFECT').length, wrong_direction: episodes.filter((e) => e.terminal_outcome === 'WRONG_DIRECTION').length, correction_success_rate: successes / terminal, action_compliance_rate: episodes.filter((e) => e.action_compliant).length / terminal, axis_completion_rate: successes / terminal, no_effect_taxonomy: taxonomy, wrong_direction_audit: wrong, episodes };
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
