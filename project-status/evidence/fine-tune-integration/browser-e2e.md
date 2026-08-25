# Fine Tune H5 Browser E2E

Status: `PASS_WITH_WARNING`.

Validated in the Codex in-app Chromium browser against the built H5 artifact and local Main API:

- START -> SHOOT -> controlled file selection -> 使用这张 -> automatic Fine Tune preference.
- Before confirmation, the image remained local and the UI disclosed that no upload had occurred.
- No-mask UI left ALL/LOCAL available and PERSON/BACKGROUND disabled.
- Local region count, Undo, Redo, Reset, neutral finalize, persisted recipe, and refresh recovery were exercised.
- Non-neutral step control produced one brightness adjustment and one Worker-derived final.
- Backend readback produced one derived asset, one completion event, complete lineage, and a MyFinalPhoto recipe link.
- Final browser console error count: 0.

Measured non-neutral artifact: decoded source `1080x2412`, Worker render about `566.7ms`, encode about `44ms`. This is not a 12MP result and must not be generalized to OPPO or 12MP performance.

H5 build: PASS_WITH_WARNING, existing entrypoint advisory `302 KiB`.
