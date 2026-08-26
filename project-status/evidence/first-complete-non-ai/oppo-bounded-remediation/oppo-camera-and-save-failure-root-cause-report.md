# OPPO Camera Geometry and Save Failure — Root Cause Report

```text
Parent Task = XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01
Evidence Date = 2026-08-26
Device = OPPO K11 / Chrome Mobile
Evidence Type = REAL_DEVICE / USER_OPERATED
Report Scope = ROOT_CAUSE_CLASSIFICATION_ONLY
Product Fix Applied In This Report = NO
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
```

## 1. Executive decision

The rerun reproduces two independent blocking failures.

1. Camera composition remains unreliable because the live video and the native still are two different geometry/FOV pipelines. OPPO Chrome returned a landscape `1920×1440` video track even though the request preferred portrait 3:4. The application then presented a centered portrait 3:4 window using only `56.25%` of that video's width. `ImageCapture.takePhoto()` subsequently returned a separate portrait `3072×4096` device-native JPEG whose field of view does not match that centered video crop. The result is a visibly magnified preview and a materially different captured composition.
2. Capture confirmation did not reach backend storage. The 7.7–8.8 MB multipart upload was canceled while crossing the Cloudflare Quick Tunnel. Four `/assets/uploads` requests ended at the tunnel with `Incoming request ended abruptly: context canceled`; FastAPI received no corresponding upload POST and persisted no asset.

These are blocking failures. The run cannot be classified as Camera fidelity PASS, Capture persistence PASS, OPPO Main PASS, or First Complete Non-AI Baseline PASS.

## 2. Evidence admission

The phone was operated by the user. The screenshots are external evidence only; no real photo binary is copied into the repository.

| File | SHA256 | Material evidence |
|---|---|---|
| `4642f8ebac61753d1bd5bb2970fa0731.jpg` | `20490D299E868D001E78B527A3AF0098AC37F8621AC39E353B5BC143F09FC357` | Device-native JPEG telemetry and visible save failure/retry state. |
| `d9ea8f71cb27249cb5057c5ba39bd275.jpg` | `51E3F2DCFDFAAB6CD29DB285FF4DB9AA96AD4684A94CA729AC7E6409ECB894D7` | Capture review while save remains pending. |
| `43d8487d09bea7c42d036b0fd91fc06c.jpg` | `ED668EEC2273564D7E56A777BE2928075F95CD6075BAD5478604586F33A64A4A` | Repeated pending save on the same candidate. |
| `f54c82d3f5c5c99a0fc8eaf0cad7feb1.jpg` | `21EF3BF2348691D046EB15B30D8424E1D4DA823A14BD105CA36C6363A68C2FFB` | Magnified live preview; track/intrinsic/viewport telemetry. |
| `c77352ea037cb584302ba1e0a49b0a61.jpg` | `8B04EE777D72062583174D3FAE1E57691361C834CE425CD1B0136B8A0F86948E` | Second device-native capture with a composition different from preview. |
| `e0c3656f5a87a18d1d773cc79d2c6942.jpg` | `49AE20ED5B90709F0DE49953AA26D0F98EACD93C7ED146CE9A01FE4980843D7F` | Same second capture and telemetry. |
| `06c0a1023e65c790ffcbd574d8ce81b8.jpg` | `E445F369FD30114AE0B52CED4CE1DCCA681A7DFB3F241EC939927E1CB95315EA` | Magnified live preview at 28.8fps. |
| `0593cbde3ef270754eece88be108b2f6.jpg` | `41E1EE7F2DEA9C01061EB2993ABEDE55519ECF4FD4BD678EB5894A6CE84B2613` | Third native still, `3072×4096`, 8,838,029 bytes. |
| `cb2dad089b125f0ec346d25e8c6e75da.jpg` | `91A7EB390981292CF7A4C7A5E83574DCC337B74E2CF00ABDEB94FD9A02011EC2` | Same third capture and review geometry. |
| `2032db207584099ec4380490f9db7d78.jpg` | `758A0DAE9AEBB587FDBA49B5EDCAAA339639E02DB13E865D2CA455CA72D7FA22` | Additional magnified live preview and identical geometry telemetry. |

## 3. Camera facts observed on OPPO

```text
Track settings = 1920×1440 @30.0fps / environment
Video intrinsic = 1920×1440
Video aspect = 1.3333 (landscape 4:3)
Requested preferred aspect = 0.75 (portrait 3:4)
Capture viewport = x 0.21875 / y 0 / width 0.5625 / height 1 / aspect 0.75
Camera preview FPS = 28.8–29.3
Capture backend = IMAGE_CAPTURE
Capture quality = DEVICE_NATIVE
Native still = 3072×4096 JPEG
Observed JPEG sizes = 7,768,522 / 8,232,414 / 8,838,029 bytes
Native still preserved = YES
```

The previous 480×640 resolution defect is not present. Resolution and frame rate are not the cause of this run's composition failure.

## 4. Camera geometry calculation

The live track is landscape 4:3 (`1920/1440 = 1.3333`). A portrait 3:4 window has aspect `0.75`. The centered window therefore uses:

