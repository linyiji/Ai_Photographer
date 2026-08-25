# Platform Capability Matrix V1.0

Status: `ACTIVE_M04_IMPLEMENTATION_EVIDENCE`

This matrix records implementation and acceptance evidence for the locked M01 platform catalog. It does not change `packages/platform/catalog.json`. `SUPPORTED` means the named behavior was exercised at the stated platform boundary; compilation alone is recorded as `UNVERIFIED_REAL_DEVICE`.

| Capability | H5 | WeChat | Future Douyin | Evidence | Fallback / next gate |
|---|---|---|---|---|---|
| CameraAdapter | SUPPORTED_TESTED_SCOPE — OPPO K11 / ColorOS 15.0 / Chrome 138.0.7204.168 | UNVERIFIED_REAL_DEVICE | DEFERRED | M05 trusted-HTTPS user-operated gate: permission timing, rear/front/switch, close/reopen, still capture, local retake, import fallback, orientation, resume, and full flow PASS | Evidence is one tested H5 device/browser only; do not generalize to Android/iOS/WeChat/Douyin |
| FrameAdapter | UNSUPPORTED | UNSUPPORTED | DEFERRED | No frame stream or CV imported | Future separately accepted Physical Agent adapter |
| AlbumAdapter | PARTIAL | UNVERIFIED_REAL_DEVICE | DEFERRED | H5 real download passes; no claim of system album save | Show PARTIAL; device album acceptance later |
| ShareAdapter | PARTIAL | UNVERIFIED_REAL_DEVICE | DEFERRED | Web Share runs when available and returns controlled unsupported otherwise | Final download remains available |
| HapticAdapter | PARTIAL | UNVERIFIED_REAL_DEVICE | DEFERRED | Semantic `SUCCESS/WARNING/CAPTURE/READY` cues through Taro; unsupported is controlled | No-op with governed result |
| VoiceOutputAdapter | PARTIAL | UNSUPPORTED | DEFERRED | Optional H5 speech-synthesis seam only | Fake guidance remains selected; no ASR/VAD/Voice Track |
| AuthAdapter | UNSUPPORTED | UNSUPPORTED | DEFERRED | External auth is not configured | Local anonymous development session |
| PaymentAdapter | UNSUPPORTED | UNSUPPORTED | DEFERRED | Production payment calls = 0 | `NOT_CONFIGURED` |
| DeviceMotionAdapter | PARTIAL | UNSUPPORTED | DEFERRED | H5 support/permission shell only | No product dependence in M04 |
| StorageAdapter | SUPPORTED | UNVERIFIED_REAL_DEVICE | DEFERRED | 20 MiB bounded multipart upload, SHA256 metadata, isolated local root, read/download and E2E | Production object storage remains `NOT_LOCKED` |
| NetworkAdapter | SUPPORTED | UNVERIFIED_REAL_DEVICE | DEFERRED | H5 online/offline query and controlled error; Taro WeChat facade compiles | No uncontrolled retry |

## Runtime profiles

M03 Lab provides deterministic `H5_FULL`, `H5_NO_SHARE`, `H5_OFFLINE`, `WECHAT_UNVERIFIED`, `NO_HAPTIC`, `NO_ALBUM`, `CAMERA_UNAVAILABLE`, and `STORAGE_FAILURE` profiles. These profiles are test tooling only and cannot enable production fault injection.

## Evidence limits

- WeChat compilation is not real-device acceptance.
- H5 Camera real-device acceptance is limited to OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.7204.168 under the M05 trusted-HTTPS evidence. It does not prove other H5 devices or embedded mini-program webviews.
- H5 Album is download-only and remains `PARTIAL`.
- Reality+ output remains deterministic fake; no provider was called.
- Live/CV evidence remains isolated in the independent Live worktree and is not imported here.
