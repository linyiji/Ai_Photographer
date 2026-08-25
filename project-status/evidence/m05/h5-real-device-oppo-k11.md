# M05 H5 Real Device Evidence — OPPO K11

```text
TASK_ID = XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01
STATUS = READY_FOR_MANUAL_DEVICE_TEST
REAL_DEVICE_GATE = MANUAL_REVIEW_REQUIRED
FEATURE_BRANCH = feature/m05-real-user-golden-flow
FEATURE_HEAD = REMOTE feature/m05-real-user-golden-flow HEAD AT DEVICE TEST
DEVICE = OPPO K11
OS = ColorOS 15.0 / VERIFY AT TEST TIME
BROWSER = Chrome Mobile / RECORD EXACT VERSION
TESTED_AT = PENDING
TESTER = USER OPERATED DEVICE
HTTPS_ENDPOINT_METHOD = PENDING
```

## Trusted HTTPS preflight and bounded fix

At the expected start head `803cbf563eea2eacb2f0ae15833b4c30db8f73f7`, the H5 bundle used the fixed API origin `http://127.0.0.1:8000`. A real phone loading the H5 application from a trusted HTTPS tunnel would therefore target the phone's own loopback address and would also attempt an insecure HTTP request from an HTTPS page. The end-to-end acceptance path could not reach the repository's backend, so this was classified as a proven M05 test-topology defect before device execution; no device result was inferred.

The bounded fix makes the API origin a build-time value (`XFX_API_BASE`) while preserving `http://127.0.0.1:8000` as the local default. The temporary tunnel hostname is injected only into the generated acceptance bundle and is not committed in source or configuration. Post-fix typecheck and H5 build passed; the temporary H5 page and API health endpoint both returned HTTP 200. Real-device results remain pending below.

## Results

Complete the mandatory checklist from `docs/platform/72-h5-camera-and-capture-user-acceptance-v1.0.md` here. Do not infer phone behavior from desktop automation.

```text
Permission request after user action = PENDING
Preview open / close / reopen = PENDING
Rear / front / switch = PENDING
Still capture = PENDING
Retake before upload = PENDING
Unconfirmed still upload count = PENDING
Confirmed upload count = PENDING
Duplicate confirm = PENDING
Import fallback = PENDING
Portrait / landscape / rotation = PENDING
Reload / resume = PENDING
My Works / final open = PENDING
Download / share fallback = PENDING
Visible stalls / black screen / crash = PENDING
Raw video upload = 0 / MUST REMAIN ZERO
Committed real user media = 0 / MUST REMAIN ZERO
```

## Warnings and limitations

Record all observed warnings, exact evidence limitations, and the final signed decision. Do not modify `docs/platform/70-platform-capability-matrix-v1.0.md` until this gate is PASS.
