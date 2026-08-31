# Current Version Scope

**Status:** PRODUCT_MASTER_FLOW_V2_REBASELINED
**Project Baseline:** V0.6

## Current Objective

在已锁定 M01 与现有 Main 能力之上，按 Product Master Flow V2 完成可执行产品闭环；当前并行方向为 Live V4、已连接的 Scene Spatial 能力维护和未来 AI Director spike。

## Current MVP Direction

当前已确定的优先验证方向：

```text
REALITY_CAPTURE
→ AI_PHOTOGRAPHY_DIRECTOR
→ LIVE_SHOOTING
→ AI_PHOTO_QA + REALITY_PLUS
→ USER_FINE_TUNE
→ MY_FINAL_PHOTO
```

Phase 1 uses a validated deterministic Shot Plan: `NON_AI_BEST_SHOT_DISCOVERY = NO`, `NON_AI_SHOT_PLAN_EXECUTION = YES`.

## Explicitly Not Yet Committed for Current Build

以下能力已有产品/架构设计，但不由本次 rebaseline 实现：

- Dual Device
- Motion Shot
- Advanced Solo
- Difficult Scene full implementation
- Creative+ production
- AI Artwork production
- Commerce production
- Live V4 runtime and device promotion
- AI Photography Director provider integration
- Scene Spatial P3 Affordance

Scene Spatial P0/P1/P2 Main integration is already accepted with warning. Live V3 remains failed/not promoted and must not be integrated into Main.

不要因为文档里存在这些能力就默认本阶段全部开发。
