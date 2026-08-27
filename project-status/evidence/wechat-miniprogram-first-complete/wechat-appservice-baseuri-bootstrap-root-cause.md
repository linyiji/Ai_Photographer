# WeChat AppService `baseURI` Bootstrap Root Cause

## Scope

```text
TASK_ID = XFX_MAIN_WECHAT_DEVTOOLS_APPSERVICE_BASEURI_BOOTSTRAP_BOUNDED_REMEDIATION_02B
Branch = feature/wechat-miniprogram-first-complete-product-baseline
Admission head = eb5f8549f2603dad45bc1d03607983115e0f9f73
WeChat Developer Tools = 2.02.0
Observed base library = 3.17.2 / GRAY RELEASE
```

The imported WeChat project previously failed during AppService startup with `TypeError: Cannot read properties of undefined (reading 'baseURI')`. The later `pages/index/index has not been registered yet` message was a downstream symptom.

## Generated failure evidence

The pre-fix WeChat output contained Webpack base-URI initialization equivalent to:

```js
__webpack_require__.b = document.baseURI || self.location.href
```

The page graph also contained the Webpack-generated worker URL construction originating from the H5 Fine Tune runtime:

```js
new Worker(new URL(__webpack_require__.p + __webpack_require__.u(939), __webpack_require__.b), ...)
```

Source ownership traced to `apps/client/src/fineTune/runtime.ts`, where the H5 renderer creates `new Worker(new URL('./final.worker.ts', import.meta.url), ...)`. `FineTuneEditor.tsx` previously imported both the H5 and WeChat implementations at module top level and selected one only after both had entered the bundle. The H5-only root-cause diagnostic page independently imported another browser Worker, so that page also had to receive a WeApp-specific compile-time entry.

```text
BASEURI_RUNTIME_OWNER = WEBPACK
BASEURI_TRIGGER = MULTIPLE
Primary trigger family = WORKER_URL + H5_ADAPTER eager import
H5_FINE_TUNE_WORKER_IN_WEAPP_GRAPH (before) = YES
```

No application source directly imports `react-dom`. The generated `taro.js` framework chunk contains ReactDOM renderer compatibility code supplied by the accepted Taro React framework. It was not the source of `RuntimeGlobals.baseURI` and did not contain the failing base-URI expression.

```text
REACT_DOM_IN_WEAPP_BOOTSTRAP = YES / TARO_FRAMEWORK_RUNTIME / NOT_BASEURI_TRIGGER
WEAPP_BUILD_TARGET_CONFIG = VALID
BASE_LIBRARY_CONTROL = NOT_EXERCISED
```

## Bounded remediation

- Added compile-time platform runtime providers: H5/default selects `MainFineTuneRuntime`; WeApp selects `WeChatFineTuneRuntime`.
- Added a WeApp-specific diagnostic component so the H5-only Worker diagnostic is excluded from the AppService dependency graph.
- Preserved the H5 Worker renderer and shared Fine Tune contracts/business logic.
- Separated output roots to `dist/weapp` and `dist/h5`.
- Updated `project.config.json` `miniprogramRoot` to `dist/weapp/`.
- Did not patch generated output and did not add global DOM shims.

## Fresh verification

```text
TypeScript = PASS
Frontend tests = 87 / 87 PASS
WeChat build = PASS_WITH_WARNING
H5 build = PASS_WITH_WARNING
WeChat output = apps/client/dist/weapp
H5 output = apps/client/dist/h5
WeChat app.json/app.js/pages = PRESENT
WeChat index.html = ABSENT
H5 index.html = PRESENT
H5 app.json = ABSENT
H5_WECHAT_OUTPUT_COLLISION = RESOLVED
```

Warnings are limited to the pre-existing oversized landmark asset and bundle/chunk size. After both builds, recursive inspection of `dist/weapp` found no `document.baseURI`, `self.location.href`, `new Worker`, or `new URL(...)`. The H5 output still contains the intended Worker implementation.

## DevTools boot gate

The official CLI was discovered, but its service port is disabled; no security setting was changed automatically. The official IDE was launched and the Owner compiled the fresh `dist/weapp` output in WeChat Developer Tools. The Owner reported:

```text
AppService startup exception = 0
pages/index/index registered = YES
Home rendered = PASS
baseURI errors = 0
fatal console errors = 0
WECHAT_APPSERVICE_BOOTSTRAP = PASS
WECHAT_DEVTOOLS_GATE = PASS
```

The corrected bundle passes on the observed `3.17.2 / GRAY RELEASE` base library. A stable-vs-gray control was therefore not required to conceal or bypass the source defect and remains `NOT_EXERCISED`.
