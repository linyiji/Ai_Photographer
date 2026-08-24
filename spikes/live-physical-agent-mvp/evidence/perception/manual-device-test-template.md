# LIVE-P1 Manual Device Test — `<device>`

Do not attach, save, or commit camera frames/video.

```text
Date/time:
Tester:
Device class/model:
OS/version:
Browser/version:
HTTPS URL class (no token):
Portrait / Landscape tested:
Permission result:
Front/rear/switch/restart P0 regression:

Duration (minimum 60 s):
Execution mode (WORKER or MAIN_THREAD_FALLBACK):
Frame scheduler:
Preview FPS average/range (candidate >=25):
Vision actual Hz average/range (candidate >=5; target ~8):
State output Hz average/range:
Inference current / p50 / p95 ms:
Scheduled / processed / skipped-busy:
Late / drop estimate:

Centered/static full body for >=10 s; detection/geometry/stability result:
Move physically left -> center/velocity observation:
Move physically right -> center/velocity observation:
Move closer/farther -> scale observation:
Static hold -> stability transition:
Briefly leave/re-enter -> loss/reacquisition behavior:
Front mirror vs non-mirrored sensor geometry sanity:
Portrait -> landscape -> portrait HUD/preview behavior:
Visible freezes, black frames, crashes, or backlog:
Local state latency/measurement-age observation (candidate <100 ms, not yet authoritative):

JS memory start/end/peak (if browser exposes it):
Device heat observation start/end:
Power/battery observation start/end (if safe/available):
CPU API availability:
Thermal API availability:

Raw frame/video persistence: 0
Raw video upload: 0
Backend calls: 0
Luna calls: 0
Evidence is text/telemetry only: YES/NO
```

## Decision

```text
Implementation defect found:
Reproduction:
Text telemetry evidence:
Bounded P1 fix proposed (if needed):
LIVE-P1 = PASS / FAIL / BLOCKED
```

Do not mark PASS unless the real phone sustained Camera + CV and satisfied the required functional/performance observations. Preview-only FPS is insufficient.
