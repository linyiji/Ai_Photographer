# Vision Cadence A/B

Automated scheduler admission:

| Target | One inference in flight | Backlog | Automated result |
| --- | --- | --- | --- |
| 8 Hz | YES | 0 | PASS |
| 10 Hz | YES | 0 | PASS |
| 12 Hz | YES | 0 | PASS |

The runtime exposes 8/10/12 Hz candidates and drops a due frame while busy instead of queueing it. Fresh video-frame timestamps remain the measurement authority.

Selected default before device evidence: **8 Hz**. The previous OPPO evidence (~6.9 Hz actual, inference p50/p95 ~66/80 ms, preview ~29.3 fps) supports the safe baseline only; it is not reused as an amendment A/B result.

Fresh OPPO measurements required for each candidate:

- sustained actual Vision Hz;
- inference p50/p95;
- preview FPS and state Hz;
- measurement age and skipped-busy count;
- no visible freeze/backlog;
- qualitative heat.

Selection guard: preview >=24 fps, inference p95 <=120 ms, actual Vision >=6 Hz, no backlog/freeze. Do not force 12 Hz.
