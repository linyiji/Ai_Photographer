# Camera Geometry Inventory

```text
Parent Task = XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01
Amendment = XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_FINE_TUNE_ROOT_CAUSE_DIAGNOSTIC_AMENDMENT_01
Status = PASS / OPPO DEVICE INVENTORY CAPTURED
Production behavior changed = NO
```

The DEV-only inventory captures user agent, screen/DPR/orientation, track label/state, `getSettings()`, `getConstraints()`, exposed `getCapabilities()`, video intrinsic and CSS/client geometry, container geometry, ImageCapture capability data, and exposed video-input devices.

Previously confirmed device facts:

```text
Stream = 1080×1920 @ 30fps / environment
Stream aspect = 0.5625 (9:16 portrait)
Native still = 3072×4096 JPEG / 7,926,073 bytes
Native still aspect = 0.75 (3:4 portrait)
ImageCapture = available / DEVICE_NATIVE
Preview FPS = 29.8
```

OPPO inventory captured from user-operated screenshot `bc92077e0d0898d064b3c86bfe3e9d04.jpg`:

```text
User agent = Android 10 / Chrome 138.0.7204.168
Screen = 360×804 CSS px / DPR 3 / portrait-primary
Track label = camera2 0, facing back
Track state = live
Track settings = 1080×1920 @30fps / aspect 0.5625 / environment / zoom 1
Track resizeMode = none
Constraints = environment / 1080×1920 / 30fps
Zoom capability = min 1 / max 10 / step 0.1 / current 1
Video intrinsic = 1080×1920
Computed object-fit = contain on the diagnostic host after capture inventory
Preview container = 320.9375×192 / aspect 1.671549...
Current production-style cover projection = 320.9375×570.5556
Cover offset = x 0 / y -189.2778
Cover crop = top 189.2778 / bottom 189.2778 / left 0 / right 0
Visible source rect = x0 0 / y0 0.3317429406037001 / x1 1 / y1 0.6682570593963
Centered 3:4 rect = x0 0 / y0 0.125 / x1 1 / y1 0.875
ImageCapture = available
Photo capability = width up to 4096 / height up to 3072 (reported axes)
Exposed devices = camera2 1, facing front; camera2 0, facing back
```

The current track uses the exposed back-camera device at `zoom=1`. The browser exposes only front/back labels; it does not expose evidence identifying an alternative rear physical lens. Therefore digital zoom and physical-lens switching are not supported as the cause by this run.

The deterministic geometry calculator and 9:16→viewport / centered 3:4 tests pass.
