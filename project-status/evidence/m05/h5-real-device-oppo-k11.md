# M05 H5 Real Device Evidence — OPPO K11

```text
TASK_ID = XFX_M05_REAL_DEVICE_ACCEPTANCE_AND_CLOSURE_01
STATUS = PASS_WITH_WARNING
REAL_DEVICE_GATE = PASS
FEATURE_BRANCH = feature/m05-real-user-golden-flow
FEATURE_HEAD_AT_DEVICE_TEST = 73c8782bca4600288c18526c7eefcb8f8366091c
EXPECTED_START_HEAD = 803cbf563eea2eacb2f0ae15833b4c30db8f73f7
DEVICE = OPPO K11
OS = ColorOS 15.0
BROWSER = Chrome Mobile 138.0.7204.168
TESTED_AT = 2026-08-25 14:43–14:55 CST / approximate
TESTER = USER OPERATED DEVICE
HTTPS_ENDPOINT_METHOD = Cloudflare Quick Tunnel / trusted temporary HTTPS
TLS_OR_BROWSER_BYPASS = NONE
```

The user operated the phone and reported the visible results. Assistant-side evidence is limited to server requests, SQLite metadata/events, build output, and the user's checklist response. A user-supplied screenshot showed the local preview, privacy copy, `重拍`, and `使用这张`; because it contains real scene content, the image itself was not copied into or committed to the repository.

## Trusted HTTPS preflight and bounded fix

At the expected start head `803cbf563eea2eacb2f0ae15833b4c30db8f73f7`, the H5 bundle used the fixed API origin `http://127.0.0.1:8000`. A real phone loading the H5 application from trusted HTTPS would therefore target the phone's loopback address and attempt insecure HTTP from an HTTPS page. The end-to-end acceptance path could not reach the repository backend, so this was classified as a proven M05 test-topology defect before device execution; no device result was inferred.

The bounded fix makes the API origin a build-time value (`XFX_API_BASE`) while preserving `http://127.0.0.1:8000` as the local default. Temporary tunnel hostnames were injected only into generated acceptance bundles and were not committed. Both temporary H5 and API endpoints returned HTTP 200. The scoped fix commit is `73c8782bca4600288c18526c7eefcb8f8366091c` (`fix: support trusted mobile acceptance api endpoint`).

## Mandatory device results

```text
Portrait page load = PASS
Internal Demo disclosure = PASS
Explicit New / Resume choice = PASS
Silent resume = 0
Permission before user action = 0
Permission request after 打开相机 = PASS
Permission allow / visible preview = PASS
Permission denial friendly copy = PASS
Import fallback after denial = PASS
Rear camera = PASS
Front camera = PASS
Rear/front switching = PASS
Close stops preview / observable indicator = PASS
Reopen camera = PASS
Still capture / local preview = PASS
Retake before confirmation = PASS
Second still after local retake = PASS
Unconfirmed upload delta = 0
Unconfirmed CaptureAsset delta = 0
Unconfirmed Workflow revision delta = 0
Confirmed multipart upload = 1 per confirmed local candidate
CREATE_CAPTURE = 1 per confirmed local candidate
CaptureAsset = 1 current asset per Session
Duplicate confirm protection = PASS
Device import = PASS
Portrait image upright = PASS
Landscape image upright = PASS
Rotation / return portrait = PASS
Refresh returned Home = PASS
Explicit resume offer = PASS
Resume read QA from backend = PASS
Full Golden Flow to FINAL = PASS
My Works new completed item = PASS
Final image open = PASS
Download = PASS
Share or governed fallback retaining download = PASS
Persistent black screen = NONE
Page crash = NONE
Stuck busy state = NONE
```

The accepted Session `session-a24f1835b0b8` deliberately exercised a post-confirmation QA micro-retake. Server evidence therefore contains two separately user-authorized multipart stills, with `RETAKE_MICRO_COMMITTED` and a new CAPTURE stage between them. Each candidate produced exactly one confirmation key and one `CREATE_CAPTURE_COMMITTED`; this is not a duplicate-confirm upload. The final Session reached `FINAL` at revision 14 with one current CAPTURE asset, one REALITY_PLUS asset, and one FINAL asset.

## Timing and stored metadata

```text
Camera action → preview = <1 second / user approximate
Camera switch = <1 second / user approximate
Shutter → local preview = <1 second / user approximate
Confirm → QA = approximately 2 seconds
Reload → resume offer = not separately timed; no visible stall reported
Final open = not separately timed; PASS with no visible stall reported
Test network = OPPO K11 mobile connectivity through trusted HTTPS Quick Tunnel
Accepted final still MIME = image/jpeg
Accepted final still size = 66032 bytes
Accepted final still SHA256 = 1905cfc50105175de1a0c52c84c49d22959d34e9a5756ccde00982c48ba98cc4
Accepted final still AssetRef = local-asset://upload-f08fec18e11a4bc3b754a929
```

## Privacy, security, and warnings

```text
Raw Video Upload = 0
Frame Stream Upload = 0
Unconfirmed Still Upload = 0
Committed Real User Media = 0
Provider Calls = 0
Provider Credentials = 0
Secrets Committed = 0
Temporary tunnel credentials committed = 0
```

Warnings and evidence limits:

- `PASS_WITH_WARNING`: Reload-to-resume and Final-open latency were not separately timed; the user reported PASS and no visible stall, but no precision is invented.
- The user confirmed the Share requirement as PASS but did not separately identify whether Chrome opened Web Share or exercised the governed fallback. The acceptance requirement passes either branch because download remained available.
- H5 retains the existing 302 KiB entrypoint-size advisory.
- Acceptance is limited to OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168. It does not generalize to all Android, iOS, WeChat, Douyin, CV, thermal, power, or production readiness.
- No real photo, frame, video, tunnel hostname, credential, or secret is committed.

## Decision

```text
IMPLEMENTATION_GATE = PASS
REAL_DEVICE_GATE = PASS
M05_FINAL_GATE = PASS
INTERNAL_USER_GOLDEN_FLOW_READY = YES
PUBLIC_PRODUCTION_READY = NO
```
