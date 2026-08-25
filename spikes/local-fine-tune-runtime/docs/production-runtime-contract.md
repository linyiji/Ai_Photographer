# Production runtime contract

This document binds the integration package without creating a second M01 Authority. Canonical JSON Schemas remain authoritative; runtime types are projections.

`FineTuneRuntime` accepts stable SourceAssetRef, canonical AdjustmentRecipe, optional validated masks and runtime options. It returns preview projections, final render artifacts, metrics and warnings. Source bytes and accepted assets are immutable. Recipe is the sole persistent visual edit authority; UI history and masks remain separate runtime data.

Runtime warnings are structured for missing semantic masks, unsupported Worker/OffscreenCanvas, fallback performance, invalid orientation/decode and capability loss. Fatal source/recipe identity mismatch, invalid Recipe or unavailable Canvas fails closed.

The production adapter must persist Recipe before final render, create a checksum-bearing derived asset idempotently, then create/update MyFinalPhoto and emit a governed event. Storage, repositories, event names and platform APIs belong to Main adapters.
