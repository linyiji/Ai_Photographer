# OPPO V4 fresh device gate

Status: MANUAL_REVIEW_REQUIRED

Do not reuse V3 traces. Select `V4 · TARGET RELATIVE`, then run in order:

1. Observation: enter/leave/re-enter; confirm lock, named required-body acquisition and crop state are plausible.
2. `CENTER_UPPER_BODY`: complete at least one responded X/scale correction.
3. `LEFT_THIRD_UPPER_BODY`: confirm x≈0.33 is accepted and movement is relative to that target.
4. `RIGHT_THIRD_UPPER_BODY`: confirm x≈0.67 is accepted and movement is relative to that target.
5. One combined body + scale + anchor path.
6. For one issued instruction, remain still beyond 900 ms and confirm reminder only: no outcome and no repeated ordinary instruction.
7. Download a fresh `live-p2-v4-*.json` scalar trace. Do not capture or commit camera frames/video.

Record subject lock, body visibility, semantic anchor correctness, instruction contradictions, post-ready ordinary count, Preview FPS, Vision/State Hz, inference p50/p95, heat, stalls/black screen/crash, and privacy counters.

