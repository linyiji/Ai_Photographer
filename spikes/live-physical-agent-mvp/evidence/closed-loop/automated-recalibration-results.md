# LIVE-P2 Automated Recalibration Results

```text
npm ci = PASS / 19 packages / 0 vulnerabilities
model setup/verify = PASS / local Pose Lite verified
MediaPipe assets = PASS
tests = 48/48 PASS (41 focused P2 + 7 retained P1)
typecheck = PASS
production build = PASS
browser replay/smoke = PASS
git diff --check = PASS
P2_RECALIBRATION_IMPLEMENTATION_GATE = PASS
```

Hard coverage includes unique instruction counting, HOLD exclusion, trial timing, one terminal result per Episode, IMPROVING non-terminal, signed direction, target crossing/overshoot, delayed response, no motion, jitter, stable window, reissue/gap, READY causality, post-READY trial latching, local recovery, trace privacy, and deterministic replay. Existing historical device FAIL is not used as PASS evidence.
