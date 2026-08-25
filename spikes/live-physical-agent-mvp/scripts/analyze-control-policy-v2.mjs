import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const paths = process.argv.slice(2).sort((a, b) => basename(a).localeCompare(basename(b)));
if (!paths.length) throw new Error('Provide the accepted scalar trace files.');

const TOLERANCE = Object.freeze({ X_POSITION: 0.05, SCALE: 0.07 });
const ORDINARY = new Set(['MOVE_LEFT', 'MOVE_RIGHT', 'MOVE_CLOSER', 'MOVE_FARTHER']);
const trialId = (index) => String.fromCharCode('A'.charCodeAt(0) + index);
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const deltaFor = (row, axis) => axis === 'X_POSITION' ? row.delta_x : row.delta_scale;
const velocityFor = (row, axis) => axis === 'X_POSITION' ? row.velocity_x : row.velocity_scale;
const insideTarget = (row) => finite(row.delta_x) && finite(row.delta_scale)
  && Math.abs(row.delta_x) <= TOLERANCE.X_POSITION
  && Math.abs(row.delta_scale) <= TOLERANCE.SCALE;

function transitions(rows) {
  let previous = null; let entries = 0; let exits = 0;
  for (const row of rows) {
    const inside = insideTarget(row);
    if (previous !== null && inside !== previous) inside ? entries += 1 : exits += 1;
    previous = inside;
  }
  return { entries, exits };
}

function classifyWrong({ responseDirection, responseDelayMs, peakVelocity }) {
  if (responseDelayMs !== null && responseDelayMs > 900) return 'DELAYED_HUMAN_RESPONSE';
  if (responseDirection === 'AWAY_FROM_TARGET' && peakVelocity >= 0.03) return 'USER_MOVED_OPPOSITE';
  if (peakVelocity < 0.03) return 'MEASUREMENT_NOISE';
  return 'UNCLASSIFIED';
}

