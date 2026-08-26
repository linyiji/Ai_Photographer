# OPPO K11 Real-Device Gate

Status: **DEVICE ATTEMPT IN PROGRESS — PRE-FIX QUICK FAILED KEYFRAME GATE**.

On 2026-08-26 the execution host had no `adb` executable and Windows present-device enumeration found no OPPO, K11, Android, or ADB device. Therefore no trusted HTTPS device session, Camera preview, device orientation, QUICK/WIDE sweep, black-screen/crash check, or qualitative user check could be performed.

No desktop fixture or synthetic orientation is represented as OPPO evidence. P0 cannot receive `ACTIVE_ACCEPTED_P0` until a fresh OPPO K11 / ColorOS 15 / Chrome Mobile run supplies the required scalar evidence.

## Continuation chronology — first user-operated attempt

The accepted no-ADB path was established using the production H5 build and a trusted Cloudflare HTTPS Quick Tunnel. The tester confirmed OPPO K11 / ColorOS 15 / Chrome Mobile, Camera permission success, visible rear preview, continuous phone rotation, understandable completion, and understandable automatic-keyframe concept. Live-track evidence identifies the browser as the then-latest Chrome Mobile release; its exact version was not recorded and is not invented here.

The two supplied `sweep-1787712398513` downloads were byte-equivalent copies of one real device QUICK manifest. The supplied FULL manifest was `CONTROLLED_FIXTURE` and is explicitly excluded from device acceptance.

Pre-fix real QUICK scalar result:

- source: `DEVICE_ORIENTATION`; posture: `PORTRAIT_PRIMARY`
- duration: 10,561 ms
- coverage: 111.8°; direction: `MIXED`; status: `COMPLETE`
- manifest Camera dimensions: 160×284 (incorrectly represented evaluation-canvas size)
- selected keyframes: 0
- rejection counts: blur 69; under/overexposure 0; duplicate 0; busy 0
- raw video/frame/third-party upload: 0; provider/backend/Luna: 0
- product defect: after completion, the single-flow UI did not make restarting QUICK or moving to the next sweep clear

Disposition: failed the keyframe and repeat-flow gates. This failed attempt is preserved rather than reclassified as success.

Authorized bounded fixes applied for revalidation:

- device-calibrated edge threshold changed from 12 to 3;
- 12-consecutive-blur delayed fallback prevents an imperfect scene from producing zero keyframes while an 0.5–1 s fast-turn burst remains unselected;
- manifest Camera metadata now preserves actual video source dimensions;
- explicit `再扫一次` and `扫更广一点（WIDE）` controls added;
- device evidence now includes input blur/exposure score distributions.

Fresh post-fix QUICK and WIDE device trials remain required before final P0 disposition.

## Continuation chronology — repeat-session attempt

Post-calibration evidence demonstrated that device throughput was healthy and the keyframe-zero defect was resolved:

- QUICK: 110.0°, 5,012 ms, `LEFT_TO_RIGHT`, 8 keyframes, Preview 29.17–29.97 FPS, Orientation 51.1 Hz, quality p50/p95 15.8/27.2 ms, queue 0.
- QUICK: 110.3°, 7,518 ms, `MIXED`, 12 bounded keyframes, Preview min 29.85 FPS, Orientation 51.3 Hz, quality p50/p95 17.1/22.1 ms, queue 0.
- WIDE: 180.6°, 9,159 ms, `MIXED`, 18 bounded keyframes, Preview min 29.85 FPS, Orientation 52.6 Hz, quality p50/p95 18.1/24.3 ms, queue 0.
- One WIDE `CONTROLLED_FIXTURE` trial was excluded from device acceptance.
- All included trials retained raw/third-party uploads and provider/backend/Luna calls at 0.

The next repeat trial failed: QUICK was manually completed after 3,257 ms with coverage 0°, one keyframe at 88.4°, 23 duplicate rejections, Orientation still 19.7 Hz, Preview min 29.83 FPS, and queue 0. The pasted following WIDE record was truncated after reporting duration 55,715 ms; the tester reported that the first WIDE worked but the second right-to-left attempt did not respond.

Diagnosis: this was not a processing backlog. A stale first orientation sample followed by a persistent >45° posture discontinuity left the spike guard comparing every new sample to the old baseline. Bounded recovery now requires three mutually stable samples in the new cluster, rebases continuity without adding the jump to coverage, and routes corrected yaw into keyframe sampling. Failed evidence is preserved; a fresh right-to-left WIDE remains required.
