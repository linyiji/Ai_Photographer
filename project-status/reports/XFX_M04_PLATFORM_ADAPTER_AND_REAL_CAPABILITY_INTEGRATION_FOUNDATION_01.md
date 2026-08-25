# Task Report — XFX_M04_PLATFORM_ADAPTER_AND_REAL_CAPABILITY_INTEGRATION_FOUNDATION_01

## Admission and boundaries

```text
EXECUTION_STRATEGY = ACCELERATED_COMPOSITE_TASK
START_HEAD = 68afacb7b9900f27fc99b75a63ef68724177f0d1
WORK_BRANCH = feature/m04-platform-adapter-integration
PRE_WRITE_ADMISSION = PASS / CLEAN
DEVELOP = origin/develop = START_HEAD
MAIN = origin/main = aa816548a53384e4e215e1496d6697f2aff25a16
LIVE WORKTREE = READ-ONLY BRANCH LIST OBSERVATION ONLY / UNTOUCHED
```

M01 Contracts, Workflow V1, and the locked Platform Catalog were not edited. No Live worktree path was entered. Main was not checked out or modified.

## Platform runtime and replacement governance

The runtime registry consumes all 11 names from `packages/platform/catalog.json` and adds implementation-only descriptors: adapter id/version, platform, availability, `SUPPORTED/PARTIAL/UNSUPPORTED/UNVERIFIED_REAL_DEVICE`, reason, source, runtime support, and catalog provenance. H5, WeChat, Test/Lab and eight deterministic Lab profiles are centralized; pages do not scatter platform selection.

The replacement model records `FAKE/REAL/EXPERIMENTAL/UNAVAILABLE`. Real development Storage and H5 Network are selected only where accepted. Camera/Share/Haptic/Album remain honestly experimental, partial, or unverified. Auth and Payment remain unavailable. `FakeLiveGuidanceCapability` remains selected; the future Physical Agent seam is documented but not implemented or imported.

Platform errors normalize into the M01 ErrorContract shape for permission, unsupported, cancellation, timeout, network, storage, invalid asset, share, and camera failures. Unsupported behavior is controlled rather than reported as success.

## Real asset and product path

`DEVELOPMENT_LOCAL_STORAGE_ADAPTER` stores only beneath ignored `apps/api/.local/assets/` (or an explicit development root). The upload endpoint accepts JPEG/PNG/WebP multipart files up to 20 MiB and validates non-zero content, declared MIME, extension, content signature, bounded size, server-generated identity, and SHA256. API responses expose `local-asset://` references and metadata, never an absolute server path or binary/base64 Session payload.

Read/download resolves only a validated stable id and reconstructs a server-owned filename beneath the configured root. Tests block relative traversal, encoded traversal identity, absolute Windows paths, UNC paths, unsupported MIME, mismatched extension/signature, oversize, and zero bytes. Arbitrary file read/write endpoints do not exist.

Normal H5 Capture selects a real local image through the centralized platform adapter, performs an actual multipart upload, then passes only the accepted uploaded id into `SessionService.CREATE_CAPTURE`. Missing ids cannot advance the workflow. QA and Reality+ remain deterministic fakes. Final download resolves the accepted Session source upload and labels the transformation `DETERMINISTIC_FAKE_REALITY_PLUS`; Web Share runs only when available. Album remains `PARTIAL` because browser download is not system-album save.

The existing development SQLite schema used globally unique fixture `candidate_id`/`asset_id`. A second real Session exposed that deterministic ids could replace another Session's rows. The bounded fix migrates those two development tables to composite `(session_id, identity)` keys and scopes candidate acceptance updates. A two-Session regression proves both candidates and Capture lineage remain readable.

## M03 Lab integration

Eight profiles are available: `H5_FULL`, `H5_NO_SHARE`, `H5_OFFLINE`, `WECHAT_UNVERIFIED`, `NO_HAPTIC`, `NO_ALBUM`, `CAMERA_UNAVAILABLE`, and `STORAGE_FAILURE`. Twelve versioned adapter scenarios cover online/offline, supported/unsupported Share, unsupported Haptic, valid/invalid upload, storage rollback classification, camera unavailable, WeChat unverified, final download, and partial Album.

