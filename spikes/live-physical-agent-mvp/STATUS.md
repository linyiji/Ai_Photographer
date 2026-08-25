# Live Physical Agent Spike Status

```text
Task = XFX_LIVE_P2_CONTROL_POLICY_V2_AND_SERVO_STABILITY_01
Profile = REALTIME_CAMERA_CV
Mode = GUIDANCE_CONTROL
Task Start Commit = 44e7914e3df7f778c1f0d4d6c127ddbb8048bef4

LIVE-P0 = PASS
LIVE-P1 = PASS
Historical LIVE-P2 Baseline = FAIL / 33.9% / 59 EPISODES
Historical Baseline Role = STARTING EVIDENCE ONLY

Failure Reconstruction = PASS
Wrong Direction Audit = 8/8 ACCOUNTED
Post-READY Audit = 6/6 RECONSTRUCTED
READY Terminal Lifecycle = PASS
Post-READY Ordinary Automated = 0
ControlEpoch = PASS
Canonical Direction Transform = PASS
Stale Guidance Suppression = PASS
Axis Commitment = PASS
Control / Display Observation Split = PASS
Target Visual = PASS / ONE GUIDE FRAME
Grid Default = OFF
Text Guidance = PRESERVED
DEFAULT Theme = PASS
LINE_DOG = IMPLEMENTED_CANDIDATE
Theme Semantic Diff = 0

Automated Tests = 156/156 PASS
Typecheck = PASS
Production Build = PASS / 21 MODULES
Browser Replay = PASS
Counterfactual Post-READY Blocked = 6/6
Counterfactual Wrong Prevented = 0/8 EVIDENCE-CONFIRMED / NOT DEVICE SUCCESS

Status = READY_FOR_MANUAL_DEVICE_TEST
P2 Implementation Gate = PASS
OPPO Gate 1 = MANUAL_REVIEW_REQUIRED
OPPO Gate 2 = NOT_STARTED
P2 Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P2 Final Gate = NOT_YET_REEVALUATED

Raw Frame or Video Persistence = 0
Raw Video Upload = 0
Backend Calls = 0
Provider Calls = 0
Luna Calls = 0
CH-003 = IDENTIFIED / UNCHANGED
Main / Develop / Fine Tune / AI Visual = UNTOUCHED
```

The accepted 33.9% / 59-Episode sample remains the task's starting baseline, not its V2 acceptance result. Gate 1 requires three fresh OPPO K11 trials. Gate 2 and the unchanged `>=80%` Correction Success decision may begin only after Gate 1 passes. No next task or Luna work starts automatically.
