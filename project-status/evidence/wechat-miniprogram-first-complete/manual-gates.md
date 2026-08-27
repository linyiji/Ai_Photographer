# Pending Owner Gates

Status: `MANUAL_REVIEW_REQUIRED`

Owner prerequisites:

1. Provide or select an authorized WeChat Mini Program AppID and configure the existing backend request/upload domains in WeChat administration.
2. Install/open WeChat Developer Tools and import `D:\Projects\Ai_Photographer\apps\client\dist` without changing product code or contract authority.
3. In Developer Tools verify Home/Works/Mine navigation; LIVE, REFERENCE, and RECOMMENDED_METHOD session entry; Camera component readiness/failure handling; reference selection; session creation; authorized network; Fine Tune; Final; and My Works.
4. Preview on OPPO K11 in WeChat and run rear, front, rear→front→rear, close/reopen, and refresh/reopen.
5. Capture stationary CENTER, EDGE, and ENVIRONMENT cases. Compare Preview and native Capture and record dimensions, orientation, crop/FOV, and material match. Any material mismatch fails composition fidelity.
6. For LIVE, REFERENCE, and RECOMMENDED_METHOD, verify one PhotographySession, correct initial input, no accidental duplicate, and supported refresh/readback.
7. Complete Home→Camera→Capture→Use Photo→CaptureAsset→QA→Reality+→Fine Tune→Finalize→MyFinalPhoto→My Works→Save. Verify Reference and Recommended Method converge on the same flow.
8. Verify Fine Tune negative/zero/positive adjustment, local region touch, undo/redo/reset, finalize quality, derived upload, and resume.
9. Verify save-to-album permission/denial/retry and share support/fallback; record black screen, crash, and stuck counts.

Required promotion evidence:

```text
WECHAT_DEVTOOLS_GATE = PASS
WECHAT_REAL_DEVICE_NETWORK_GATE = PASS
WECHAT_CAMERA_LIFECYCLE = PASS
WECHAT_CAMERA_COMPOSITION_FIDELITY = PASS
WECHAT_CAPTURE = PASS
CAPTURE_PERSISTENCE = PASS
LOCAL_REGION = PASS or accepted PASS_WITH_WARNING
FINALIZE = PASS
MY_WORKS = PASS
SAVE_TO_ALBUM = PASS
SHARE = PASS or accepted PASS_WITH_WARNING
FULL_WECHAT_GOLDEN_FLOW = PASS
```
