# H5 Camera and Capture User Acceptance V1.0

**Task:** `XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01`  
**Gate:** Manual real-device acceptance  
**Current result:** `MANUAL_REVIEW_REQUIRED`

## Test setup

Use the M05 feature branch and a trusted HTTPS endpoint for the H5 app. Do not bypass TLS/browser security. Record the exact feature head, device, OS, browser name/version, endpoint method, and test time in `project-status/evidence/m05/h5-real-device-oppo-k11.md`.

Use a non-sensitive test scene. Do not commit the captured photo/video. Server evidence may retain only asset metadata, request counts, checksum, and workflow projection.

## Mandatory checklist

Record `PASS`, `FAIL`, or `NOT_SUPPORTED_WITH_FALLBACK` for every item.

- Page opens in portrait and clearly shows Internal Demo disclosure.
- Starting a new session is explicit; an existing active session is not silently resumed.
- Camera permission appears only after tapping `打开相机`.
- Permission allow opens a visible preview.
- Rear camera works.
- Front camera works when supported.
- Rear/front switching works when supported.
- Closing the camera stops the visible preview and camera indicator.
- Reopening the camera works.
- Still capture produces a local preview.
- Before confirmation, server upload count remains unchanged.
- `重拍` discards the local preview, does not advance Workflow, and leaves server upload count unchanged.
- A second still can be captured after retake.
- `使用这张` uploads exactly one still and advances CAPTURE to QA.
- Repeated/double confirm does not create a second workflow commit or asset.
- Device import works as the fallback.
- Permission denial leaves device import available with friendly copy.
- Portrait image is displayed upright.
- Landscape image is displayed upright.
- Page rotation and return to portrait do not strand the camera.
- Refresh at QA offers explicit resume and reads QA from the backend.
- Completing the flow creates one My Works item with a visible thumbnail/final.
- Final content opens and download starts.
- Share opens when supported; otherwise friendly copy retains download.
- No persistent black screen, page crash, or stuck busy state occurs.

## Timing evidence

Record approximate values, without inventing precision:

```text
Camera open to preview:
Camera switch:
Shutter to local preview:
Confirm to QA:
Reload to resume offer:
Final open:
```

## Hard boundaries

```text
Raw video uploaded = 0
Unconfirmed still uploaded = 0
Committed real user media = 0
Provider calls = 0
Provider credentials = 0
Secrets committed = 0
```

The gate is PASS only when all mandatory supported behaviors pass, unsupported share/camera-switch behavior has the specified safe fallback, and no blocker is concealed. One-device PASS does not prove WeChat, iOS, CV, thermal, power, or production readiness.
