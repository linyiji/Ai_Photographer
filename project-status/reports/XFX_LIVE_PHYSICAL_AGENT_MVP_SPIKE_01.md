# Task Report — XFX_LIVE_PHYSICAL_AGENT_MVP_SPIKE_01

## Classification

```text
PROMPT_STANDARD = XFX_CODEX_EXECUTION_STANDARD_V1
PROFILE = REALTIME_CAMERA_CV
MODE = CAMERA_PIPELINE
TRACK = PARALLEL_LIVE
TASK STATUS = READY_FOR_MANUAL_DEVICE_TEST
IMPLEMENTATION GATE = PASS
REAL DEVICE GATE = MANUAL_REVIEW_REQUIRED
LIVE-P0 FINAL GATE = NOT_YET_PASS
```

## Admission and isolation

```text
Main repository = D:\Projects\Ai_Photographer
Live worktree = D:\Projects\_worktrees\Ai_Photographer-live
Live branch = spike/live-physical-agent-mvp-v0.1
START_HEAD = ced35fa17931935b921a1937a32d269e46ebf8ff
Required base = ced35fa17931935b921a1937a32d269e46ebf8ff
Base contained in develop = PASS
Main repository PRE_WRITE_ADMISSION = CLEAN
Live branch pre-existed = NO
Live worktree pre-existed = NO
```

Protected ref snapshot before worktree creation:

```text
develop = ced35fa17931935b921a1937a32d269e46ebf8ff
main = aa816548a53384e4e215e1496d6697f2aff25a16
origin/develop = ced35fa17931935b921a1937a32d269e46ebf8ff
origin/main = aa816548a53384e4e215e1496d6697f2aff25a16
feature/frontend-runtime-l1-lock = 5436f188184c718e2fe527369d749f8ef071043c
```

The main repository path in the user message contained an extra separator (`Ai\_Photographer`) and did not exist. The Task Contract, Project Status, Git top-level and only matching project directory all resolved uniquely to `D:\Projects\Ai_Photographer`; that verified authority path was used.

## External document admission

| External source | Admitted repository path | SHA256 | Result |
|---|---|---|---|
| `D:\Projects\_bootstrap\live\17-live-physical-agent-mvp-v0.1.md` | `docs/product-design/17-live-physical-agent-mvp-v0.1.md` | `B397F50B8C2A2A5A7687036BCB451AC6AEAC592443D5104175A85AE8FE3D2F58` | BYTE-PRESERVED / PASS |
| `D:\Projects\_bootstrap\live\45-live-parallel-track-governance-v0.1.md` | `docs/project-management/45-live-parallel-track-governance-v0.1.md` | `07E7425F896E93FE44EA13399658B7BAFF0750CC7564E5AE533E4348EA7320AD` | BYTE-PRESERVED / PASS |

No semantic or metadata/path rewrite was made to either admitted document.

## Implementation

The self-contained implementation is under `spikes/live-physical-agent-mvp/` and uses Vite 8.2.2, TypeScript 5.9.3 and Vanilla TypeScript on locked Node/npm L0.

Implemented:

- user-action-only `getUserMedia()` request;
- camera permission/result state and visible unsupported/insecure/error paths;
- start/stop with media track release;
- front/rear facing preference and active settings readback;
- camera switching with single-camera fallback;
- local preview dimensions and front-preview-only mirroring;
- explicit Sensor / Preview / User-Action coordinate separation;
- Debug HUD hide/show;
- estimated preview FPS, late frame, presented-frame drop estimate and session elapsed time;
- `requestVideoFrameCallback` primary scheduler and throttled 30Hz `requestAnimationFrame` fallback;
- capability readout with no raw frame storage/upload and no identifying secrets;
- trusted HTTPS tunnel instructions for phone validation.

Not implemented by contract: ML/CV inference, MediaPipe, Pose, Perception, Delta/Priority, Guidance, Luna, backend, capture, photo QA, Reality+, production adapters or P1.

## Validation

| Gate | Result |
|---|---|
| Node 24.18.0 | PASS |
| npm 11.6.2 | PASS |
| `package-lock.json` committed | PASS |
| `npm ci` fresh reproduction | PASS |
| `npm ls --depth=0` | PASS |
| TypeScript | PASS |
| Production build | PASS |
| Browser page load | PASS |
| No camera before user action | PASS |
| Visible unsupported path | PASS |
| HUD render and hide/show | PASS |
| No uncaught startup exception | PASS |
| Real phone | NOT_TESTED / MANUAL_REVIEW_REQUIRED |
| Preview FPS candidate threshold | NOT_TESTED |
| Raw Video Upload | 0 |

The first TypeScript run failed because a spike-local compatibility interface declared methods already required by TypeScript 5.9.3 DOM types as optional. It was minimally corrected to use the standard DOM types; the repeated TypeScript and build gates passed. Negative evidence is retained here rather than hidden.

The first browser connection could not reach the localhost-only test binding through the browser isolation boundary. Rebinding the same local development server to `0.0.0.0` made `127.0.0.1` reachable and the complete smoke passed. No browser security control was disabled.

The staged pre-commit whitespace check reported the intentional Markdown hard-line-break spaces already present in the two external admitted documents. Those documents were not rewritten because byte preservation and provenance are explicit acceptance requirements. The authored spike/report/evidence files have no whitespace errors, and the required final clean-tree `git diff --check` is the recorded gate.

Detailed automated evidence: `spikes/live-physical-agent-mvp/evidence/camera/LIVE_P0_AUTOMATED_EVIDENCE.md`.

## Governance and safety

```text
develop modified = NO
main modified = NO
origin/develop modified = NO
origin/main modified = NO
main product feature branch modified by this task = NO
apps/client production implementation modified = NO
global product contracts modified = NO
global Project Status / GPT Handoff modified = NO
project-status/CHALLENGES.json modified = NO
CH-003 = UNCHANGED / IDENTIFIED
private keys/certificates/secrets committed = NO
captured personal camera frames committed = NO
raw video uploaded = 0
force push = NO
merge to develop = NO
P1 started = NO
```

## Git and disposition

The required commit message is `spike: bootstrap live physical agent camera sandbox`. The commit containing this report is the Task commit; its concrete SHA is recorded in the final Task output and remote branch.

```text
Task Disposition = READY_FOR_MANUAL_DEVICE_TEST
Next Recommended Task = XFX_LIVE_PHYSICAL_AGENT_P0_MANUAL_DEVICE_ACCEPTANCE_01
DO NOT START NEXT TASK
```
