# XFX_LIVE_P2_V3_OPPO_PROSPECTIVE_HUMAN_STEP_DEVICE_GATE_04

Status: `FAIL / STOPPED_AFTER_FRAMING_ONLY`

Date: `2026-08-31`

Start head: `3b0e41678d0492be7a211146b50ca7795edb7a23`

Git admission passed with local/remote equality, ahead/behind `0/0`, and a clean worktree. No reset, rebase, force push, Main/develop integration, V2 Gate 2, or next task was started.

## Result

The first A FRAMING_ONLY trace was preserved as an invalid diagnostic and the one allowed clean replacement was executed. The replacement failed before READY and exported with an active 35th action. The user reported inaccurate instruction and judgment.

Of 34 evaluated actions, 22 had no detected movement response. The runtime nevertheless classified them, issued later ControlEpochs, entered PAUSED five times, and continued guidance. One no-movement Episode was classified TARGET_REACHED from relation change. This violates the prospective human-step causal contract and makes the instruction stream unreliable for real use.

The failure is traced to the interaction of response-grace settling and the newer-stable-state retry release. It is not the previously corrected sticky Outcome/action presentation defect, and it is not proven to be a physical direction sign inversion.

## Metrics

- Device: OPPO K11 / ColorOS 15 baseline / Chrome Mobile 138
- Orientation/camera/mirror: portrait / front / mirrored
- Session: 198.5 s
- Actions: 35 ordinary, 34 evaluated, 1 incomplete
- Valid evaluated: 26
- TARGET_REACHED / IMPROVED / NO_EFFECT / WRONG_DIRECTION / INVALIDATED: `3 / 1 / 22 / 0 / 8`
- Action Effectiveness: 15.38%
- Target Reach Rate: 11.54%
- Movement observed / not observed: `12 / 22`
- READY trials / valid trials: `0 / 0`; rate not computable because the replacement trial is invalid
- Preview/Vision/State: `29.8 / 7.13 / 7.13 Hz`
- Inference p50/p95: `88.2 / 118.6 ms`
- Skipped Busy: 22
- Thermal: UNKNOWN
- Provider/Backend per-frame/Luna/Raw upload: `0/0/0/0`

## Stop decision

FRAMING_ONLY is FAIL. X_ONLY, COMBINED, and ALREADY_SATISFIED are NOT_REACHED. Continuing would not rescue the required all-four-scenarios gate and would collect evidence under a known causal failure. No threshold tuning or controller correction is performed in the same evidence step.

`V3_EXPERIMENTAL_DEVICE_GATE = FAIL`

`V3_PRODUCTION_RUNTIME = NOT_PROMOTED`

`V3_PRODUCTION_CANDIDATE = REQUIRES_REVISION`

`FRAMING_RELATION_SEMANTIC_RISK = WARNING`

## Regression integrity

- Automated regression: `237/237 PASS`
- TypeScript: `PASS`
- Production Build: `PASS / 36 modules`
- V3 Browser Gate: `PASS`
- V2 Runtime Regression: `PASS / DEFAULT V2 / READY`
- Browser console errors: `0`

These results confirm that the Device Gate failure is an uncovered real-human causal behavior, not a build or deterministic-fixture regression.
