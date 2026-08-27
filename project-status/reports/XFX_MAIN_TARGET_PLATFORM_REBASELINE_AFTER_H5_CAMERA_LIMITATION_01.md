# Task Report — XFX_MAIN_TARGET_PLATFORM_REBASELINE_AFTER_H5_CAMERA_LIMITATION_01

## Classification

```text
Task type = Authority / Architecture / Handoff closure
Parent = XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01
Branch = feature/first-complete-non-ai-product-flow
Admission head = b61463b7039609709ac24d016c85a73ab12b2fc8
Task result = PASS
Product implementation changed = NO
```

## Admission and scope

Git Admission confirmed a clean worktree, the expected branch and exact local/remote lineage at `b61463b7039609709ac24d016c85a73ab12b2fc8`. No reset, rebase, force push or develop merge was performed.

This task closed the H5 product-Camera investigation without reopening remediation. No WeChat pages, Home implementation, workflow rewrite, Scene Spatial or Live merge, Fine Tune rewrite, Provider change, Luna change, MaskProvider or product code was introduced.

## Accepted H5 evidence

```text
CAMERA_GEOMETRY = PASS
CONSTRAINT_TRIGGER = CONFIRMED
SELECTED_STREAM_PROFILE = LIVE_LIKE
STREAM_COMPOSITION_DECOUPLED = YES
PREVIEW_NATIVE_STILL_REGISTRATION = FAIL
MAPPING_STABILITY = UNSUPPORTED
REGISTRATION_CONFIDENCE = INSUFFICIENT / 5 OF 5 LOW_CONFIDENCE
ALIGNMENT_MODE = UNSUPPORTED
NATIVE_STILL = PASS / 3072x4096 / 12.58 MP
CAPTURE_TRANSPORT = PASS
BACKEND_PERSISTENCE = PASS
H5_OPPO_CAMERA_COMPATIBILITY = UNSUPPORTED
```

The evidence preserves the historical software crop, its removal, the residual FOV mismatch, the constraint-trigger A/B, the wider `LIVE_LIKE` Preview, same physical Camera, neutral zoom, unchanged native still and five failed bounded registration cases. The investigation stopped because the tested OPPO Chrome video and native ImageCapture pipelines did not yield a reliably recoverable composition mapping. No static crop or mapping was fabricated.

## Parent disposition

```text
OLD_PARENT = CLOSED_NOT_YET_PASS
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
H5_OPPO_PRODUCT_CAMERA_PATH = UNSUPPORTED
FULL_MAIN_GOLDEN_FLOW = FAIL / BLOCKED_BY_H5_CAMERA_COMPATIBILITY
PUBLIC_PRODUCTION_READY = NO
```

The historical Parent is not promoted to PASS.

## Platform rebaseline

```text
H5 = DEVELOPMENT_AND_ALGORITHM_HARNESS
WECHAT_MINIPROGRAM = PRIMARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
DOUYIN_MINIPROGRAM = SECONDARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
NATIVE_APP = NOT_CURRENT_TARGET
```

Planning authority: `docs/platform/MINIPROGRAM_PRODUCT_PLATFORM_BASELINE_V01.md`.

The global principle is limited to `CAMERA STREAM ACQUISITION != FINAL PHOTO COMPOSITION CONTRACT`. OPPO-specific crop, Chrome-specific FOV mapping, failed feature registration and H5 stream-profile numbers remain compatibility evidence only. `packages/platform/catalog.json` was not changed.

## Successor handoff

Current reusable Main capabilities are M01 contracts, PhotographySession/Workflow, backend integration and persistence, asset lineage, deterministic QA/Reality+, Replay, Fine Tune semantics, Final/My Works flow, Save/Share seams and shared design foundations. WeChat must independently implement and accept Camera, permission/lifecycle, native/high-quality Capture, Preview-to-Capture fidelity, Album/Save and Share platform boundaries.

Home V1 is staged at `D:\Projects\_bootstrap\main-next\home-v1\source\` as `ai-photographer-home-v1.html` and `ai-photographer-home-v1-design-package.zip`; neither was imported. Home is entry/context/intent, not Reality Authority. Future Session inputs may be live, reference or recommended method and must reconcile against actual Camera Scene before becoming executable context.

Successor gates are G0 bootstrap, G1 Home/Session, G2 Preview, G3 fidelity, G4 persistence, G5 Workflow/Resume, G6 QA/Reality+, G7 Fine Tune, G8 Final/My Works/Save/Share and G9 real-device Golden Flow.

```text
SCENE_SPATIAL_INTEGRATION = NOT_STARTED
LIVE_INTEGRATION = NOT_STARTED
FINE_TUNE = PRESERVED_FOR_PORTABILITY_REVIEW
PROVIDER = 0
LUNA = 0
NEXT_TASK = XFX_MAIN_WECHAT_MINIPROGRAM_FIRST_COMPLETE_PRODUCT_BASELINE_01
START_NEXT_TASK = NO
```

## Artifacts and validation

- Created the Mini Program planning baseline and this Task Report.
- Appended the final platform disposition to the historical Parent report.
- Clarified the H5 Camera capability matrix so lifecycle/capture API support is not confused with product composition fidelity.
- Updated current Project Status and handoff to the successor task.
- Verified the two staged Home V1 inputs exist.
- Verified the task is documentation-only and the locked Platform Catalog remains unchanged.

Closure commit: `SELF`.
