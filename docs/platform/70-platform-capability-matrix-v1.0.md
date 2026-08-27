# Platform Capability Matrix V1.0

Status: `ACTIVE_M04_IMPLEMENTATION_EVIDENCE`

This matrix records implementation and acceptance evidence for the locked M01 platform catalog. It does not change `packages/platform/catalog.json`. `SUPPORTED` means the named behavior was exercised at the stated platform boundary; compilation alone is recorded as `UNVERIFIED_REAL_DEVICE`.

| Capability | H5 | WeChat | Future Douyin | Evidence | Fallback / next gate |
|---|---|---|---|---|---|
| CameraAdapter | HARNESS_SUPPORTED / PRODUCT_COMPOSITION_FIDELITY_UNSUPPORTED — OPPO K11 / ColorOS 15.0 / Chrome 138.0.7204.168 | UNVERIFIED_PRODUCT_PLATFORM_CANDIDATE | UNVERIFIED_PRODUCT_PLATFORM_CANDIDATE | M05 proved permission/lifecycle/capture API behavior; later bounded evidence proved native still, transport and persistence PASS but Preview-to-native-still mapping UNSUPPORTED | H5 remains a development harness; WeChat and Douyin require independent adapter and real-device fidelity acceptance |
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
- The later final H5 disposition supersedes any interpretation of M05 as product-level composition fidelity: OPPO native capture quality, transport and persistence pass, while Preview-to-native-still fidelity and the H5 product Camera path are `UNSUPPORTED`.
- H5 Album is download-only and remains `PARTIAL`.
- Reality+ output remains deterministic fake; no provider was called.
- Live/CV evidence remains isolated in the independent Live worktree and is not imported here.
