import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const inputs = process.argv.slice(2, -1);
const output = process.argv.at(-1);
if (inputs.length === 0 || !output) throw new Error('usage: node audit-semantic-scale.mjs <trace...> <output.json>');

const confidenceBucket = (value) => value < 0.5 ? '0.00-0.49' : value < 0.8 ? '0.50-0.79' : '0.80-1.00';
const cropState = (edges) => Object.entries(edges ?? {}).filter(([, value]) => value).map(([key]) => key).join('+') || 'NONE';
const primaryReason = (row) => {
  const framing = row.semantic_framing;
  if (framing?.valid_for_precision_scale) return 'VALID';
  if (!framing) return row.subject_present ? 'OTHER' : 'REACQUISITION_BARRIER';
  if (row.measurement_age_ms > 180) return 'MEASUREMENT_STALE';
  if (['HEAD_ONLY', 'PARTIAL_OR_AMBIGUOUS'].includes(framing.body_mode)) return 'BODY_MODE_INCOMPATIBLE';
  if (!framing.scale_metric_type || framing.scale === null) return 'METRIC_FAMILY_UNAVAILABLE';
  if (framing.uncertainty_scale > 0.16) return 'UNCERTAINTY_TOO_HIGH';
  return 'OTHER';
};
const increment = (record, key) => { record[key] = (record[key] ?? 0) + 1; };

const result = {
  format: 'xfx-live-semantic-scale-validity-audit-v1',
  source_telemetry_version: 'xfx-live-p2-scalar-trace-v2',
  raw_media: false,
  classification_note: 'Reasons reproduce the pre-amendment decision order. Old traces do not contain uncertainty components, so UNCERTAINTY_TOO_HIGH cannot be split further without fabrication.',
  source_files: [],
  counts: { overall: {}, by_body_mode: {}, by_confidence_bucket: {}, by_crop_state: {}, by_metric_family: {}, by_scenario: { UNLABELED: {} } },
  rows: [],
};

for (const path of inputs) {
  const bytes = await readFile(path);
  const trace = JSON.parse(bytes.toString('utf8'));
  result.source_files.push({ file: basename(path), sha256: createHash('sha256').update(bytes).digest('hex').toUpperCase(), rows: trace.rows.length });
  for (const row of trace.rows) {
    const framing = row.semantic_framing;
    const reason = primaryReason(row);
    const mode = framing?.body_mode ?? 'NO_SEMANTIC';
    const bucket = framing ? confidenceBucket(framing.body_mode_confidence) : 'NO_SEMANTIC';
    const crop = framing ? cropState(framing.cropped_edges) : 'NO_SEMANTIC';
    const metric = framing?.scale_metric_type ?? 'NONE';
    increment(result.counts.overall, reason);
    for (const [dimension, key] of [['by_body_mode', mode], ['by_confidence_bucket', bucket], ['by_crop_state', crop], ['by_metric_family', metric]]) {
      const group = result.counts[dimension][key] ??= {};
      increment(group, reason);
    }
    increment(result.counts.by_scenario.UNLABELED, reason);
    result.rows.push({ source_file: basename(path), sequence: row.sequence, timestamp_ms: row.timestamp, body_mode: mode, confidence_bucket: bucket, crop_state: crop, metric_family: metric, primary_reason: reason });
  }
}

await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
