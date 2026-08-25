# Fine Tune Production Flow V1.0

Fine Tune stays inside the simplified `START / SHOOT / REVIEW / FINAL` presentation while preserving the frozen backend Workflow.

At processing completion (`REALITY_PLUS`), primary action saves the accepted photo and secondary action opens `微调`. If `open_fine_tune_after_processing=true`, frontend orchestration uses the legal `ACCEPT_REALITY_PLUS` transition and opens Fine Tune automatically.

The editor exposes `整体 / 人物 / 背景 / 局部`. Without an accepted mask, 人物 and 背景 are visibly disabled. Controls are 亮度, 色温, 饱和度, 柔和; 背景 additionally admits one-sided BLUR only when a background mask exists. Slider and explicit step controls share the same local runtime path. Undo, Redo, Reset, Compare, and at most three local regions remain editor state.

Completing Fine Tune persists the recipe first. Neutral recipes select the accepted source directly. Non-neutral recipes render the immutable full source, persist a derived JPEG through the Main asset path, create lineage and `MyFinalPhoto`, and then enter Final. A failure leaves the session at Fine Tune with a reloadable recipe and never presents success.

Privacy posture: slider network calls 0, third-party uploads 0, cloud image processing 0, generative AI 0, semantic edit 0. Only Finalize uses the normal Main asset path.
