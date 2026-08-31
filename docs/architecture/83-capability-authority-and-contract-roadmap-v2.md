# 向风行｜Capability Authority and Contract Roadmap V2

**Document ID:** `XFX_CAPABILITY_AUTHORITY_AND_CONTRACT_ROADMAP_V2`
**Status:** `ACCEPTED_ARCHITECTURE_AUTHORITY`
**Effective date:** 2026-08-31

## Connected but decoupled

```text
Main Workflow / PhotographySession
        ↓
Capability Port / versioned contract
        ↓
Replaceable Adapter
        ↓
Module implementation
```

Scene Spatial, Director, Live, QA, Reality+ and Fine Tune communicate only through versioned contracts, Ports, Adapters, DomainEvents and EvidenceRefs. Main persists domain state and lineage, not feature tracks, model objects, frame caches, CV matrices, provider SDK objects or other algorithm runtime state.

## Capability ownership

| Capability | Port authority | Provider forms | Failure behavior |
|---|---|---|---|
| Scene Spatial | `SceneSpatialPort` | REAL / FAKE / REPLAY | degrade to accepted P1 view-only path |
| Photography Director | `PhotographyDirectorPort` | FAKE / REPLAY / AI | normalized unavailable/request/validation result; no provider call in this task |
| Live | `LiveGuidancePort` / future target execution contract | FAKE / REPLAY / platform implementation | preserve Session; route to retry/manual fallback |
| QA | provider-neutral QA capability | FAKE / REPLAY / future AI | candidate remains non-authoritative until validation |
| Reality+ | reality-preserving enhancement capability | FAKE / REPLAY / future AI | original capture remains authoritative and recoverable |
| Fine Tune | deterministic adjustment capability | REAL deterministic / REPLAY | source asset and recipe lineage remain intact |

## PhotographyDirectorPort design

```text
PhotographyDirectorPort.propose(input: PhotographyDirectorInputV01)
  → DirectorResult<ShotPlanCandidateV01[]>
```

Provider identities are `FAKE`, `REPLAY` and future `AI`. Provider choice is composition-root configuration and does not change business contracts. The result carries request identity, contract version, candidates, provenance and a normalized `ErrorContract` when unavailable or failed.

The Port accepts Level 1 evidence without SpatialEvidence. Later SpatialEvidence may trigger a new versioned request/ranking event; it must not silently mutate an already selected plan.

```text
PROVIDER = 0
LUNA = 0
AI_DIRECTOR_SPIKE = NOT_STARTED
```

## M01 contract audit and roadmap

`EXTEND` preserves the listed M01 Authority and introduces a compatible version/composition later. `NEW` means no semantic contract exists yet. `DEFER` means its schema is owned by a future bounded Track and must not be guessed here.

| Proposed concept | Disposition | Existing authority / reason |
|---|---|---|
| `SubjectReferenceAsset` | EXTEND | `AssetRef` plus captured/reference asset lineage; add semantics without a second asset identity system |
| `SubjectProfileCandidate` | NEW | `CandidateEnvelope` provides governance only; no subject-profile payload contract exists |
| `LightingEvidence` | EXTEND | `RealityContext.scene` and transient `CurrentShotState.lighting` exist; add versioned evidence instead of duplicate fields |
| `PhotographyDirectorInputV01` | NEW | no Director request contract exists |
| `ShotPlanCandidateV01` | EXTEND | compose `CandidateEnvelope` with candidate forms of `SelectedTarget` WHAT and `ShotDirection` HOW |
| `SelectedShotPlanV01` | EXTEND | preserve accepted `SelectedTarget` and `ShotDirection`; add selected-plan identity/references rather than replacing them |
| `LiveTargetBlueprintV01` | NEW | provider-neutral Director-to-Live projection is absent |
| `SubjectLockObservationV01` | DEFER | Live V4 Track owns semantics and real-device evidence |
| `BodyVisibilityGraphV01` | DEFER | `FramePerception` visibility is insufficient; Live V4 must define graph semantics |
| `SemanticAnchorSetV01` | DEFER | existing subject-region fields are not a semantic-anchor contract |
| `HumanObservationV02` | DEFER | refactor observation-only portions of `FramePerception`/`CurrentShotState` in Live V4 |
| `LiveTargetV02` | DEFER | project selected plan/`ShotDirection` into target-only constraints in Live V4 |
| `LiveConstraintStateV01` | DEFER | separate Current-vs-Target comparison from `CurrentShotState`/`LiveShotRuntime` in Live V4 |

No M01 schema is deleted or silently redefined. Schema creation and catalog versioning require the owning future task and regression evidence.

## Event and Session boundaries

Future Director events are `DIRECTOR_REQUESTED`, `SHOT_PLAN_CANDIDATES_READY`, `SHOT_PLAN_CANDIDATE_REJECTED`, `SHOT_PLAN_SELECTED` and `LIVE_TARGET_READY`. Future Live events cover subject acquisition/loss, constraint updates, action issuance, observed human response, evaluated action and readiness.

Async modules return normalized results/events and must not call arbitrary Main reducers. Scene Spatial `INSUFFICIENT` is evidence quality, not request failure. Live `NO_RESPONSE` is not `NO_EFFECT`.

PhotographySession may persist selected contract refs, capability status/version, evidence refs, request/job identity, lineage and business state. It must not persist solver matrices, frame-level CV state, feature tracks, control timers or provider internals.
