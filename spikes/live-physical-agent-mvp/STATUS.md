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

Automated Tests = 210/210 PASS
Typecheck = PASS
Production Build = PASS / 29 MODULES
Browser Replay = PASS
Counterfactual Post-READY Blocked = 6/6
Counterfactual Wrong Prevented = 0/8 EVIDENCE-CONFIRMED / NOT DEVICE SUCCESS

Status = READY_FOR_MANUAL_DEVICE_TEST
P2 Implementation Gate = PASS
Semantic Framing Amendment = IMPLEMENTATION PASS / DEVICE GATE REQUIRED
Body Visibility Modes = HEAD_ONLY / HEAD_SHOULDERS / UPPER_BODY / THREE_QUARTER / FULL_BODY / PARTIAL_OR_AMBIGUOUS
Body Mode Static Flicker = 0 / CONTROLLED 5S
Semantic Anchor X = PASS / TORSO FUSION
Raw Pose MinMax Used For Precision X = NO
Raw Pose Height Used As Only Precision Scale = NO
Measurement Uncertainty = PASS / SEPARATE SUPPRESSION COUNTERS
Two-stage Framing Control = PASS
Selected Filter Candidate = ONE_EURO / DEVICE CONFIRMATION REQUIRED
Vision Cadence Candidates = 8 / 10 / 12 HZ / DEFAULT 8 HZ
OPPO Semantic Measurement Gate = MANUAL_REVIEW_REQUIRED
OPPO Semantic Startup Attempt = >60S LOADING / BOUNDED FIX IMPLEMENTED / REVALIDATION REQUIRED
Startup Retry Amplification = REMOVED / SINGLE 120S WORKER ATTEMPT
OPPO Semantic Cold Start Revalidation = PASS / FIRST PERCEPTION AT ~18.3S
OPPO Semantic Cached Reload = PASS / USER-OBSERVED FEW SECONDS / EXACT TIME NOT RECORDED
OPPO Semantic Startup Sub-gate = PASS
Semantic Scale Validity Audit = PASS / 676 OF 676 ROWS CLASSIFIED
Previous Precision Scale Valid = 31/676
Dominant Previous Invalid = UNCERTAINTY_TOO_HIGH 606
DistanceProxy = IMPLEMENTATION PASS / DEVICE GATE REQUIRED
HEAD_SHOULDERS DistanceProxy = AUTOMATED PASS / HIPS NOT REQUIRED
Precision Scale V2 = IMPLEMENTATION PASS / 4 METRIC FAMILIES
CoarseFramingEpisode = IMPLEMENTATION PASS / PARENT DENOMINATOR UNCHANGED
Repeated Coarse While Improving = 0 / AUTOMATED
Coarse To Precision Handoff = FRESH STATE BARRIER PASS
Semantic Scale Device Gate = MANUAL_REVIEW_REQUIRED
Scale Trace Direct Download = PASS / LABELED SCENARIO + DEVICE + PERFORMANCE CONTEXT
Cached HEAD Content-Length 0 = BOUNDED FIX IMPLEMENTED / DEVICE REVALIDATION REQUIRED
Semantic Measurement Device Gate = MANUAL_REVIEW_REQUIRED
OPPO Gate 1 = MANUAL_REVIEW_REQUIRED
OPPO Gate 1 Attempt 1 = FRONT SWITCH DEFECT / BOUNDED FIX IMPLEMENTED / REVALIDATION REQUIRED
OPPO Gate 1 Attempt 2 = DISARMED/UI STATE DEFECT / BOUNDED FIX IMPLEMENTED / REVALIDATION REQUIRED
OPPO Gate 1 Attempt 3 = PRE-FIX 5 TRIALS / 45 EPISODES / 35.6% / NOT ACCEPTED
Attempt 3 Causal Invariants = POST-READY 0 / SIGN MISMATCH 0 / ACTIVE-EPISODE AXIS SWITCH 0
Attempt 3 Display Latency p50/p95/max = 91.6/248.1/893.4 MS
Attempt 3 Response = CONTINUATION CUE + 1100 MS READABILITY + MEANINGFUL-MOTION LATENCY / REVALIDATION REQUIRED
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

The accepted 33.9% / 59-Episode sample remains the task's starting baseline, not its V2 acceptance result. Attempt 3 is fresh V2 evidence but is a pre-fix, non-passing diagnostic sample; it cannot satisfy Gate 1 or Gate 2. The mandatory Semantic Measurement Device Gate now precedes Parent OPPO Gate 1. Gate 1 may resume only after that semantic gate passes; Gate 2 and the unchanged `>=80%` Correction Success decision may begin only after Gate 1 passes. No next task or Luna work starts automatically.