function analyzeEpisode(trial, trace, episodeId, group, allRows, ordinaryEvents) {
  const issued = group.find((row) => ORDINARY.has(row.instruction_event?.action));
  const terminal = group.find((row) => row.episode_state === 'TERMINAL'
    && ['SUCCESS', 'NO_EFFECT', 'WRONG_DIRECTION'].includes(row.verification));
  if (!issued || !terminal) return null;
  const axis = issued.active_issue;
  if (!(axis in TOLERANCE)) return null;
  const tolerance = TOLERANCE[axis];
  const nextEvent = ordinaryEvents.find((row) => row.timestamp > issued.timestamp);
  const causalRows = allRows.filter((row) => row.timestamp >= issued.timestamp && row.timestamp <= terminal.timestamp);
  const responseRows = allRows.filter((row) => row.timestamp >= issued.timestamp
    && (!nextEvent || row.timestamp < nextEvent.timestamp));
  const values = causalRows.map((row) => ({ row, value: deltaFor(row, axis) })).filter(({ value }) => finite(value));
  const responseValues = responseRows.map((row) => deltaFor(row, axis)).filter(finite);
  const baseline = deltaFor(issued, axis);
  const baselineError = Math.abs(baseline) / tolerance;
  const meaningful = values.find(({ value }) => Math.abs(Math.abs(value) / tolerance - baselineError) >= 0.18) ?? null;
  const best = values.reduce((current, candidate) => Math.abs(candidate.value) < Math.abs(current.value) ? candidate : current, values[0]);
  const final = deltaFor(terminal, axis);
  const finalError = Math.abs(final) / tolerance;
  const responseDirection = !meaningful ? 'NO_MEANINGFUL_RESPONSE'
    : Math.abs(meaningful.value) < Math.abs(baseline) ? 'TOWARD_TARGET' : 'AWAY_FROM_TARGET';
  const peakVelocity = Math.max(0, ...causalRows.map((row) => Math.abs(velocityFor(row, axis) ?? 0)));
  const targetCrossed = responseValues.some((value) => baseline * value < 0);
  const enteredAxisDeadband = responseValues.some((value) => Math.abs(value) <= tolerance);
  const responseTransitions = transitions(responseRows);
  const before = allRows.filter((row) => row.timestamp < issued.timestamp);
  const after = allRows.filter((row) => row.timestamp > terminal.timestamp
    && (!nextEvent || row.timestamp < nextEvent.timestamp));
  const readyBeforeRow = [...before].reverse().find((row) => row.runtime_state === 'READY') ?? null;
  const readyAfterRow = after.find((row) => row.runtime_state === 'READY') ?? null;
  const terminalReason = terminal.verification === 'SUCCESS' ? 'AXIS_TARGET_SUCCESS'
    : terminal.verification === 'WRONG_DIRECTION' ? 'COMMANDED_AXIS_ERROR_INCREASED'
      : targetCrossed || enteredAxisDeadband ? 'OVERSHOOT_LIKE_RESPONSE_WINDOW' : 'NO_AXIS_TARGET_SUCCESS';
  const result = {
    trial_id: trial,
    trace_file: trace,
    episode_id: Number(episodeId),
    action: issued.instruction_event.action,
    axis,
    issue: axis,
    issued_at: issued.instruction_event.timestamp_ms,
    issued_state_timestamp: issued.timestamp,
    issued_measurement_age_ms: null,
    issued_measurement_age_status: 'UNKNOWN_NOT_RECORDED_IN_V1',
    camera_facing: 'UNKNOWN_NOT_RECORDED_IN_V1',
    preview_mirror_state: 'UNKNOWN_NOT_RECORDED_IN_V1',
    coordinate_basis: 'SENSOR_NORMALIZED_NON_MIRRORED_BY_AUTHORITY',
    target_at_issue: { center_x: issued.target_x, height_ratio: issued.target_height },
    current_at_issue: { center_x: issued.center_x, height_ratio: issued.height_ratio },
    delta_at_issue: { x: issued.delta_x, scale: issued.delta_scale },
    baseline_axis_delta: baseline,
    baseline_normalized_error: baselineError,
    best_axis_delta: best?.value ?? null,
    best_normalized_error: best ? Math.abs(best.value) / tolerance : null,
    final_axis_delta: final,
    final_normalized_error: finalError,
    terminal_at: terminal.timestamp,
    terminal_outcome: terminal.verification,
    terminal_reason: terminalReason,
    response_direction: responseDirection,
    response_started_at: meaningful?.row.timestamp ?? null,
    response_delay_ms: meaningful ? meaningful.row.timestamp - issued.timestamp : null,
    peak_axis_velocity: peakVelocity,
    target_crossed_in_response_window: targetCrossed,
    axis_deadband_entered_in_response_window: enteredAxisDeadband,
    target_entry_count_around_episode: responseTransitions.entries,
    target_exit_count_around_episode: responseTransitions.exits,
    ready_before: Boolean(readyBeforeRow),
    ready_before_at: readyBeforeRow?.timestamp ?? null,
    ready_after: Boolean(readyAfterRow),
    ready_after_at: readyAfterRow?.timestamp ?? null,
    next_ordinary_action: nextEvent?.instruction_event.action ?? null,
    next_ordinary_at: nextEvent?.timestamp ?? null,
    wrong_primary_category: null,
    overshoot_like: terminal.verification === 'NO_EFFECT' && (targetCrossed || enteredAxisDeadband),
  };
  if (terminal.verification === 'WRONG_DIRECTION') result.wrong_primary_category = classifyWrong({
    responseDirection, responseDelayMs: result.response_delay_ms, peakVelocity,
  });
  return result;
}

