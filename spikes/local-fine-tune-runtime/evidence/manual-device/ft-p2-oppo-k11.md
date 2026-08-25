# FT-P2 OPPO K11 real-device acceptance

Tested 2026-08-25 on user-operated OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.0.0 through an ephemeral trusted Cloudflare Quick Tunnel. The hostname and tunnel executable were not committed. User agent exposed Android 10 compatibility token `K`, device memory 8 GB, source 1920×1080, preview 512×288 and `CANVAS2D_IMAGE_DATA`.

## Acceptance result

Real Device Gate: `PASS_WITH_WARNING`. FT-P2: `PASS_WITH_WARNING`.

| Path | Count | Input→present p50 | p95 | max | Render p50 / p95 |
|---|---:|---:|---:|---:|---:|
| ALL | 42 | 44.4 ms | 79.3 ms | 120.6 ms | 39.0 / 66.6 ms |
| SEMANTIC | 300 | 29.0 ms | 84.3 ms | 96.8 ms | 25.5 / 70.2 ms |
| LOCAL | 227 | 26.4 ms | 79.1 ms | 94.6 ms | 21.0 / 59.8 ms |
| COMBINED | 189 | 50.3 ms | 109.2 ms | 126.1 ms | 46.0 / 91.2 ms |

COMBINED is within the documented warning range, not the ideal target. No post-fix ordinary sample exceeded 300 ms and no persistent 500 ms stall was observed.

## Functional and device observations

- Controlled fixture PERSON/BACKGROUND masks reached READY once; slider edits left inference count at 1, so per-slider inference was 0.
- Three local regions, fourth-region block, selection, drag, resize and continuous touch manipulation passed. No stuck pointer, page-scroll conflict or unintended crop was reported.
- Undo, Redo, redo invalidation after a new edit, Reset, Compare hold/release, Save and Reload passed by user operation.
- Source/fixture switches invalidated prior state. EXIF 1/6/8 produced upright 160×96, 96×160 and 96×160 outputs; TOP/L/R, overlay alignment and exports were visually checked.
- 1920×1080 JPEG export preserved dimensions. A representative device export measured render 333 ms, encode 84 ms, total 417 ms. Uploaded device exports are retained with this evidence.
- Duplicate export was visibly blocked; counter reached 5 while only the active export continued.
- Pre-fix 4000×3000 Combined took render 11489.1 ms + encode 380.3 ms and visibly froze the UI. After adjustment precompilation and Worker/OffscreenCanvas export it took 3929.4 + 243.5 = 4172.9 ms, `worker=true`; the page remained scrollable. Post-fix 4000×3000 Local took 2174.2 + 311.2 = 2485.4 ms.
- Post-fix continuous operation for at least 10 minutes produced no observed crash, reload, blank canvas, OOM, stuck busy state, freeze or progressive slowdown. Browser memory observations were 40.1–87.5 MB. Pre-fix testing felt warm; no post-fix instability or thermal-throttling symptom was reported, so thermal remains qualitative.
- The user observed no image upload, cloud image processing or slider network request. Third-party image upload, cloud provider, generative AI and semantic-edit calls remained 0 by implementation boundary.

## Evidence files

Screenshots and exported fixtures are under [`oppo-k11-2026-08-25/`](oppo-k11-2026-08-25/). Key records include the four paths, pre/post-fix 12MP results, local touch layouts, duplicate export and EXIF 1/6/8 outputs.

Viewport and devicePixelRatio were not separately captured, and per-scope 1080p timings were not all individually recorded. These are retained evidence limitations; the mandatory functional exports, dimensions, device performance paths and stability gate passed.
