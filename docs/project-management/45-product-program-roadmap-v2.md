# 向风行｜Program Roadmap V2

**Status:** `ACCEPTED_PROGRAM_REBASELINE`
**Effective date:** 2026-08-31

## Program sequence

```text
GLOBAL REBASELINE
       │
       ├─ LIVE V4 REBUILD
       ├─ SCENE SPATIAL → MAIN
       └─ AI DIRECTOR PARALLEL SPIKE
               ↓
       LIVE WECHAT + MAIN
               ↓
       NON-AI EXECUTABLE GOLDEN FLOW
               ↓
       AI MAIN INTEGRATION
```

The Scene Spatial→Main node is already `PASS_WITH_WARNING` through `XFX_MAIN_SCENE_SPATIAL_V02_SELECTIVE_INTEGRATION_05`; it remains an accepted prerequisite, not permission to rerun or mutate its source Track.

Live V4 rebuild and AI Director spike are `NOT_STARTED`. No child task is started by this document.

## Phase meaning

| Phase | Meaning |
|---|---|
| 1 | execute a valid deterministic Shot Plan through the complete product; no Non-AI best-shot claim |
| 2 | add AI photography intelligence, beginning with Director quality rather than provider lock-in |
| 3 | optimize AI quality, cost, routing and provider choices |
| 4 | production hardening and release |

## Current gates

- Scene Spatial P0/P1/P2: accepted with documented warnings; P3 not started.
- Live V3: device gate failed, production runtime not promoted, Main integration not started.
- Live V4: architecture target documented, implementation not started.
- AI Director: Port design documented, spike and Main integration not started.
- Provider/Luna calls in this rebaseline: zero.
