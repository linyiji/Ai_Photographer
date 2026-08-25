# Task Report — XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01

## Admission and boundaries

```text
EXECUTION_STRATEGY = ACCELERATED_COMPOSITE_TASK
START_HEAD = 46393ce0a37bb9e339933679438ff57f58c1e835
WORK_BRANCH = feature/m05-real-user-golden-flow
DEVELOP = origin/develop = START_HEAD
PRE_WRITE_ADMISSION = PASS / CLEAN
MAIN = aa816548a53384e4e215e1496d6697f2aff25a16 / UNCHANGED
LIVE WORKTREE = READ-ONLY LIST OBSERVATION ONLY / UNTOUCHED
FINE-TUNE WORKTREE = READ-ONLY LIST OBSERVATION ONLY / UNTOUCHED
```

No protected parallel Worktree path was entered. M01 Contracts, Workflow V1, Platform Catalog, Current Product Prototype, main, Live, and Fine-tune were not modified.

## User Golden Flow and readiness

`ProductRuntimeReadiness` centralizes `DEVELOPMENT`, `INTERNAL_DEMO`, and `PRODUCTION`. Workflow and development storage are honestly REAL; Camera is EXPERIMENTAL pending this task's phone gate; Reality, Target, Shot, Live, QA, Reality+, and Fine Tune remain `FAKE_INTERNAL_ONLY`; final readback/download are real and share remains capability-dependent.

Production returns `ready=false`, `public_production_ready=false`, and a blocking capability list. The compiled Production H5 surface showed the public-readiness message and clicking `开始新的拍摄` created no session. Internal Demo displays a subtle fake-capability disclosure.

## Real still confirmation

H5 camera preview uses permission only after the user taps `打开相机`, stops all tracks on close/capture/navigation, offers front/rear switching, and creates a local JPEG still. WeChat remains compile-safe through the Taro camera chooser. Device import is always available.

Both paths create a local candidate. Before `使用这张`, no upload occurs. `重拍` revokes/discards that candidate and leaves backend stage/revision/assets unchanged. Confirmation checks network, uploads multipart, uses the returned stable asset id, and advances `CREATE_CAPTURE` with a candidate-scoped idempotency key. The confirm button is disabled while busy. Canvas-created camera JPEGs omit copied EXIF; imported original metadata is not falsely claimed to be stripped.

## Resume, My Works, and final actions

`GET /sessions` returns minimal backend-truth projections classified as ACTIVE or COMPLETED. Home never silently resumes local storage; it offers explicit continue/new choices and supports multiple sessions. My Works comes from completed backend rows and renders persisted thumbnails/finals. Final offers open/readback, download, capability-dependent share, start new, and return to works. Friendly copy covers permission, unsupported camera, offline, cancellation, invalid asset, storage failure, and share fallback.

## M05 Replay and automation

Twelve versioned user scenarios extend the M03 Lab surface:

```text
USER_START_NEW
USER_RESUME_ACTIVE
CAPTURE_IMPORT_CONFIRM
CAPTURE_RETAKE_BEFORE_CONFIRM
CAMERA_PERMISSION_DENIED_FALLBACK
CAMERA_UNAVAILABLE_FALLBACK
UPLOAD_OFFLINE_RETRY
UPLOAD_DUPLICATE_CONFIRM
REFRESH_AFTER_CAPTURE
FINAL_WORKS_READBACK
PRODUCTION_FAKE_AI_BLOCKED
SHARE_UNSUPPORTED_DOWNLOAD_AVAILABLE
```

All return deterministic PASS evidence. Backend tests additionally prove readiness classification, ACTIVE/COMPLETED projection, zero stored assets before confirmation, one event/asset on duplicate confirm, QA refresh recovery, completed works projection, and final binary readback.

## Automated acceptance

```text
Backend pytest = 76 passed / 76
Frontend policy/platform tests = 11 passed / 11
Frontend TypeScript = PASS
M05 Replay scenarios = 12 / 12 PASS
M02/M03/M04 regression = PASS through full backend suite
H5 build = PASS_WITH_WARNING
WeChat build = PASS
H5 entry = 302 KiB / retained size advisory
Unexpected semantic diff = 0
git diff --check = PASS
```

## Desktop browser evidence

