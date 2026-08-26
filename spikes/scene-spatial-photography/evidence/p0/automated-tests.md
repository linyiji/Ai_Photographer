# Automated Tests

Final local gate on 2026-08-26:

- TypeScript strict check: PASS
- Node tests: **56/56 PASS**
- Vite production build: PASS (16 modules, JS 14.57 kB / gzip 5.52 kB)
- Deterministic replay: **11 fixtures PASS**

Coverage includes permission states, both yaw wraps, multiple crossings, baseline/reset, screen posture, 120° span, reversal, jitter/spike rejection, blur and exposure gates, angular/visual duplicate novelty, caps/reset/no-backlog telemetry, cancel/new sweep, deterministic privacy manifest, YawMap lookup/gaps, and camera-independent QUICK/WIDE replay.
