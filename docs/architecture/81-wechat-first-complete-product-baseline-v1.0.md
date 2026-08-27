# WeChat First Complete Product Baseline V1.0

## Scope

This candidate moves the product-authoritative client path to WeChat Mini Program while retaining H5 as the development, algorithm, replay, and regression harness. It reuses the accepted M01 contracts, PhotographySession, Workflow, backend persistence, asset lineage, deterministic QA/Reality+ placeholder, Fine Tune semantics, Final, and My Works.

It does not promote a product baseline without WeChat Developer Tools and OPPO K11 real-device evidence. Provider, Luna, raw-video upload, frame-stream upload, Scene Spatial, Live integration, AI Director, and Douyin remain outside this task.

## Home V1 and navigation

The imported Home V1 package is preserved under `docs/product/home-v1/` with provenance and original assets. The runtime shell exposes Home, Works, and Mine destinations. Home offers LIVE, REFERENCE, and RECOMMENDED_METHOD entry modes; each creates exactly one PhotographySession through the shared backend authority and converges on the existing Workflow.

The Guangzhou landmark is presentation only. It is never SceneEvidence, RealityContext, or Target proof. External Home context is accepted only as `EXTERNAL_CONTEXT` and reconciled below user intent and observed camera reality.

## Context authority

The reliability order is:

```text
OBSERVED > USER_INTENT > EXTERNAL_CONTEXT > DECORATIVE
```

`HomeContextV01`, `PhotographySessionCreateInputV01`, and `ContextReconcileResultV01` are language-neutral JSON Schema contracts. Reference input is an explicit user input, Recommended Method becomes an IntentSeed, and conflicting camera observation wins over Home weather/location hints. Decorative landmark identifiers are discarded by reconciliation.

## WeChat platform adapters

- Camera: Taro `Camera` plus `createCameraContext`; open/ready/error/capture/switch/close state is explicit.
- Capture: native temporary image path is committed only after user authorization through the existing CaptureAsset path.
- Upload: `Taro.uploadFile`, with the existing endpoint and idempotency boundary.
- Reference: `chooseMedia` plus the existing upload path.
- Save: `saveImageToPhotosAlbum`; permission or platform failure is returned honestly.
- Share: `showShareImageMenu`; unsupported/failure states remain controlled results.
- Fine Tune: shared recipe and pixel semantics, WeChat Canvas 2D interactive preview, OffscreenCanvas final JPEG, user-data file persistence, and upload by file path.

No adapter changes the M01 contract meaning or makes WeChat APIs the shared business authority.

## Camera Preview and Capture

The WeChat Camera component owns preview. Native still capture remains separate from preview presentation and is not inferred from H5 behavior. Composition fidelity requires real rear/front/switch/reopen and CENTER/EDGE/ENVIRONMENT Preview-to-Capture evidence. Until that gate is run, lifecycle, composition, capture, and persistence remain `NOT_EXERCISED` even though compilation and deterministic state tests pass.

## Fine Tune portability

The shared `AdjustmentRecipe` and `renderPixels` implementation remain authoritative. Platform differences are isolated to source decode, Canvas projection, JPEG encode, local file persistence, upload transport, and touch coordinate acquisition. Mock-platform tests prove decode, preview, and finalization seams. Actual WeChat Canvas/OffscreenCanvas availability, memory behavior, local-region touch, and image quality still require Developer Tools and device acceptance.

## Promotion rule

`WECHAT_MINIPROGRAM_PRODUCT_BASELINE` and `FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE` may become `PASS` only after G0-G9 complete, including authorized network, Camera fidelity, Capture persistence, Workflow resume, Fine Tune, Final/My Works/Save, and full OPPO K11 golden flow. The old H5 parent remains `CLOSED_NOT_YET_PASS`.
