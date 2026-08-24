# LIVE-P0 Automated Camera Sandbox Evidence

**Task:** `XFX_LIVE_PHYSICAL_AGENT_MVP_SPIKE_01`

**Profile / Mode:** `REALTIME_CAMERA_CV / CAMERA_PIPELINE`

**Evidence date:** `2026-08-24`
**Scope:** Automated desktop validation only; no real-device claim.

## Environment

```text
OS class = Windows desktop
Node = v24.18.0
npm = 11.6.2
Runtime = Vite 8.2.2 + TypeScript 5.9.3 + Vanilla TS
Raw Video Upload = 0
Captured personal camera frames = 0
```

## Automated commands

| Gate | Command / observation | Result |
|---|---|---|
| Fresh lock reproduction | `npm ci` | PASS |
| Dependency tree | `npm ls --depth=0` | PASS |
| TypeScript | `npm run typecheck` | PASS |
| Production build | `npm run build` | PASS |
| Diff whitespace | `git diff --check` | PASS |

Build output observation:

```text
vite v8.2.2
5 modules transformed
dist/index.html = 3.77 kB (gzip 1.54 kB)
dist/assets/index-Du5ml01D.css = 5.67 kB (gzip 1.94 kB)
dist/assets/index-W8onHG4Y.js = 7.29 kB (gzip 3.43 kB)
```

`dist/` and `node_modules/` are ignored and are not evidence artifacts committed to Git.

## Browser smoke

Browser-level smoke used the desktop in-app browser against the local Vite server. The “启动相机” button was deliberately not clicked, so no camera permission was accepted and no camera stream was opened.

| Assertion | Observation | Result |
|---|---|---|
| Page loads | Title `XFX Camera Sandbox · LIVE-P0` | PASS |
| No pre-action camera access | `video.srcObject = null` | PASS |
| Initial state is explicit | message `未发生摄像头访问。` | PASS |
| HUD renders | visible on load | PASS |
| HUD hide/show | hidden then restored through UI buttons | PASS |
| Coordinate labels | Sensor / Preview / User-Action visible | PASS |
| No raw upload claim | footer contains `Raw Video Upload = 0` | PASS |
| Unsupported path | `?simulateUnsupported=1` shows `UNSUPPORTED` and visible error message | PASS |
| Unsupported path camera access | `video.srcObject = null` | PASS |
| Startup console exceptions | no error-level browser log | PASS |

The first browser attempt used a localhost-only binding not reachable through the browser isolation boundary. The same Vite server was rebound to `0.0.0.0`, after which `127.0.0.1:5173` smoke passed. This was a desktop test transport correction; no application logic or browser security setting was weakened.

## Real-device boundary

```text
Preview FPS = NOT_TESTED
Front camera = NOT_TESTED_ON_REAL_DEVICE
Rear camera = NOT_TESTED_ON_REAL_DEVICE
Camera switching = NOT_TESTED_ON_REAL_DEVICE
Mirror/action-direction sanity = NOT_TESTED_ON_REAL_DEVICE
Orientation = NOT_TESTED_ON_REAL_DEVICE
Real Device Gate = MANUAL_REVIEW_REQUIRED
LIVE-P0 Final Gate = NOT_YET_PASS
```

Build and desktop-browser results prove implementation readiness only. They do not prove Camera/CV feasibility and do not resolve CH-003.
