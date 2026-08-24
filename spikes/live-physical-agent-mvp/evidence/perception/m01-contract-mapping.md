# M01 Contract Mapping (Read-only Semantic Reference)

M01 was inspected read-only at `0dd2e3e5d44db45a45e1515bb36f6d6259e1712d`. Nothing was cherry-picked and the Live branch was not rebased.

| P1 transient observation | M01 semantic reference | Mapping status |
| --- | --- | --- |
| sequence and observation timestamp | `FramePerception.seq`, `observed_at` | direct semantic mapping |
| one detected human, confidence, presence | `FramePerception.subjects` | partial provider-independent subject observation |
| normalized center/bounds/width/height | subject region/scale semantics | partial geometric mapping; no provider object exposed |
| visibility/presence-gated confidence | `FramePerception.confidence` | compatible evidence signal |
| EMA center/scale, velocity, stability | temporary frame-derived observation | spike extension for temporal smoothing; remains local/transient |
| subject loss/reacquisition | absence/presence observation | explicit nullable state; no readiness inference |

## Deliberately absent

- `CurrentShotState` is not implemented. Its readiness and difference semantics are higher-layer state and are not inferred here.
- `LiveShotRuntime` is not implemented. No target, difference, instruction, readiness, priority, guidance, or verification-loop fields exist.
- No placeholder zeros, `ready=true`, synthetic target, or empty instruction is emitted to simulate compatibility.

The provider boundary ends after geometry extraction: MediaPipe result objects are converted to local normalized measurements, and the structured state has no MediaPipe types. This makes future mapping possible without claiming formal schema completion.

```text
FramePerception compatibility = PARTIAL / SEMANTIC_MAPPING
CurrentShotState = DEFERRED_TO_LATER_PHASE
LiveShotRuntime = DEFERRED_TO_LATER_PHASE
```
