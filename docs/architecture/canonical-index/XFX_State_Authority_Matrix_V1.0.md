# XFX State Authority Matrix V1.0

**Status:** `LOCKED_M01`

| State / object | Lifecycle | Future runtime authority | Persistence and synchronization rule |
|---|---|---|---|
| PhotographySession | Persistent | Server/backend | Owns accepted session business references and asset lineage; not a God Object |
| WorkflowState | Persistent logical | Server/backend with shared language | Persist meaningful stage transitions; all runtimes use the same stage enum |
| RealityContext | Accepted persistent | Session domain | Promoted only after fact and safety validation |
| SelectedTarget | Accepted persistent | Session domain | `WHAT`; promoted after feasibility, safety, and user choice |
| ShotDirection | Accepted persistent plan | Session domain | `HOW`; versioned executable plan |
| FramePerception | Ephemeral, high frequency | Client/mobile local runtime | Never persisted frame-by-frame; provider-independent semantic observation |
| CurrentShotState | Ephemeral, derived | Client/mobile local runtime | Only meaningful snapshots/events may synchronize |
| LiveShotRuntime | Ephemeral runtime authority | Client/mobile | Owns frame-level control, difference, instruction stabilization, readiness, stability, and active role |
| CaptureAsset | Persistent | Asset/session authority | Stable asset reference and capture lineage; no raw local path authority |
| CaptureDecision | Persistent decision | Session domain | Technical QA separated from user taste |
| RetakePlan | Persistent recovery decision | Session domain | Records invalidated dimensions and preserved valid state/assets |
| RealityPlusAsset | Accepted persistent derived asset | Asset/session authority | Preserves capture lineage and Reality Fact Lock |
| AdjustmentRecipe | Persistent when saved | Asset/session authority | Deterministic parameters only; not semantic edit authority |
| MyFinalPhoto | Persistent final product state | Asset/session authority | References selected final asset and lineage |

## Frozen boundary

```text
PhotographySession != LiveShotRuntime

Persistent accepted business state  → PhotographySession / Workflow / assets
Per-frame observation and control    → LiveShotRuntime on client/mobile
Meaningful transition or snapshot    → DomainEvent to persistent authority
```

The backend must never become the per-frame realtime hot path. A Live runtime may be reconstructed or released without rewriting accepted session truth.
