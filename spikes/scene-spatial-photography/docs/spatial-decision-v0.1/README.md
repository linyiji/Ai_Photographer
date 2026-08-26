# Scene Spatial Photography — Spatial Decision v0.1

版本：`v0.1`  
状态：`DESIGN PACKAGE / PRODUCT LOGIC LOCK CANDIDATE`

本目录固定 Scene Spatial 从“方向扫描”演进到“一次扫描 → 空间证据 → 摄影可供性候选 → AI Photography Director 决策”的产品与技术边界。

## 文档目录

| 编号 | 文档 | 目的 |
|---|---|---|
| 00 | `00_SCENE_SPATIAL_NODE_OVERVIEW.md` | 节点总览、职责、边界、完整链路 |
| 01 | `01_SCENE_SCAN_AND_SPATIAL_ALGORITHM_ARCHITECTURE.md` | 新引入算法、端侧/后端分工、P2 最小算法路线 |
| 02 | `02_PHOTOGRAPHY_DIRECTOR_AI_INPUT_OUTPUT_CONTRACT.md` | AI 输入、输出、Authority 与禁止事项 |
| 03 | `03_CURRENT_NODE_CHECKPOINT_AND_PRODUCT_DECISIONS.md` | 当前节点事实、P0/P1 状态、已确认产品决策 |
| 04 | `04_MINI_PROGRAM_SCENE_SCAN_CAPTURE_PROTOCOL.md` | 微信/抖音小程序一次 Scene Scan 的采集协议 |
| 05 | `05_PHOTOGRAPHY_AFFORDANCE_AND_CANDIDATE_MODEL.md` | “哪里可以站/坐/拍”的 Photography Affordance 与候选模型 |
| 06 | `06_EVIDENCE_CONFIDENCE_AND_AUTHORITY_RULES.md` | FACT / CANDIDATE / UNKNOWN 与 Reality First |
| 07 | `07_SPATIAL_AND_AI_ACCEPTANCE_EVALUATION_PLAN.md` | Capture / Geometry / Candidate / AI / Validator / Live 分层验收 |
| 08 | `08_MAIN_LIVE_INTEGRATION_MAPPING.md` | Scene Spatial、AI Director、Main、Live 的未来集成映射 |

## 核心原则

> 一次 Scene Scan 尽可能采齐方向与空间证据；不同能力按需消费，而不是要求用户按算法模块重复操作。

> Geometry / CV 负责“哪里可以拍”；AI Photography Director 负责“这个具体的人放在哪里、从哪里拍、怎么拍更好”；Validator 负责“是否真实可执行”；Live 负责“如何把人和相机移动到目标”。
