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

## Real-device disposition

The implementation and automated gates do not prove phone camera behavior. The required checklist and OPPO K11 evidence template exist, but no new M05 device run was supplied or inferred.

```text
Status = READY_FOR_MANUAL_DEVICE_TEST
Implementation Gate = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
M05 Final Gate = NOT_YET_PASS
INTERNAL_USER_GOLDEN_FLOW_READY = NO
PUBLIC_PRODUCTION_READY = NO
Auto FF Merge = NOT_ATTEMPTED
Develop After = 46393ce0a37bb9e339933679438ff57f58c1e835 / UNCHANGED
```

The Platform Matrix Camera row is intentionally unchanged until signed real-device evidence passes.

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
Documentation/status commit = this report's containing commit
Automation commit = final feature branch HEAD after validation
Remote feature branch = REQUIRED BEFORE HANDOFF
```

## Next task

Only after the M05 real-device and final gates pass:

```text
XFX_M06_REAL_CAPABILITY_INTEGRATION_WAVE_01
START NEXT TASK = NO
```