A fresh Internal Demo browser session traversed Home to CAPTURE against real FastAPI/SQLite. Closing the first automation tab and reopening the app showed `继续上次拍摄 · 拍摄窗口`, proving backend-driven explicit resume. The repository scene fixture was selected through the real file chooser. The page showed the local preview and `重拍 / 使用这张`; server logs contained no upload. Retake returned to camera/import and still contained no upload. A second selection plus confirmation emitted exactly one `POST /assets/uploads` (201) and one `CREATE_CAPTURE` action, then reached QA.

Reload at QA returned Home with `继续 · 挑选结果`. Completion reached FINAL, loaded the real final content URL, and My Works listed one completed item. Share opened when supported; download remained visible. Console warning/error evidence was empty. A separate Production build displayed the fake-AI block; tapping Start produced no `POST /sessions`.

## Real-device acceptance and bounded fix

The user operated an OPPO K11 running ColorOS 15.0 and Chrome Mobile 138.0.7204.168 through trusted temporary Cloudflare Quick Tunnels. No phone behavior was inferred from desktop automation. Permission appeared only after `打开相机`; denial retained friendly import fallback; rear/front/switch, close/reopen, portrait/landscape/return, local still, pre-confirm retake, explicit resume, Final, My Works, download, and share/fallback all passed without a visible black screen, crash, stall, or stuck busy state.

The expected start build had a proven mobile test-topology defect: its fixed `http://127.0.0.1:8000` API origin could not reach the workstation backend from a phone HTTPS page. Commit `73c8782bca4600288c18526c7eefcb8f8366091c` added a build-time `XFX_API_BASE` while retaining loopback as the local default. Temporary tunnel hostnames were never committed. Post-fix typecheck, H5, WeChat, frontend, backend, and real-phone checks passed.

Server metadata proves zero upload/revision/asset change for the local retake-before-confirm path. Each confirmed local candidate emitted exactly one multipart upload, one confirmation key, one `CREATE_CAPTURE_COMMITTED`, and one CAPTURE→QA advance. The accepted Session deliberately exercised a later QA micro-retake, so two separately authorized still uploads are retained in runtime metadata with `RETAKE_MICRO_COMMITTED` between them; this is not duplicate confirmation. The final accepted still is JPEG / 66032 bytes / SHA256 `1905cfc50105175de1a0c52c84c49d22959d34e9a5756ccde00982c48ba98cc4`.

```text
Status = PASS_WITH_WARNING
Implementation Gate = PASS
Real Device Gate = PASS
M05 Final Gate = PASS
INTERNAL_USER_GOLDEN_FLOW_READY = YES
PUBLIC_PRODUCTION_READY = NO
Device = OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168
Camera / switch / shutter latency = <1 second each / user approximate
Confirm to QA = approximately 2 seconds
Raw Video Upload = 0
Frame Stream Upload = 0
Unconfirmed Still Upload = 0
Committed Real User Media = 0
Provider Calls = 0
Feature Acceptance Head = db8c51f07a81e2b9f06635627c650dc3f21f7dca
Develop Before Merge = 46393ce0a37bb9e339933679438ff57f58c1e835
Develop Merge Result = db8c51f07a81e2b9f06635627c650dc3f21f7dca
Auto FF Merge = PASS
```

Warnings are limited to the existing H5 302 KiB size advisory and two timing values that the user did not separately measure. Share passed its governed acceptance but the user did not identify whether the supported Web Share or safe fallback branch executed. The Platform Matrix is promoted only for the tested OPPO K11 H5 scope; WeChat remains `UNVERIFIED_REAL_DEVICE`.

## Security and scope

```text
Raw Video Upload = 0
Unconfirmed Still Upload = 0
Committed Real User Media = 0
Provider Calls = 0
Provider Credentials = 0
Secrets Committed = 0
Production Object Storage = NOT_LOCKED
Production Database = NOT_LOCKED
M01 / Platform / M02 / M03 / M04 = PRESERVED
CH-003 = IDENTIFIED / UNCHANGED
MAIN = UNCHANGED
PARALLEL WORKTREES = UNTOUCHED
```

## Commit evidence

```text
6f0a4c3 = feat: build real user capture golden flow
73c8782 = fix: support trusted mobile acceptance api endpoint
Device acceptance/status commit = this report's containing commit
Automation commit = SELF / final feature branch HEAD at push
Remote feature branch = PASS / origin/feature/m05-real-user-golden-flow
Strict-FF develop push = PASS / db8c51f07a81e2b9f06635627c650dc3f21f7dca
Closure-only commit = this report's next containing commit on develop
```

## Next task

```text
XFX_M06_REAL_CAPABILITY_INTEGRATION_WAVE_01
START NEXT TASK = NO
```
