# 向风行｜Web / Mobile 复用优先的基础架构设计 V1.0

**Document ID:** `XFX_FOUNDATION_REUSE_ARCHITECTURE_V1`  
**Project:** 向风行 / AI Photographer  
**Reference Project:** AtlasAnalyse  
**Status:** Foundation Design  
**Date:** 2026-08-24

---

# 0. 核心结论

向风行不应该“直接复制 AtlasAnalyse 技术栈”。

正确策略是：

> **Reuse Proven Foundations, Specialize Runtime Capabilities.**

中文：

> **复用已经验证过的工程基础；对 Web / Mobile 不同运行环境进行能力特化。**

因此：

```text
AtlasAnalyse
提供：
- 已验证 Node/npm 基线
- Git / Lock / Test / Build 习惯
- AI Native 开发治理方法
- Contract / Evidence / Version / Handoff 思路

向风行
自己决定：
- Taro
- 微信小程序 Runtime
- Camera API
- Realtime CV
- Mobile Performance
- Photography-specific AI/CV
- FastAPI / Python
- PostgreSQL / Redis runtime
```

不是：

```text
AtlasAnalyse Stack
↓
整体复制
↓
向风行
```

而是：

```text
AtlasAnalyse Proven Foundation
          │
          ├── 可直接复用
          ├── 兼容后复用
          └── 不适合复用
                    ↓
             XFX Architecture
```

---

# 1. 复用分四层

所有 AtlasAnalyse 能力统一分为：

## A. EXACT REUSE

已经验证、与产品 Runtime 无强耦合。

可直接作为向风行候选基础：

```text
Node 24.18.0
npm 11.6.2
package-lock.json
Git workflow
Node built-in test workflow
ESLint workflow
Version / Evidence / Handoff methodology
```

---

## B. REUSE AFTER COMPATIBILITY CHECK

AtlasAnalyse 已经验证，但向风行运行环境不同。

例如：

```text
React 19.2.6
TypeScript 5.9.3
ESLint 9.39.4
Playwright 1.60.0
```

这些可以作为：

```text
PREFERRED_CANDIDATE
```

但要经过：

```text
Taro
×
WeChat Runtime
×
React
×
TypeScript
```

Compatibility Spike 后才 Final Lock。

---

## C. PATTERN REUSE

复用“架构模式”，不复用具体库版本。

例如：

```text
Contract-first
Version-first
Evidence-driven
AGENTS.md
Checkpoint
Task Report
Golden Flow
Challenge Registry
```

这是最值得从 AtlasAnalyse 复用的部分之一。

---

## D. XFX-SPECIFIC

由向风行独立决定：

```text
Taro
WeChat Adapter
Douyin Adapter
Camera Frame
Realtime CV
Pose
Composition
Live Guidance
Photography Session Runtime
Image Asset Lineage
Reality+
```

这些不能从 Web 项目推断。

---

# 2. Web 与 Mobile 的核心区别

Web Lab 与 Mobile Product 的目标不同。

## Web Lab

目标：

> 快速研发反馈。

特点：

```text
Mouse / Keyboard
FakeCamera
Replay
State Injection
Mock / Cached AI
Large Debug Panel
High Observability
No real mobile permission
```

---

## Mobile Product

目标：

> 真实摄影。

特点：

```text
Real Camera
Touch
Device Permission
IMU
Haptic
Voice Output
Album
Share
Mini Program APIs
Realtime CV performance
Battery / Heat constraints
```

所以不能追求：

> 100% UI / Runtime 代码一致。

应该追求：

> **100% Domain Language 一致，尽可能多 Product Logic 一致，平台能力按 Adapter 特化。**

---

# 3. 推荐前端总体架构

```text
                   XFX SHARED FRONTEND FOUNDATION
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        Domain Model       Workflow Core     Design System
             │                 │                 │
             └─────────────────┼─────────────────┘
                               │
                        Feature Modules
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
      Web Lab              WeChat Mini          Douyin Mini
         │                     │                     │
   FakeCameraAdapter      WeChatAdapter        DouyinAdapter
   ReplayAdapter          Camera / Album       Camera / Album
   DebugAdapter           Haptic / Share       Haptic / Share
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                         Backend Contracts
```

未来：

```text
Native App
↓
NativePlatformAdapter
```

加入同一个体系。

---

# 4. Shared Core 中应该有什么

建议共享：

```text
packages/
├── contracts/
├── workflow/
├── photography-core/
├── evaluation/
├── asset-registry/
├── design-system/
└── platform-contracts/
```

---

## 4.1 contracts

统一：

```text
PhotographySession
RealityContext
SelectedTarget
ShotDirection
CurrentShotState
CaptureAsset
CaptureDecision
RetakePlan
RealityPlusAsset
AdjustmentRecipe
AssetRef
DomainEvent
EvaluationResult
```

Web / WeChat / Douyin 必须使用相同 Contract。

---

## 4.2 workflow

统一：

```text
ENTRY
REALITY
TARGET
SHOT
LIVE
CAPTURE
QA
REALITY_PLUS
FINE_TUNE
FINAL
```

各端可以页面不同：

