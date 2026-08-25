# Fine Tune performance policy

Primary metric is input-to-present. Each accepted device path needs at least 30 samples reported separately as ALL, SEMANTIC, LOCAL and COMBINED. Supporting metrics are render compute, canvas write, mask cache/inference, scheduler counters, final render and encode.

Candidate targets: slider p50 <50ms, p95 <100ms, typical final <3s. Warning requires p50 ≤80ms and p95 ≤150ms with no repeated severe stalls, crash, OOM, blank canvas or export failure. True OPPO results supersede desktop/mobile-viewport proxies.

Optimize scheduling and caching before adaptive preview and invasive backends. Preview never becomes final input. Per-slider mask inference and slider network calls remain zero.

OPPO K11 closure retained COMBINED 50.3/109.2 ms as `PASS_WITH_WARNING`. A reproduced 11.87 s 12MP main-thread freeze justified precompiled adjustment weights and Worker/OffscreenCanvas final export; the rerun completed in 4.17 s while the UI remained scrollable.
