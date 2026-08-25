# BACKGROUND BLUR performance evidence

## Automated desktop

- 512×288 preview bound: under 2000 ms gate.
- 1920×1080 combined synthetic final: render 968.3 ms.
- 4000×3000 combined synthetic final: render 5466.2 ms.
- No automated OOM; dimensions, alpha, source identity and immutable source bytes preserved.

## Browser Worker

- Windows Chrome 151 / 16 GB, 1920×1080 Worker: render 602 ms, encode 70 ms.
- Windows Chrome 151 / 16 GB, 4000×3000 Worker: render 7833.3 ms, encode 471.8 ms, total 8305.1 ms. Page scroll executed while Worker was active.

## OPPO K11 regression

User-operated OPPO K11 / ColorOS 15.0 / Chrome Mobile 138.0.0.0, 8 GB exposed memory, 1920×1080 source and 512×288 preview:

| Path | Count | Input→present p50 / p95 / max | Render p50 / p95 |
|---|---:|---:|---:|
| SEMANTIC with BACKGROUND BLUR | 300 | 74.0 / 127.0 / 172.2 ms | 69.8 / 115.0 ms |

Final memory observation was 104.0 MB. The 4000×3000 Worker path completed with render 6380.5 ms, encode 343.8 ms, total 6724.3 ms, 543302 bytes JPEG. The user explicitly confirmed that the page remained scrollable during execution.

The ordinary p95 remains below the recipe's 150 ms warning ceiling and 12MP does not reintroduce main-thread freeze. The result is `PASS_WITH_WARNING`, not PASS, because high-resolution latency materially exceeds 3 seconds and device thermal measurement was not quantified in this regression.