> Workflow State 不能不同。

---

## 4.3 photography-core

只放不依赖平台 API 的产品逻辑，例如：

```text
Target State
Shot Difference
Guidance Priority
Capture Gate
Retake Router
Asset Lineage
```

禁止：

```text
wx.*
tt.*
navigator.*
DOM-only camera API
```

直接进入 Core。

---

## 4.4 design-system

尽可能共享：

```text
Color Tokens
Typography
Spacing
Button Semantics
Card Semantics
State Badge
Guidance Language
Motion Tokens
```

但组件实现允许：

```text
Web
和
Mini Program
```

存在适配。

---

# 5. Platform Contract

关键不是“一个框架覆盖所有端”。

关键是：

> **所有平台能力先定义 Contract。**

例如：

```ts
interface CameraAdapter {
  open(): Promise<void>
  close(): Promise<void>
  capture(): Promise<AssetRef>
  subscribeFrames(handler: FrameHandler): Unsubscribe
}
```

业务模块调用：

```text
CameraAdapter
```

不是：

```text
wx.createCameraContext()
```

---

建议平台 Contract：

```text
CameraAdapter
FrameAdapter
AlbumAdapter
ShareAdapter
HapticAdapter
VoiceOutputAdapter
AuthAdapter
PaymentAdapter
DeviceMotionAdapter
StorageAdapter
NetworkAdapter
```

---

# 6. LiveShotRuntime 是 Mobile 特殊对象

后端拥有：

```text
PhotographySession
```

作为持久化 Authority。

但实时 Camera 不应该每一帧走后端。

因此前端增加：

# LiveShotRuntime

```text
FramePerception
DeviceMotion
CurrentDifference
InstructionState
ReadyState
CameraStability
ActiveRole
```

生命周期：

```text
Camera Open
↓
LiveShotRuntime Created
↓
Local CV / Rule Loop
↓
Meaningful State Change
↓
Sync Event to Server
↓
Capture
↓
Runtime Released
```

Web Lab：

```text
FakeCamera / State Replay
↓
Same LiveShotRuntime
```

这就是 Web 与 Mobile 最大的复用点。

---

# 7. Web Lab 如何最大化复用

Web Lab 不应该重写一套模拟逻辑。

应该：

```text
Web Lab
↓
Fake Platform Adapter
↓
Same Feature Modules
↓
Same Workflow
↓
Same Contracts
```

例如：

```text
FakeCameraAdapter
```

输出：

```text
Frame
```

和真实：

```text
WeChatCameraAdapter
```

对 `LiveShotRuntime` 来说结构一致。

这样：

```text
Web Replay 修复 Guidance
```

不需要在微信端重新实现一次 Guidance。

---

# 8. UI 应该复用到什么程度

建议分三层：

## Level 1 — Token 100% 共享

```text
Color
Spacing
Radius
Typography
Motion duration
State language
```

---

## Level 2 — Feature UI 尽量共享

例如：

```text
TargetCard
CaptureDecisionCard
ReadyState
AssetCard
ChallengeBadge
```

如果 Taro 能稳定跨端：

> 使用共享组件。

---

## Level 3 — Camera UI 平台特化

例如：

```text
LiveCameraSurface
Frame Overlay
Camera Permission
Native Preview
Gesture
```

允许：

```text
WebCameraSurface
WeChatCameraSurface
DouyinCameraSurface
NativeCameraSurface
```

不要为了组件统一降低 Camera 体验。

---

# 9. 推荐 Repository

```text
xiangfengxing/
│
├── apps/
│   ├── lab/
│   ├── wechat/
│   ├── douyin/
│   └── api/
│
├── packages/
│   ├── contracts/
│   ├── workflow/
│   ├── photography-core/
│   ├── evaluation/
│   ├── asset-registry/
│   ├── design-system/
│   └── platform-contracts/
│
├── adapters/
│   ├── web/
│   ├── wechat/
│   ├── douyin/
│   └── native/
│
├── docs/
├── project-status/
├── prototypes/
├── assets/
└── infrastructure/
```

也可以将 WeChat/Douyin 作为同一 Taro app 的 build target。

是否拆成：

```text
apps/client
```

还是：

```text
apps/wechat
apps/douyin
```

应在 Taro Spike 后决定。

现在 Contract 先不绑定这一实现细节。

---

# 10. AtlasAnalyse 工具链复用设计

基于真实 Audit：

## 直接采用作为 L0

```text
Node = 24.18.0
npm = 11.6.2
Package Manager = npm
Lock = package-lock.json
```

原因：

- AtlasAnalyse 项目级 Authority 完整；
- Mac Runtime 与 Project Authority 无 Drift；
- 对 Web / Build Tooling 通用。

---

## React / TypeScript

```text
React = 19.2.6 Candidate
TypeScript = 5.9.3 Candidate
```

不是 Final Lock。

必须先通过：

```text
Taro compatibility spike
```

---

## Next.js

```text
NOT REUSED FOR MOBILE PRODUCT
```

但 Web Lab 可以选择：

```text
Vite / React
```

或者如果有明确价值：

```text
Next.js
```

