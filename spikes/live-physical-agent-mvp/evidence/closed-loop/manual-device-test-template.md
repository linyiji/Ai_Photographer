# LIVE-P2 Real Device Closed-Loop Acceptance — `<device>`

Do not screenshot, save, upload, or commit real camera frames/video.

```text
Date / tester:
Device / OS / browser:
Orientation / camera / MODEL / MODE:
Fixed phone position confirmed:
Preview FPS / Vision Hz / State Hz:
Inference p50 / p95:
Visible stalls / black screen / thermal:

Trial A — horizontal start, instructions, verification, time to target:
Trial B — scale start, instructions, verification, time to target:
Trial C — X+scale start, instructions, verification, time to target:
Wrong/no-effect behavior included:

One active instruction always:
Minimum instruction gap (>=900 ms):
Silent while moving correctly:
Automatic verification after stop:
Completed dimension not repeatedly corrected:
Left/right ping-pong occurrences:
X/Scale rapid switch occurrences:
HOLD count per READY entry:
READY while moving occurrences:
Front mirror wrong-direction occurrences:

Instruction count / successful corrections:
Improving / no-effect / wrong-direction:
Oscillation count:
Correction success rate:
Time to target per trial:

Provider Calls = 0
Backend Per-frame Calls = 0
Luna Calls = 0
Raw Video Upload = 0
```

Decision: `LIVE-P2 = PASS / FAIL / BLOCKED`. Candidate gates: Preview `>=25`, Vision `>=5`, meaningful correction success `>=80%`, obvious oscillation `0`, mirror wrong direction `0`, simple-trial target `<60 s`.