```text
visible width fraction = 0.75 / 1.3333 = 0.5625
left crop = right crop = (1 - 0.5625) / 2 = 0.21875
visible video pixels = 1080×1440
discarded horizontal pixels = 420 left + 420 right
apparent scale relative to full video width = 1 / 0.5625 = 1.7778×
```

This mathematically explains the user's “过于放大” observation. It is a center crop of a landscape stream, not proof that the device applied digital zoom.

## 5. Camera root-cause classification

```text
PRIMARY = PREVIEW_STILL_PIPELINE_GEOMETRY_DIVERGENCE
CONTRIBUTOR_1 = OPPO_CHROME_IDEAL_PORTRAIT_CONSTRAINT_NOT_HONORED
CONTRIBUTOR_2 = LANDSCAPE_VIDEO_CENTER_CROPPED_TO_PORTRAIT_3_4
CONTRIBUTOR_3 = APP_ASSUMES_CENTER_VIDEO_CROP_PREDICTS_NATIVE_STILL_FOV
NATIVE_STILL_PIPELINE = IMAGE_CAPTURE / DEVICE_NATIVE / FULL STILL PRESERVED
DIGITAL_ZOOM = NOT_SUPPORTED_BY_CURRENT EVIDENCE
PHYSICAL_REAR_LENS_SWITCH = NOT_CLASSIFIED / NO DEVICE EVIDENCE
LOW_CAPTURE_RESOLUTION = NOT REPRODUCED
```

The application correctly reports that the ideal constraint was not honored and correctly computes a 3:4 rectangle. The defect is the stronger semantic assumption that this rectangle represents the composition of the later device-native still. The real-device A/B proves that assumption false on this OPPO/Chrome path.

## 6. Capture save/upload failure evidence

The user pressed “使用这张” repeatedly. The page displayed:

```text
照片暂时无法保存，请稍后重试。
照片仍保留在本机，可直接重试。
```

At the matching time, the API tunnel recorded four failed requests:

```text
Destination = /assets/uploads
Failure = Incoming request ended abruptly: context canceled
Observed attempts = 4
Payload class = multipart JPEG, approximately 7.7–8.8 MB
```

FastAPI recorded the CORS preflights and ordinary session actions, but no corresponding `POST /assets/uploads`. The local database timestamp remained `2026-08-26 16:09:39`, before the upload attempts around 16:13–16:14. No upload asset was committed.

## 7. Save failure root-cause classification

```text
CONFIRMED FAILURE BOUNDARY = MOBILE_BROWSER_TO_CLOUDFLARE_QUICK_TUNNEL_TRANSPORT
TUNNEL RESULT = REQUEST_CONTEXT_CANCELED_BEFORE_ORIGIN_UPLOAD_HANDLER
FASTAPI UPLOAD HANDLER = NOT REACHED
BACKEND MIME/SIZE VALIDATION FAILURE = NOT OBSERVED
BACKEND DATABASE/STORAGE COMMIT FAILURE = NOT OBSERVED
CAPTURE ASSET CREATED = NO
WORKFLOW ADVANCED AFTER CREATE_CAPTURE = NO
LOCAL CANDIDATE RETAINED = YES
EXACT CANCELLATION INITIATOR = ROOT_CAUSE_UNCLASSIFIED
```

The evidence does not distinguish whether mobile Chrome canceled the request, the mobile connection broke, or the temporary Cloudflare edge canceled it. It does prove that the failure occurred before the origin upload handler, so it must not be reported as a FastAPI or SQLite persistence defect.

“保存照片” in the FINAL screen is a separate browser-download capability. This run never reached FINAL because capture confirmation failed. Therefore final device-download behavior is `NOT_REACHED / NOT_CLASSIFIED` in this evidence and must not be conflated with the failed capture upload.

## 8. Acceptance matrix

| Gate | Result | Basis |
|---|---|---|
| Camera track resolution | PASS | 1920×1440 @30fps. |
| Native still resolution | PASS | 3072×4096, 7.7–8.8 MB. |
| Camera preview FPS | PASS | 28.8–29.3fps. |
| Preview composition fidelity | FAIL | Center-cropped landscape preview does not predict native still FOV. |
| Capture composition fidelity | FAIL | User-visible preview/capture mismatch reproduced. |
| Digital zoom root cause | NOT SUPPORTED | No current evidence of a non-neutral zoom state. |
| Capture upload/save | FAIL | Four tunnel-canceled multipart uploads; origin not reached. |
| Backend persistence | NOT EXERCISED | No upload POST reached FastAPI. |
| Fine Tune device gate | NOT REACHED | Capture confirmation did not complete. |
| Full Main Golden Flow | FAIL | Flow stopped at “使用这张”. |
| OPPO Main Gate | FAIL | Camera fidelity and capture persistence are blocking. |
| First Complete Non-AI Baseline | NOT_YET_PASS | Parent hard gates are incomplete. |

## 9. Scope boundary

This report records root cause only. It does not implement camera changes, alter capture policy, change ImageCapture behavior, change upload/storage code, add a production Mask Provider, or start another task.