都不应该影响 Mobile Runtime。

建议 Web Lab 优先轻量：

```text
Vite
```

因为它是 Debug Runtime，不是 SEO Web Product。

---

# 11. Python / Backend 复用原则

AtlasAnalyse 没有 Python 项目级 Authority。

所以：

```text
Python 3.14.3
```

不能直接继承。

向风行需要独立：

```text
Python Compatibility Spike
```

针对：

```text
FastAPI
Pydantic
AI SDK
Image Processing
CV
PostgreSQL Driver
Redis
Worker
```

选择稳定版本。

---

## 后端架构可复用“模式”

即：

```text
Version Lock
Evidence
Contract
Testing
Runtime Audit
```

而不是复用 AtlasAnalyse 的 Next.js Backend 实现。

---

# 12. Database / Cache

向风行需要：

```text
PostgreSQL
Redis
```

但版本不要从 AtlasAnalyse `pg 8.21.0` 推断。

应该：

```text
compose.yaml
```

作为 Infrastructure Authority。

未来 Windows / Mac：

```text
same postgres image
same redis image
```

宿主 Docker 版本只需要兼容。

---

# 13. Environment Lock 分级

推荐三层。

## L0 — Shared Toolchain

当前可以锁：

```text
Node 24.18.0
npm 11.6.2
Git compatible
```

---

## L1 — Product Build Runtime

下一步确认：

```text
Taro
React
TypeScript
Python
uv
FastAPI
Pydantic
PostgreSQL image
Redis image
```

---

## L2 — Photography Runtime

Camera Spike 前确认：

```text
WeChat Runtime
Camera Frame API
Realtime CV
Pose
Composition
WASM / Worker
Image Processing
```

这样避免：

> 一开始一次猜完所有版本。

---

# 14. Feature Module 设计

推荐：

```text
features/
├── session/
├── reality/
├── target/
├── shot/
├── live/
├── capture/
├── qa/
├── enhancement/
├── fine-tune/
├── final/
└── commerce/
```

每个 Feature：

```text
domain/
service/
contract/
ui/
tests/
fixtures/
```

其中：

```text
ui/
```

允许平台-specific implementation。

其他部分尽可能共享。

---

# 15. Web / Mobile 复用矩阵

| 能力 | Web Lab | WeChat | Shared? |
|---|---|---|---|
| PhotographySession | ✓ | ✓ | 100% |
| Workflow | ✓ | ✓ | 100% |
| Contract | ✓ | ✓ | 100% |
| Target Logic | ✓ | ✓ | 高 |
| ShotDirection | ✓ | ✓ | 高 |
| Guidance Priority | ✓ | ✓ | 高 |
| Retake Router | ✓ | ✓ | 高 |
| Asset Lineage | ✓ | ✓ | 100% |
| Scenario Fixture | ✓ | Test | 100% |
| Camera | Fake | Real | Adapter |
| Frame Stream | Replay | Real | Contract |
| CV | Mock/Replay | Local | Algorithm 可共享，Runtime不同 |
| Permission | Mock | Real | Platform |
| Album | Mock | Real | Platform |
| Share | Mock | Real | Platform |
| Haptic | Mock | Real | Platform |
| Payment | Mock | Real | Platform |
| Debug Panel | Full | Hidden/Dev | Web-specific |
| Fine Tune Logic | ✓ | ✓ | 高 |
| High-res Render | API | API | Backend |

---

# 16. 最核心的复用原则

## 不复用 Page

而复用：

```text
Object
Capability
Workflow
Contract
```

---

## 不复用 Runtime API

而复用：

```text
Platform Contract
```

---

## 不复用 Mac 安装目录

而复用：

```text
Version Authority
Lock Files
```

---

## 不复用 AtlasAnalyse Product Stack

而复用：

```text
Proven Engineering Foundation
```

---

# 17. 基础开发顺序

```text
M00
Baseline / Git
↓
Environment L0
Node/npm
↓
M01
Domain + Contract Freeze
↓
Taro / React Compatibility Spike
↓
Environment L1
↓
M02
Shared Skeleton
↓
M03
Web Lab
↓
M04
WeChat Camera/CV Spike
↓
Environment L2
↓
M05
MVP Golden Flow
```

---

# 18. 最终架构原则

建议正式增加以下工程原则：

> **Reuse semantics before implementation.**

优先复用：

```text
Domain semantics
Contract
Workflow
Evaluation
Versioning
Evidence
```

再复用：

```text
Library
Framework
Component
```

最后才考虑：

```text
Platform implementation
```

原因：

> Web 与 Mobile 最大的差异在 Runtime，而不是摄影业务本身。

---

# 19. 一句话总结

向风行应该形成：

```text
Same Product Brain
+
Different Runtime Bodies
```

即：

> **同一个产品大脑，不同端各自拥有适合自己的身体。**

Web Lab 是调试身体。

微信小程序是第一正式摄影身体。

抖音是第二平台身体。

未来 Native 是高性能摄影身体。

而：

```text
PhotographySession
Workflow
Target
ShotDirection
Guidance
QA
Asset Lineage
Evaluation
```

始终是同一套产品大脑。
