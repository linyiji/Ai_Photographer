# Automated Tests

Final local gate on 2026-08-26:

- TypeScript strict check: PASS
- Node tests: **63/63 PASS**
- Vite production build: PASS (16 modules, JS 19.27 kB / gzip 6.95 kB)
- Deterministic replay: **11 fixtures PASS**

Coverage includes permission states, both yaw wraps, multiple crossings, baseline/reset, screen posture, 120° span, reversal, single-spike rejection, persistent startup-jump continuity rebase in both directions, device-calibrated blur and delayed fallback, exposure gates, angular/visual duplicate novelty, Camera source metadata, caps/reset/no-backlog telemetry, cancel/new sweep, deterministic privacy manifest, YawMap lookup/gaps, and camera-independent QUICK/WIDE replay.
