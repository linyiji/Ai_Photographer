# OPPO K11 Gate 1 Attempt 3 — Pre-fix Analysis

Status: NOT ACCEPTED / REVALIDATION REQUIRED

Device: OPPO K11 / ColorOS 15 / Chrome Mobile

This sample is fresh V2 device evidence, but it was captured before the bounded continuation-cue and display-latency fix described below. It is not Gate 1 PASS evidence and must not be reused for Gate 2.

## Source traces

| Trace | SHA-256 |
| --- | --- |
| `live-p2-scalar-trace-1787661495291(1).json` | `71AD4864E7E8CF098F41C3F6AE17D162F7C274CFA12FE6EF5DEB72C787CD5AFA` |
| `live-p2-scalar-trace-1787661570579(1).json` | `FA8766182C64B4A0CBEB9DF1938E5DFB5654C071A7A2F5C415470C543AD1AEC1` |
| `live-p2-scalar-trace-1787661600920(1).json` | `71ADD6FA22B4FFE324D309F1B8A17B0B29AB4EF143D84BCAF0FEBE5E16155689` |
| `live-p2-scalar-trace-1787661624676(1).json` | `B64727D2E6601DF46C30E031F594542F5CF177296792800F8E8FA524BA20E3D5` |
| `live-p2-scalar-trace-1787661685886(1).json` | `6549E4B7DCF4409B781A8F16854267003B393CAF0F9887D9204BB49B14722116` |

All five files declare `xfx-live-p2-scalar-trace-v2` and `raw_media=false`.

## Results

- Completed READY trials: 5
- Naturally produced terminal Episodes: 45
- SUCCESS / NO_EFFECT / WRONG_DIRECTION: 16 / 23 / 6
- Correction Success: 35.6% (`16 / 45`), below the unchanged `>=80%` gate
- Ordinary instructions: 45, or 9.0 per trial
- STOP / HOLD: 20 / 5
- Post-READY ordinary actions: 0
- Direction-sign mismatches: 0
- Axis switches inside an active Episode: 0
- Cross-Episode replans: 12; these are not automatically classified as oscillation
- Fresh control age p50 / p95 / max: 91.6 / 121.8 / 235.3 ms
- Display latency p50 / p95 / max: 91.6 / 248.1 / 893.4 ms
- Raw / stabilized jitter mean: 0.0311 / 0.0280

The causal hard invariants visible in telemetry pass, but the sample fails the correction-success threshold and the display-latency maximum candidate. The required subjective assertions—zero wrong physical direction, zero obvious oscillation, zero persistent subject-box instability, and target-frame clarity—were not supplied with these traces, so Gate 1 cannot be closed.

## Bounded response

- Preserve target, deadband, `AXIS_TARGET_SUCCESS`, and the `>=80%` acceptance threshold unchanged.
- Clarify ordinary actions as continuous movement until a visible STOP cue.
- Keep the current action visible for 1100 ms so it can be read on-device.
- Calculate motion-responsive display latency only when meaningful subject motion exists; near-rest noise no longer creates an unstable distance/speed estimate.
- Add `trial_state`, `ready`, and `ready_source` to future V2 trace rows.

Fresh OPPO K11 Gate 1 trials are required on the post-fix build.