const trials = []; const episodes = []; const postReady = [];
for (let index = 0; index < paths.length; index += 1) {
  const trace = JSON.parse(await readFile(paths[index], 'utf8'));
  if (trace.format !== 'xfx-live-p2-scalar-trace-v1' || trace.raw_media !== false) {
    throw new Error(`Rejected trace ${paths[index]}`);
  }
  const id = trialId(index); const name = basename(paths[index]); const rows = trace.rows;
  const ordinaryEvents = rows.filter((row) => ORDINARY.has(row.instruction_event?.action));
  const groups = Map.groupBy(rows.filter((row) => row.episode_id != null), (row) => row.episode_id);
  const trialEpisodes = [];
  for (const [episodeId, group] of groups) {
    const episode = analyzeEpisode(id, name, episodeId, group, rows, ordinaryEvents);
    if (episode) { episodes.push(episode); trialEpisodes.push(episode); }
  }
  trialEpisodes.sort((a, b) => a.episode_id - b.episode_id);
  const readyRows = rows.filter((row) => row.runtime_state === 'READY');
  const firstReady = readyRows[0] ?? null;
  for (const event of ordinaryEvents) {
    const priorReady = [...readyRows].reverse().find((row) => row.timestamp < event.timestamp);
    if (!priorReady) continue;
    postReady.push({
      trial_id: id, trace_file: name, ready_at: priorReady.timestamp,
      ready_source: trialEpisodes.some((episode) => episode.terminal_at < priorReady.timestamp && episode.terminal_outcome === 'SUCCESS')
        ? 'EPISODE_SUCCESS_OR_LATER_READY' : 'PASSIVE_CONFIRMATION_BEFORE_FIRST_EPISODE',
      ordinary_at: event.timestamp, action: event.instruction_event.action,
      episode_id: event.episode_id, runtime_state: event.runtime_state,
      reproduction: 'ARMED + already inside target -> passive READY without terminal TrialState -> target exit -> ordinary instruction',
    });
  }
  const axisSwitchPairs = [];
  for (let i = 1; i < trialEpisodes.length; i += 1) {
    const previous = trialEpisodes[i - 1]; const current = trialEpisodes[i];
    if (previous.axis !== current.axis) axisSwitchPairs.push({
      from_episode: previous.episode_id, from_axis: previous.axis, from_action: previous.action,
      to_episode: current.episode_id, to_axis: current.axis, to_action: current.action,
      gap_ms: current.issued_at - previous.terminal_at,
    });
  }
  trials.push({
    trial_id: id, trace_file: name, row_count: rows.length,
    first_ready_at: firstReady?.timestamp ?? null, terminal_episodes: trialEpisodes.length,
    success: trialEpisodes.filter((episode) => episode.terminal_outcome === 'SUCCESS').length,
    no_effect: trialEpisodes.filter((episode) => episode.terminal_outcome === 'NO_EFFECT').length,
    wrong_direction: trialEpisodes.filter((episode) => episode.terminal_outcome === 'WRONG_DIRECTION').length,
    ordinary_instructions: ordinaryEvents.length, post_ready_ordinary: postReady.filter((event) => event.trial_id === id).length,
    axis_switch_pairs: axisSwitchPairs,
  });
}

const wrong = episodes.filter((episode) => episode.terminal_outcome === 'WRONG_DIRECTION');
const overshoot = episodes.filter((episode) => episode.overshoot_like);
const oscillationEpisodes = [...new Set(trials.flatMap((trial) => trial.axis_switch_pairs.flatMap((pair) => [
  `${trial.trial_id}:${pair.from_episode}`, `${trial.trial_id}:${pair.to_episode}`,
])))];
const output = {
  format: 'xfx-live-p2-control-policy-v2-failure-reconstruction-v1',
  raw_media: false,
  input_trace_count: paths.length,
  totals: {
    trials: trials.length, terminal_episodes: episodes.length,
    success: episodes.filter((episode) => episode.terminal_outcome === 'SUCCESS').length,
    no_effect: episodes.filter((episode) => episode.terminal_outcome === 'NO_EFFECT').length,
    wrong_direction: wrong.length,
    post_ready_ordinary: postReady.length,
    overshoot_like: overshoot.length,
    oscillation_episode_count: oscillationEpisodes.length,
  },
  limitations: [
    'v1 trace does not record measurement_age_ms at issuance',
    'v1 trace does not record camera facing or preview mirror state',
    'user-observed wrong physical direction remains accepted evidence and is not dismissed',
  ],
  wrong_direction: wrong,
  post_ready: postReady,
  overshoot_like: overshoot,
  oscillation_episode_keys: oscillationEpisodes,
  trials,
  episodes,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
