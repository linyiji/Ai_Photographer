# 07 — Spatial and AI Acceptance Evaluation Plan

> V0.2 GATE AMENDMENT: evaluate separately: (1) P2 Backend Geometry, (2) future P3 Photography Affordance, and (3) future AI Director. Client precheck cannot pass P2; Controlled Reference cannot substitute for current-session Backend evidence. Passing P2 does not start or pass P3.

## 1. Gate

```text
G1 Capture
G2 Direction
G3 Spatial Geometry
G4 Photography Affordance
G5 Candidate Generation
G6 AI Director
G7 Constraint Validator
G8 Live Handoff
```

## 2. G1 Capture

验证：
- 一次 Scene Scan 完成
- Camera/Orientation/Keyframe 正常
- 用户无需默认第二次操作
- raw stream upload = 0
- FPS 可接受

## 3. G2 Direction

验证：
- relative yaw
- 左右语义
- candidate 角度分散
- region count 不控制 candidate count

关键案例：
`1 region + 180° → 多个 ViewCandidate`

## 4. G3 Spatial Geometry

测试：
- 纯旋转 → Spatial 应拒绝或 Partial
- 有自然位移 → usable rate 提升
- left/right pose sign 正确
- closer/farther relative depth trend 正确
- reprojection 合理
- false geometry 不可判 USABLE

## 5. G4 Affordance

STAND V1：
- 明显无空间区域不得生成
- 遮挡严重区域不得高置信
- Candidate 从相机视角可见
- support/free-space 不足时保持 Unknown

## 6. G5 Candidate

验证：
- 3–6 个可执行组合
- 不重复
- 不超出扫描
- 不含 invalid geometry
- 技术坏帧不优先

## 7. G6 AI Director

AI 必须实际接收：
- Subject Reference
- Scene Candidate Images
- Direction Map
- Spatial Summary
- CandidateShots
- User Intent

输出必须：
- View 来自 Candidate
- Subject/Camera Zone 来自 Candidate
- 无无依据米制距离
- 无虚构 Safety
- 无超范围方向

人工评估：
- 人物与场景匹配合理
- framing/pose 合理
- 是否利用人物参考图
- 是否保持真实环境

## 8. G7 Validator

对抗案例：
- 不存在 zone
- 失效 candidate
- metric scale=false 却输出 1.2m
- safety=unknown 却说安全
- yaw 超范围

期望：全部 BLOCK。

## 9. G8 Live

验证：
- target x/y
- target scale
- subject orientation
- camera relation
- tolerances

Live 不重新做全局摄影决策。

## 10. 成本

记录：
- scanned frames
- uploaded frames
- geometry time
- reconstruction time
- AI images count
- AI token cost
- `SpatialUsage`

用于判断 Spatial 重计算是否值得。
