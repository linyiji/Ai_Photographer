# Real User Golden Flow V1.0

**Task:** `XFX_M05_REAL_ASSET_CAPTURE_AND_USER_GOLDEN_FLOW_01`  
**Status:** Implementation Gate PASS / Real Device Gate pending  
**Authority relationship:** extends the current Golden Flow; it does not replace M01 Workflow V1.

## Product runtime truth

The product has three explicit modes: `DEVELOPMENT`, `INTERNAL_DEMO`, and `PRODUCTION`. A central `ProductRuntimeReadiness` projection is the only product-level source for readiness disclosure.

| Capability | Current implementation | Public production meaning |
|---|---|---|
| Workflow / session persistence | REAL | Ready at current development scale |
| Asset storage | REAL | Development-only; production object storage not locked |
| Camera / still capture | EXPERIMENTAL | Requires the M05 real-device gate |
| Reality / Target / Shot / Live / QA | FAKE_INTERNAL_ONLY | Never marketed as real AI |
| Reality+ / Fine Tune | FAKE_INTERNAL_ONLY | Never marketed as a real provider result |
| Final readback / download / share | REAL / PARTIAL | Download is real; share depends on runtime support |

`PUBLIC_PRODUCTION_READY = false`. Production must block session creation while any fake intelligence would otherwise appear to be real. Internal Demo may run only with a subtle disclosure marker.

## P09 real capture contract

Camera is the primary action; device import is always retained as a fallback.

1. Camera permission is requested only after an explicit user action.
2. H5 opens a live preview, supports close and front/rear switching when the browser/device supports them, and creates a still locally.
3. WeChat uses its governed Taro camera chooser until a native preview runtime is accepted.
4. Camera stills and imported images become a local candidate first.
5. The candidate screen presents exactly two decisions: `重拍` and `使用这张`.
6. `重拍` discards only the local candidate. It does not call the upload API and does not advance Workflow V1.
7. `使用这张` checks network state, uploads multipart once, then sends `CREATE_CAPTURE` with the accepted uploaded asset id.
8. The confirm action is disabled while busy and uses a stable candidate-scoped idempotency key. A retry after upload reuses the accepted asset id.

No raw video is uploaded. No unconfirmed still is uploaded. Browser camera streams stop on close, capture, navigation, unload, or component disposal.

## Orientation and privacy

H5 camera stills are rendered through a canvas in the preview's native dimensions. This normalizes visible orientation and creates a new JPEG without copying source EXIF metadata. Imported images retain their original bytes in development storage; therefore the product must not claim that imported EXIF or GPS has been stripped. UI and API projections do not expose GPS. A production privacy pipeline must explicitly define metadata removal before `PUBLIC_PRODUCTION_READY` can become true.

## Resume and My Works

The backend session list is truth. It projects only session id, timestamps, Workflow stage, `ACTIVE/COMPLETED`, thumbnail asset id, and final asset id. Browser storage may remember the last id for convenience but never decides stage or completion.

- Home offers `继续上次拍摄` and `开始新的拍摄`; it never silently resumes a stale session.
- Multiple active sessions remain individually selectable.
- Refresh after Target, Capture, QA, or Final returns to Home and offers the corresponding backend stage.
- My Works is composed from completed backend sessions and opens the persisted final asset.
- Final provides download, capability-dependent share, start-new, and return-to-works actions.

## Failure and safe-exit behavior

User-facing copy translates permission denial, unsupported camera, cancellation, offline state, invalid asset, upload/storage failure, and unsupported share. Machine error codes remain developer evidence, not the primary product message. Offline/upload failure preserves the local candidate for retry. Share failure leaves download available. `稍后继续` stops camera resources and returns without abandoning backend truth.

## Acceptance boundary

Automated and desktop acceptance may prove state, network, upload, persistence, and fallback behavior. Only the real-device checklist in `docs/platform/72-h5-camera-and-capture-user-acceptance-v1.0.md` can promote the M05 Real Device Gate. Until that evidence is signed:

```text
INTERNAL_USER_GOLDEN_FLOW_READY = NO
M05_FINAL_GATE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```