Replay remains deterministic and calls the same M02 service path. Trace results add platform, capability, adapter, support level, and result without raw media. The H5 Lab shows the chosen profile and adapter provenance. `STORAGE_FAILURE` visibly classifies StorageAdapter as `UNSUPPORTED` while deterministic M03 workflow replay remains `MATCH`; typed platform-scenario evaluation retains the governed error evidence.

## Automated acceptance

```text
Backend pytest = 70 passed / 70
Frontend platform tests = 5 passed / 5
Frontend TypeScript = PASS
M03 scenario matrix = PASS
M03 deterministic core = PASS / unexpected semantic diff 0
M02 S01 = PASS
Partial retake = PASS
Multipart validation/security matrix = PASS
Two-Session candidate/asset isolation = PASS
WeChat build = PASS
H5 build = PASS_WITH_WARNING
git diff --check = PASS
```

H5 retained the known non-blocking entrypoint advisory. Bundle evidence:

```text
H5 entry before M04 = 307814 bytes
H5 entry after M04 = 309635 bytes (+1821)
M04 product page chunk = 125782 bytes
M03+M04 Lab lazy chunk JS+CSS = 63587 bytes
Largest emitted file = js/app.js / 217514 bytes
```

The entry increase is 1821 bytes and does not materially worsen the retained advisory. Platform and Lab UI remain route chunks.

## Real browser evidence

The default H5 build showed `LAB_DISABLED` with zero console errors. A fresh Session then traversed P01–P13 against real FastAPI/SQLite. At CAPTURE, the browser file chooser selected the deterministic repository scene fixture and emitted an actual `POST /assets/uploads` multipart request with HTTP 201. Evidence was:

```text
mime = image/png
size = 205022 bytes
sha256 = 1994a43894666a6f0e7f76b612c41c80399e43ccb6a10b5467ed6a839d374cf0
workflow = FINAL / revision 11
assets = 3
events = 12
lineage = Uploaded Binary → CaptureAsset → RealityPlusAsset → MyFinalPhoto
download event = PASS
ShareAdapter branch = PASS
refresh/readback = PASS
uncaught console errors = 0
```

A second browser Session uploaded the same deterministic image, selected `RETAKE_MICRO`, returned QA → LIVE at revision 9, retained one Capture asset, and showed no console errors. Lab browser regression ran Happy to FINAL/MATCH and ran the `STORAGE_FAILURE` platform profile with visible adapter status and zero console errors.

The first browser upload attempt exposed a Taro H5 `uploadFile` incompatibility with the browser File object. The Session remained at CAPTURE revision 7 with zero assets. The bounded adapter fix uses H5 `FormData` with the original browser File while keeping the Taro upload facade for WeChat. The rerun passed. This negative/resolved evidence is retained.

## Security, privacy, and boundaries

```text
Provider Calls = 0
Provider Credentials Used = 0
Secrets Committed = 0
Raw Live Video Upload = 0
Arbitrary File Read = 0
Arbitrary File Write Outside Root = 0
Path Traversal = BLOCKED
Production Payment = 0
Production Auth Provider = 0
Production Object Storage = NOT_LOCKED
Production DB = NOT_LOCKED
Real User Media Required For Automated Tests = NO
H5 Camera Real Device = UNVERIFIED_REAL_DEVICE
WeChat Real Device = UNVERIFIED_REAL_DEVICE
M01 Contracts = PRESERVED
Platform Catalog = PRESERVED
M02 = PRESERVED
M03 = PRESERVED
LIVE = UNTOUCHED
CH-003 = IDENTIFIED / UNCHANGED
MAIN = UNCHANGED
M04 = PASS
FEATURE COMMITS = 4c493882cfb8663a7c7b8f43acf2100fa92df457, 2ee655db30a49ae3f80eeea0c4c426c47d5d5c92, 95df89afd1834397d27ab552273d13195eb3901d
REMOTE FEATURE BRANCH = PASS
DEVELOP BEFORE MERGE = 68afacb7b9900f27fc99b75a63ef68724177f0d1
DEVELOP FEATURE HEAD AFTER STRICT-FF = 95df89afd1834397d27ab552273d13195eb3901d
AUTO FF MERGE = PASS
NEXT = XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01
START_NEXT_TASK = NO
```
