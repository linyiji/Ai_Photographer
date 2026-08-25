# Real Capability Admission Matrix V1.0

Status: `ACTIVE_M06_IMPLEMENTATION_EVIDENCE`

This matrix controls the first Main-owned real-intelligence replacement wave. It does not modify M01 contracts or the Platform Catalog. `MODEL_OUTPUT != AUTHORITY`: every provider output remains a Candidate until local schema and policy validation succeeds and a separately authorized promotion gate accepts it.

| Capability | Current selected adapter | Authoritative input available? | Existing output contract? | Provider/runtime | Parallel dependency | Privacy class | Replay strategy | Admission status |
|---|---|---|---|---|---|---|---|---|
| REALITY | FAKE_INTERNAL_ONLY | No authoritative pre-Capture scene image/snapshot input exists | RealityContext + CandidateEnvelope exist | NOT_CONFIGURED | None | Scene image would be sensitive | FAKE_ONLY | BLOCKED_INPUT_CONTRACT |
| TARGET | FAKE_INTERNAL_ONLY | Accepted RealityContext exists, but is deterministic fixture context | SelectedTarget + CandidateEnvelope exist | NOT_CONFIGURED | None | Structured context; future image input unresolved | FAKE_ONLY | BLOCKED_PROVIDER |
| SHOT | FAKE_INTERNAL_ONLY | Accepted SelectedTarget and RealityContext exist | ShotDirection exists; CandidateEnvelope has no SHOT kind | NOT_CONFIGURED | None | Structured context | FAKE_ONLY | BLOCKED_INPUT_CONTRACT |
| QA | FAKE_INTERNAL_ONLY canonical; fixture SHADOW available | Yes: accepted uploaded CaptureAsset plus SelectedTarget/ShotDirection/RealityContext | CandidateEnvelope kind QA + CaptureDecision | Fixture only; real provider NOT_CONFIGURED | None | Confirmed still only | FAKE_ONLY default; explicit SHADOW_REAL Lab | ADMISSION_READY |
| LIVE | FAKE_INTERNAL_ONLY | Parallel Live evidence not accepted for Main; LIVE-P2 FAIL | Existing Live contracts remain authoritative | Not assessed | LIVE Track | Raw video/frame forbidden | FAKE_ONLY | BLOCKED_PARALLEL_TRACK |
| REALITY_PLUS | FAKE_INTERNAL_ONLY | AI Visual Track not accepted | RealityPlusAsset exists | Not assessed | AI Visual Track | Confirmed asset only after future gate | FAKE_ONLY | BLOCKED_PARALLEL_TRACK |
| FINE_TUNE | FAKE_INTERNAL_ONLY | FT-P2 real-device gate pending | AdjustmentRecipe exists | Not assessed | Fine Tune Track | Accepted final/capture asset | FAKE_ONLY | BLOCKED_PARALLEL_TRACK |

## QA admission decision

QA is structurally `ADMISSION_READY` because M05 provides an accepted, user-confirmed CaptureAsset and M01 already provides the Candidate/decision semantics. M06 implements the provider-neutral Gateway, prompt/model provenance, validation, controlled fixture evaluation, shadow invariants, and provider fault normalization.

No explicit provider identity, model identity, endpoint configuration, or environment credential was present at Admission. Therefore:

```text
Real Provider Gate = MANUAL_REVIEW_REQUIRED
QA Promotion Gate = NOT_YET_PASS
QA Selected Adapter = FAKE_INTERNAL_ONLY
M06 Final Gate = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```

## Hard exclusions

- Live, Reality+, and Fine Tune implementations are not imported from parallel worktrees.
- Reality is not forced real by inventing a SceneSnapshotAsset or new canonical state.
- Shot is not forced into the QA/Target Candidate kinds; the missing Candidate kind is recorded as an input/output contract gap without mutating M01.
- Provider paths never accept raw video, frame streams, or unconfirmed stills.
- Default M03 Replay remains `FAKE_ONLY` and makes zero provider calls.
