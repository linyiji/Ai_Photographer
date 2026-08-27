# Mini Program Product Platform Baseline V0.1

Status: `ACTIVE_PLANNING_BASELINE`
Authority task: `XFX_MAIN_TARGET_PLATFORM_REBASELINE_AFTER_H5_CAMERA_LIMITATION_01`
Successor task: `XFX_MAIN_WECHAT_MINIPROGRAM_FIRST_COMPLETE_PRODUCT_BASELINE_01`

## 1. Decision

The bounded H5/OPPO Camera investigation is closed. H5 remains a supported development and algorithm harness, but OPPO Chrome is not an accepted authority for production Preview-to-Capture composition fidelity.

```text
H5 = DEVELOPMENT_AND_ALGORITHM_HARNESS
WECHAT_MINIPROGRAM = PRIMARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
DOUYIN_MINIPROGRAM = SECONDARY_PRODUCT_PLATFORM_CANDIDATE / UNVERIFIED
NATIVE_APP = NOT_CURRENT_TARGET
```

The successor baseline is Non-AI: `Provider = 0`, `Luna = OFF`. This document is planning authority only; it does not accept either Mini Program platform or authorize implementation in the current task.

## 2. Final H5 disposition

| Boundary | Result |
|---|---|
| H5 development, UI, Workflow, backend and diagnostic harness | SUPPORTED |
| OPPO native still quality | PASS — `3072x4096`, 12.58 MP |
| OPPO capture transport | PASS |
| Backend persistence | PASS |
| Preview to native still composition fidelity | UNSUPPORTED |
| H5 OPPO product Camera path | UNSUPPORTED |
| First Complete Non-AI Product Baseline | NOT_YET_PASS |
| Public production readiness | NO |

The preserved evidence chain is:

1. A historical software center crop existed and was removed.
2. A residual field-of-view mismatch remained.
3. Same-camera constraint A/B showed that a forced portrait 3:4 stream constraint selected a narrower video profile.
4. The `LIVE_LIKE` profile materially widened Preview; the physical rear camera remained the same and zoom remained neutral.
5. Native ImageCapture stills remained `3072x4096`.
6. Preview-to-still composition fidelity still failed.
7. Five bounded post-shutter registration cases were all `LOW_CONFIDENCE`; mapping stability is `UNSUPPORTED`.

Further speculative H5 mapping, OPPO-specific crop, Chrome-specific FOV compensation, failed feature registration, and H5 numeric stream profiles must not become global Main contracts.

## 3. H5 future role

H5 remains the preferred fast-feedback surface for:

- UI, Session and Workflow development;
- backend integration and Replay;
- algorithm and Scene Spatial diagnostics;
- Live harness experimentation;
- Fine Tune testing;
- desktop/browser QA.

H5 OPPO Chrome must not be used as production Preview-to-Capture composition-fidelity authority.

## 4. Cross-platform Camera boundary

```text
CameraAdapter
├── H5CameraAdapter
├── WeChatCameraAdapter
└── DouyinCameraAdapter
```

Each adapter must independently establish:

- Preview geometry;
- Capture geometry;
- Preview-to-Capture fidelity;
- orientation behavior;
- front/rear selection and switching;
- native or otherwise accepted high-quality capture;
- permission and Camera lifecycle behavior.

The only promoted cross-platform principle is:

```text
CAMERA STREAM ACQUISITION != FINAL PHOTO COMPOSITION CONTRACT
```

A final 3:4 product photo requirement must not automatically force the Camera preview stream aspect to 3:4. Exact acquisition and presentation behavior remains adapter-specific. The language-neutral catalog in `packages/platform/catalog.json` remains unchanged.

## 5. Successor Main baseline

`XFX_MAIN_WECHAT_MINIPROGRAM_FIRST_COMPLETE_PRODUCT_BASELINE_01` will target one real WeChat Mini Program shell containing:

- Home V1 and navigation;
- PhotographySession entry from live, reference or recommended method;
- Camera and reference entry;
- recommended intent entry;
- Scene/Understanding placeholders while AI remains deferred;
- existing non-AI Target/Guidance workflow;
- real/native Capture, transport and persistence;
- deterministic QA and Reality+;
- Fine Tune;
- Final, My Works, Save and Share.

Reusable platform-neutral capabilities include M01 contracts, Session/Workflow authority, backend APIs and persistence, asset lineage, deterministic QA/Reality+, Replay, Fine Tune semantics, Final/My Works domain flow, and design tokens. Mini Program-specific Camera, album/save, share, lifecycle, permission and runtime adapters require independent implementation and acceptance.

## 6. Home V1 staging and role

The following successor inputs are recognized but not imported:

```text
D:\Projects\_bootstrap\main-next\home-v1\source\ai-photographer-home-v1.html
D:\Projects\_bootstrap\main-next\home-v1\source\ai-photographer-home-v1-design-package.zip
SUCCESSOR_MAIN_INPUT = HOME_V1_STAGED
```

Home is an entry layer, context preload and intent seed. It is not Reality Authority. Future evidence priority is:

```text
Camera Observation
> User Explicit Intent / Reference
> External Context
> Decorative Context
```

A Home landmark remains decorative unless actual Camera or Scene evidence verifies it. Proposed future Session source types are `live`, `reference`, and `recommended_method`; current production contracts are not changed by this planning baseline.

## 7. Context Reconcile

```text
Home Context + User Intent + Reference + Actual Camera Scene
                         ↓
                  Context Reconcile
                         ↓
             Executable Photography Context
```

Reality First remains authoritative. Context Reconcile is a future architectural requirement, not an implementation in this task.

## 8. Successor acceptance gates

| Gate | Required result |
|---|---|
| G0 | Mini Program bootstrap and Taro target |
| G1 | Home, navigation and Session entry |
| G2 | Camera Preview |
| G3 | Preview-to-Capture fidelity |
| G4 | Capture persistence |
| G5 | Workflow and Resume |
| G6 | QA and Reality+ |
| G7 | Fine Tune |
| G8 | Final, My Works, Save and Share |
| G9 | Full real-device Golden Flow |

WeChat is first. Douyin follows through the same Platform Adapter contracts after the WeChat baseline proves the architecture; product logic must not be duplicated wholesale by platform.

## 9. Parallel capability boundaries

- Scene Spatial Main integration: `NOT_STARTED`. It requires a separate selective-integration task after the successor Main baseline is sufficiently stable.
- Live: parallel capability track; Main integration `NOT_STARTED`. Existing H5/Chrome evidence does not establish Mini Program feasibility or portability.
- Fine Tune: preserved accepted Main capability. Mini Program implementation portability requires separate review. No Production MaskProvider is introduced.
- AI Provider: `0`; Luna: `0`. AI capability replacement remains a later phase.

## 10. Successor handoff

The successor must begin from current accepted Main contracts and capabilities, retain the complete H5 negative evidence, load `packages/platform/catalog.json` and this planning baseline, inspect the staged Home V1 sources without treating them as Reality Authority, and execute G0 through G9 with real WeChat-device evidence. It must not infer Mini Program Camera behavior from H5, import Live or Scene Spatial, add a production mask provider, or enable AI.
