# OPPO Local Loopback Reacceptance Gate 04

Date: 2026-08-26  
Parent: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Previous: `XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_FIDELITY_AND_TRANSPORT_REACCEPTANCE_AMENDMENT_03`

## Admission

```text
Branch = feature/first-complete-non-ai-product-flow
Admission HEAD = c3709282d818628a195b0536ee1eb974146907e4
Admission Remote HEAD = c3709282d818628a195b0536ee1eb974146907e4
Ahead / Behind = 0 / 0
Working Tree = CLEAN
```

## Port and API routing discovery

The repository does not configure a Taro/Webpack development-server port and has no frontend serve script. The existing accepted deterministic H5 acceptance command serves the built `dist` directory on explicit local port `4175`; that is the frontend port for this Gate. FastAPI uses explicit local port `8000`.

```text
FRONTEND_PORT = 4175 / explicit acceptance static server
BACKEND_PORT = 8000 / explicit uvicorn startup
Production/default compiled API base = http://127.0.0.1:8000
ADB acceptance compiled API base = http://localhost:8000
Device frontend origin = http://localhost:4175
Device backend origin = http://localhost:8000
Machine-specific localhost config committed = NO
```

The acceptance API value must be injected only while building the local H5 bundle:

```powershell
$env:XFX_API_BASE = 'http://localhost:8000'
```

## ADB availability

Commands attempted:

```text
adb version
adb devices
where.exe adb
```

Observed result:

```text
adb command = NOT FOUND
ANDROID_HOME = unset
ANDROID_SDK_ROOT = unset
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe = absent
Android Studio platform-tools candidate = absent
Authorized device = NOT_EXERCISED
ADB_LOOPBACK_GATE = MANUAL_REVIEW_REQUIRED
```

No tool was installed automatically and no product code was changed.

## Exact Owner preparation

1. Install Android SDK Platform-Tools from the official Android developer distribution, or add an existing official Platform-Tools directory to the current Windows `PATH`. Do not use an unrelated repackaged binary.
2. On OPPO K11, enable Developer options and USB debugging, connect a data-capable USB cable, and keep the phone unlocked.
3. In a new PowerShell window run:

```powershell
adb version
adb devices
```

4. Approve the RSA USB-debugging prompt on the OPPO. `adb devices` must show one serial with status `device`; `unauthorized`, `offline`, or an empty list is not accepted.
5. Start backend on local port `8000`:

```powershell
Set-Location 'D:\Projects\Ai_Photographer\apps\api'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

6. Build and serve the acceptance H5 bundle on local port `4175`:

```powershell
Set-Location 'D:\Projects\Ai_Photographer\apps\client'
$env:XFX_API_BASE = 'http://localhost:8000'
$env:XFX_PRODUCT_MODE = 'INTERNAL_DEMO'
& 'C:\Users\qi181\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\@tarojs\cli\bin\taro build --type h5
..\api\.venv\Scripts\python.exe -m http.server 4175 --bind 127.0.0.1 --directory dist
```

7. Create and verify the reverse mappings:

```powershell
adb reverse tcp:4175 tcp:4175
adb reverse tcp:8000 tcp:8000
adb reverse --list
```

Expected mappings include `tcp:4175 tcp:4175` and `tcp:8000 tcp:8000` for the authorized device.

8. On OPPO Chrome open `http://localhost:4175`, then verify in the device page:

```javascript
window.location.origin
window.isSecureContext
Boolean(navigator.mediaDevices)
typeof navigator.mediaDevices?.getUserMedia
```

Required result:

```text
origin = http://localhost:4175
isSecureContext = true
mediaDevices = true
getUserMedia = function
camera permission = succeeds after explicit user action
```

If any secure-context requirement fails, ADB loopback is rejected and the remaining route is an Owner-authorized stable trusted HTTPS ingress.

9. Only after the secure-context check passes, execute the approximately 7 MiB and 9 MiB transport pre-flight, three OPPO Preview-vs-Review A/B cases, native 7–9 MB upload, controlled retry, Fine Tune, FINAL save, My Works/readback, and full Golden Flow required by Gate 04.
10. After the Gate, clean up without touching other devices or repositories:

```powershell
adb reverse --remove tcp:4175
adb reverse --remove tcp:8000
```

Stop the two local service processes normally.

## Unexercised real-device gates

Because ADB is unavailable, no OPPO origin or Camera API claim can be made:

```text
ADB reverse map = NOT_CREATED
Device origin = NOT_EXERCISED
window.isSecureContext = NOT_EXERCISED
Camera API availability = NOT_EXERCISED
3 OPPO Camera A/B cases = NOT_EXERCISED
Remaining camera root cause = UNKNOWN
Alignment mode = UNSUPPORTED
Local loopback transport = NOT_EXERCISED
7–9 MB device upload = NOT_EXERCISED
Origin reachability = NOT_EXERCISED
CaptureAsset = NOT_REACHED
Retry = NOT_EXERCISED
Idempotency = NOT_EXERCISED
Fine Tune = NOT_REACHED
Final device save = NOT_REACHED
My Works / readback = NOT_REACHED
Full Golden Flow = FAIL / NOT_RERUN
OPPO_MAIN_GATE = FAIL
FIRST_COMPLETE_NON_AI_PRODUCT_BASELINE = NOT_YET_PASS
PUBLIC_PRODUCTION_READY = NO
```

Accepted automated `CAMERA_GEOMETRY`, `NATIVE_STILL`, and `BACKEND_PERSISTENCE` results remain unchanged. No speculative Camera implementation fix was made.
