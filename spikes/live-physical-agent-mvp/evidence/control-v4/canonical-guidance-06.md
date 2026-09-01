# Canonical Guidance 06 — Automated Evidence

Date: 2026-09-01  
Implementation: `e280cf4b4b1e296c98d6490a2d40556936f180ea`

## Results

- TypeScript: PASS
- Automated tests: 310/310 PASS
- H5 production build: PASS, Vite 8.2.2, 60 modules
- H5 browser clean entry: PASS; DISARMED, current READY false, trial success false
- H5 deterministic browser matrix: PASS, 14 cases
- WeApp compatibility build: PASS using a read-only `develop` archive in a temp directory
- Camera/device acceptance: NOT_STARTED

The browser matrix covers target lock, subject absence, extent, scale in both
directions, X in both directions, camera-owned Y, movement not equaling target
reached, persistent direction reversal, long no-response, target reached followed
by rolling READY verification, READY revoke, and target switch.

## Invariants

- one canonical target and revision per trial
- at most one active canonical command
- Primary Text and Voice share command authority and command id
- Secondary Text cannot select an action
- observation jitter alone cannot generate speech
- `MOVEMENT_DETECTED != TARGET_REACHED`
- READY requires target reached followed by stability verification
- no synthetic camera state on the clean entry
- provider/backend/Luna/raw-media upload: 0/0/0/0

## Boundaries

The evidence is deterministic browser/replay evidence, not OPPO Camera/CV
acceptance. The 500 ms reversal hysteresis and 600 ms / 80% rolling verification
are TEST_CANDIDATE parameters pending device traces. P3 physical feasibility is
not claimed.
