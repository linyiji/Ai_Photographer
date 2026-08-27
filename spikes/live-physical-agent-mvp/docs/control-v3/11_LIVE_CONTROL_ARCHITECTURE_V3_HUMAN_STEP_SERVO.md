# LIVE Control Architecture V3 — Human Step Servo

Status: `PASS / EXPERIMENTAL`. V3 architecture and pure controller are accepted for debug/acceptance execution; production runtime promotion remains unauthorized.

## Authority correction — 2026-08-27

The historical Counterfactual Promotion Gate result remains recorded as `FAIL / SOURCE_REQUIRED`, but its earlier interpretation as a design failure is superseded. `EXACT_EFFECTIVENESS_COMPARATOR_COUNT=0` proves that historical V2 intervention traces cannot establish V3 human-step effectiveness; it does not prove that V3 is ineffective. The old `COUNTERFACTUAL_EFFECTIVENESS_GATE` is invalid as a promotion prerequisite because V3 human evidence requires an executable V3 runtime.

The authorized causal chain is now Design → Structural Safety Replay → Experimental Debug Runtime → Prospective Human Evidence → Effectiveness Evaluation → Production Candidate Decision. `EXPERIMENTAL_RUNTIME_ADMISSION=PASS`; this authorizes debug/acceptance-only V3 selection and never changes the V2 production default.

## Boundary

Camera lifecycle, MediaPipe, one-subject perception, 8 Hz bounded scheduling, sensor-normalized non-mirrored coordinates, Semantic Anchor X, BodyMode, DistanceProxy, Precision Scale, uncertainty, One Euro filtering, freshness, reacquisition suppression, display/control separation, READY latch, and privacy are frozen. V3 begins at the Measurement-to-Control projection.

```text
accepted semantic measurement
  -> LiveMeasurementV3
  -> ACQUIRE / FRAMING / ALIGN_X / VERIFY / PAUSED / READY_LATCHED
  -> one bounded human step
  -> HumanSettleDetectorV01
  -> TARGET_REACHED / IMPROVED / NO_EFFECT / WRONG_DIRECTION / INVALIDATED
```

## LiveMeasurementV3

The adapter exposes subject state, `GOOD|MARGINAL|INVALID` quality, freshness, stability, unified framing relation, X relation, framing/X motion, state version, and an opaque diagnostics reference. It does not duplicate landmark or semantic measurement logic. BodyMode compatibility, DistanceProxy, Precision Scale family/calibration, crop/orientation uncertainty, and raw Pose extent remain measurement-owned.

`TOO_CLOSE|IN_RANGE|TOO_FAR|UNKNOWN` absorbs V2 controller-facing compatibility/coarse/precision distinctions. Measurement may use a target-specific precision scale when compatible and DistanceProxy/BodyMode compatibility when outside the usable framing family. The V3 controller sees only relation and generic comparison diagnostics.

## Fixed stage order

```text
lost / invalid / stale -> ACQUIRE
framing out            -> FRAMING
framing in + X out     -> ALIGN_X
framing in + X in      -> VERIFY
stable GOOD verify     -> READY_LATCHED
```

There is no dynamic X/Scale priority, dominance ratio, competing-axis switch, Y arbitration, separate Combined policy, controller-level CoarseFramingEpisode, predictive STOP, velocity corridor, or BRAKING state. Y remains observation-only.

## Human steps and causal evaluation

Actions are `MOVE_LEFT_SMALL`, `MOVE_RIGHT_SMALL`, `MOVE_CLOSER_SMALL`, and `MOVE_FARTHER_SMALL`. Each means one small physical adjustment followed by a natural stop. `HumanSettleDetectorV01` requires a newer state, present subject, fresh and comparable measurement, velocity/stability evidence, a 375 ms stable window, and a bounded 4500 ms timeout. A no-motion result cannot become success merely by sleeping.

Outcome uses the immutable start snapshot and settled end snapshot. `TARGET_REACHED` means the stage relation entered its unchanged target range. `IMPROVED` requires a noise-safe reduction of at least `max(0.18 normalized, 15% of start error)` and is terminal. `WRONG_DIRECTION` requires the corresponding material increase. `INVALIDATED` covers lost, stale, invalid, or incomparable causal evidence and is excluded from effectiveness.

Three consecutive valid `NO_EFFECT|WRONG_DIRECTION` outcomes enter PAUSED. Stable fresh input for 1200 ms resumes at the stage currently required. No Camera/Pose restart and no Luna escalation occur.

READY has one path: framing and X in range, measurement GOOD/fresh/stable for 600 ms. It records analytic entry context but has no passive-confirmation control branch. READY is latched; post-READY ordinary output is structurally zero until explicit re-arm.

## Promotion state

Pure controller and structural replay are implemented and automated. A session-only experimental runtime is admitted to collect the missing controlled step-response traces. V2 remains the default/current accepted runtime; V3 production promotion is `NOT_AUTHORIZED` until fresh prospective evidence is evaluated.

Privacy remains scalar-only: frame/video persistence, upload, Backend per-frame, Provider, and Luna are zero.
