# WeChat DevTools and Real-Device Reacceptance 02

Task: `XFX_MAIN_WECHAT_MINIPROGRAM_DEVTOOLS_AND_REAL_DEVICE_REACCEPTANCE_02`
Date: 2026-08-27
Result: `MANUAL_REVIEW_REQUIRED`

## Admission

```text
Branch = feature/wechat-miniprogram-first-complete-product-baseline
HEAD = 4de559e93f3f16a48203c22298e57e1c817f5e57
origin HEAD = 4de559e93f3f16a48203c22298e57e1c817f5e57
Ahead / Behind = 0 / 0
Working tree at admission = CLEAN
```

No reset, rebase, force push, develop merge, product-code change, account mutation, or external WeChat configuration change occurred.

## Fresh local verification

The repository has no root `package.json`; the actual client package is `apps/client/package.json`.

```text
WECHAT_BUILD_COMMAND = taro build --type weapp
WECHAT_BUILD_OUTPUT = D:\Projects\Ai_Photographer\apps\client\dist
TypeScript = PASS
Frontend tests = 87 / 87 PASS
WeChat build = PASS
Build warning = ASSET_SIZE_WARNING
Output app.json = PRESENT
```

The warning is the existing 993 KiB decorative Guangzhou landmark asset. It did not cause compilation failure.

The shell did not expose npm. The configured bundled Node runtime and the already-installed, locked TypeScript/Taro executables were invoked directly. A bundled pnpm attempt was rejected by its dependency-build approval policy; its two generated untracked metadata files were removed, leaving no dependency or source change.

## Developer Tools discovery

Common Program Files, user-local Tencent directories, command lookup, Windows uninstall registry, Start Apps, Start Menu shortcuts, and desktop shortcuts were inspected. No official WeChat Developer Tools executable or CLI was found.

```text
WECHAT_DEVTOOLS = NOT_AVAILABLE
WECHAT_DEVTOOLS_GATE = MANUAL_REVIEW_REQUIRED
DevTools version = NOT_AVAILABLE
Project mode = NOT_EXERCISED
Compile mode = NOT_EXERCISED
Device simulation profile = NOT_EXERCISED
```

Exact Owner instruction:

> Install official WeChat Developer Tools then log into an authorized WeChat account.

## AppID authority

`apps/client/project.config.json` and the generated output use `touristappid`. No authorized Mini Program AppID was found or inferred. No account-sensitive identifier is recorded here.

```text
WECHAT_APPID_GATE = MANUAL_REVIEW_REQUIRED
```

Owner action: provide or select an authorized Mini Program project/AppID in WeChat Developer Tools. This task did not create an account or change project ownership.

## Real-device network audit

The build-time default backend is `http://127.0.0.1:8000`. It is a local loopback HTTP endpoint and cannot be the formal real-device Mini Program backend path. No authorized HTTPS request/upload domain was supplied.

```text
WECHAT_REAL_DEVICE_NETWORK_GATE = MANUAL_REVIEW_REQUIRED
```

Owner action:

1. Provide an externally reachable trusted-HTTPS backend hostname.
2. Configure that HTTPS hostname in WeChat Mini Program administration under the server-domain fields for `request` legal domain and `uploadFile` legal domain.
3. Build with `XFX_API_BASE=https://<authorized-host>` without committing credentials or tokens.

Developer Tools domain/certificate bypass may diagnose locally but cannot close this gate.

## Device-dependent gates

No authorized WeChat runtime or real-device session could start, so no device behavior is inferred from build or unit tests.

```text
DEVICE = NOT_EXERCISED
WECHAT_CAMERA_LIFECYCLE = NOT_EXERCISED
CENTER_FIDELITY = NOT_EXERCISED
EDGE_FIDELITY = NOT_EXERCISED
ENVIRONMENT_FIDELITY = NOT_EXERCISED
WECHAT_CAMERA_COMPOSITION_FIDELITY = NOT_EXERCISED
WECHAT_CAPTURE = NOT_EXERCISED
CAPTURE_DIMENSIONS = NOT_EXERCISED
CAPTURE_BYTES = NOT_EXERCISED
CAPTURE_PERSISTENCE = NOT_EXERCISED
FINE_TUNE_DEVICE_GATE = NOT_EXERCISED
LOCAL_REGION = NOT_EXERCISED
FINALIZE = NOT_EXERCISED
MY_WORKS = NOT_EXERCISED
SAVE_TO_ALBUM = NOT_EXERCISED
SHARE = NOT_EXERCISED
FULL_WECHAT_GOLDEN_FLOW = NOT_EXERCISED
```

Already accepted implementation and automated gates remain unchanged: Home navigation/session entry, backend, workflow, context reliability/reconcile, Camera adapter, and Fine Tune portability implementation were not reopened without runtime regression evidence.

## Boundary

```text
WECHAT_MINIPROGRAM_PRODUCT_BASELINE = NOT_YET_PASS
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
OLD_H5_PARENT = CLOSED_NOT_YET_PASS
SCENE_SPATIAL_INTEGRATION = NOT_STARTED
LIVE_INTEGRATION = NOT_STARTED
AI_DIRECTOR = NOT_STARTED
DOUYIN = NOT_STARTED
PROVIDER = 0
LUNA = 0
RAW_VIDEO_UPLOAD = 0
FRAME_STREAM_UPLOAD = 0
PUBLIC_PRODUCTION_READY = NO
```
