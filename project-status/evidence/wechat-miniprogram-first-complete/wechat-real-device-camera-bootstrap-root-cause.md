# WeChat real-device camera bootstrap root cause

Task: `XFX_MAIN_WECHAT_REAL_DEVICE_CAMERA_BOOTSTRAP_ROOT_CAUSE_AND_BOUNDED_FIX_03A`

## Accepted device evidence

- Device: OPPO / Android 35
- WeChat: 8.0.74
- Base library: 3.17.2 gray
- Mini Program boot: PASS
- Home render: PASS
- Failure visible after the Owner taps the shooting entry: `暂时无法完成操作，当前进度已保留，请重试。`
- wxapplib advertising optimization `operateWXData:fail invalid scope` and backgroundFetch privacy warnings: present, but not emitted by the application Camera path and not accepted as the root cause.

## First failing boundary

The Home shooting handler calls `api.create()` before it changes the in-page surface to `FLOW`, before the workflow reaches `CAPTURE`, and before the Taro `Camera` component can render. The fresh WeChat build's `common.js` contains `API_BASE = http://127.0.0.1:8000`; therefore its `POST /sessions` request targets the phone's own loopback address on a real device. No backend is running on the phone.

This is a deterministic test-topology failure:

```text
START_SHOOTING_CLICK       reached
SESSION_CREATE_REQUEST    issued to http://127.0.0.1:8000/sessions
SESSION_CREATE_RESULT     fail (real-device loopback/backend unreachable)
FLOW surface transition  not reached
Camera component render  not reached
scope.camera              not reached
Camera init callback      not reached
```

Primary classification: `NETWORK_PREREQUISITE`.

Camera boot blocker: `SESSION_NETWORK_PREREQUISITE`.

This is not a Camera permission failure. The current product contract uses Session as shared workflow authority, so this bounded task does not bypass Session creation or create an offline shadow Session.

## Bounded diagnostics and error handling

The INTERNAL_DEMO build now emits `[XFX_CAMERA_BOOTSTRAP]` console events and displays a small acceptance HUD for:

- `START_SHOOTING_CLICK`
- `SESSION_CREATE_REQUEST` / `SESSION_CREATED` / `SESSION_CREATE_FAILED`
- in-page `NAVIGATION_REQUEST`, `SHOOT_PAGE_ON_LOAD`, and `SHOOT_PAGE_ON_SHOW`
- `WECHAT_CAMERA_ADAPTER_CREATE`
- `CAMERA_COMPONENT_RENDER_REQUESTED`
- `CAMERA_PERMISSION_STATE` from `Taro.getSetting()` and `scope.camera`
- `CAMERA_INIT_DONE`
- `CAMERA_ERROR`
- `CAMERA_STOP`

Transport rejections are normalized as `NETWORK_UNAVAILABLE` while preserving the bounded native `errMsg` in console/HUD evidence. The Camera error callback now preserves native `errMsg`/`errCode` evidence and distinguishes authorization wording from other native initialization failures; it no longer maps every Camera callback to permission denial.

## WeChat Camera implementation audit

- Active platform selection: `Taro.getEnv() === WEAPP` resolves to `WECHAT`.
- Product Camera adapter: `WeChatCameraAdapter`.
- Product render path: Taro `Camera`, compiled through the Taro base template to one native `<camera>` element.
- Fresh generated native Camera template count: 1.
- The Camera has a non-zero `cameraViewportSurface` (`height: min(68vh, 820px)`) and fills that surface.
- `navigator.mediaDevices`, `getUserMedia`, `ImageCapture`, and `H5StillCamera.open()` are confined to the H5 dispatch branch and are not selected on WEAPP.

Result: `WEAPP_CAMERA_IMPLEMENTATION = WECHAT_NATIVE_CAMERA`.

## Permission and privacy audit

The application does not explicitly call `authorize({scope: 'scope.camera'})`; it relies on the native Camera component to initiate the authorization flow and now samples `getSetting().authSetting['scope.camera']` immediately before render. In the supplied failing run, that code and the Camera callback were not reached, so the real-device permission state and privacy gate remain `NOT_REACHED`.

The source has no backgroundFetch feature or application call corresponding to the observed backgroundFetch privacy warning. No Camera-specific privacy error, Camera binderror, or AppID capability error was supplied. Consequently neither `WECHAT_PRIVACY_AUTHORIZATION` nor `APPID_CAPABILITY` is classified.

## Bounded remediation required for revalidation

The functional topology fix is configuration, not Camera architecture:

1. Provide an Owner-authorized stable HTTPS backend origin that is reachable from the OPPO device and permitted by the Mini Program request/upload domain policy.
2. Build only the WeChat artifact with that origin injected, for example:

   ```powershell
   $env:XFX_API_BASE = 'https://<OWNER_AUTHORIZED_STABLE_API_HOST>'
   npm run build:weapp
   ```

3. Import/recompile `D:\Projects\Ai_Photographer\apps\client\dist\weapp` and repeat the shooting-entry test.
4. Capture the HUD/console through `SESSION_CREATED`, `SHOOT_PAGE_ON_LOAD`, `CAMERA_PERMISSION_STATE`, and `CAMERA_INIT_DONE` before resuming preview/capture fidelity cases.

No authorized HTTPS host was supplied to this task, so a legally reachable real-device artifact cannot be fabricated or committed. The default local-loopback build remains appropriate only for workstation-local development.

## Regression

- Frontend tests: PASS, 87/87
- TypeScript: PASS
- WeChat production build: PASS with existing asset-size advisory
- WeChat artifact: `app.json`, `app.js`, and `pages/` present
- H5 production build/regression: PASS with existing bundle/asset-size advisories
- Output isolation: preserved (`dist/weapp`, `dist/h5`)
- Provider calls: 0
- Luna calls: 0
- Raw video uploads: 0
- Frame stream uploads: 0

## Revalidation state

Camera preview cannot be marked PASS until an authorized backend build reaches Session creation and the Owner observes both native Camera init-done and a visible preview. Base-library gray-versus-stable control is not relevant until the first failing network boundary is cleared.
