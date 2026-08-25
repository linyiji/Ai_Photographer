# Control Policy V2 Counterfactual Replay

Date: 2026-08-25

Status: PASS / DIAGNOSTIC ONLY

Inputs are the accepted eight V1 scalar traces (59 terminal Episodes). No row, historical evidence, success result, or target/deadband was rewritten.

## Results

- Post-READY ordinary actions: `6/6` would be structurally blocked by `READY_LATCHED`.
- WRONG_DIRECTION: `8/8` were causally audited, but `0/8` are claimed as proven prevented from V1 alone. V1 lacks camera-facing, preview-mirror, and issuance measurement-age telemetry. Five are classified delayed human response, two user movement opposite the command, and one unclassified. V2 records the missing fields so the fresh device sample can distinguish coordinate, stale, and human-response causes.
- Axis switching: all new instructions require terminal completion plus a newer state version. The accepted sample contains 16 X/Scale switch pairs involving 30 Episodes, 12 within 600 ms of the prior terminal response; V2 blocks same-version response-tail replanning. This is not reclassified as historical success.
- Improving silence: V1 already emitted no ordinary action within an active episode; counterfactual suppression count is `0`, and V2 preserves that invariant.
- Visual target transitions: an offline presentation-only pass over the eight traces changes raw exact-boundary transitions from `44 entry / 40 exit` to `34 / 30`, reducing 20 flicker transitions. Controller satisfaction remains exact and unchanged. Counts differ from the earlier 46/38 report because this replay uses transition-only counting without initial-state entry.

These results prove structural blocking and presentation behavior only. They do not prove real-device direction correctness or `>=80%` Correction Success.
