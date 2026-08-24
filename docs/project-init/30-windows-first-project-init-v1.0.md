# 向风行｜项目初始化与 Windows 首发计划 V1.0

## 总体顺序

```text
基础文档冻结
↓
Git Remote 建立
↓
Windows Clone / Init
↓
第一次 Baseline Commit
↓
Global Contract / Repository Skeleton
↓
Web Lab
↓
Backend Skeleton
↓
微信 Camera/CV Spike
↓
MVP Golden Flow
↓
Mac Clone 同一 Repository
```

## 关键决策

第一版从 Windows 开始，但不创建“Windows 版项目”。

真正的源码权威是 Git Remote：

```text
Windows
   ↓ push
Git Remote
   ↓ clone
Mac
```

Windows → Mac 不通过 U 盘、压缩包、node_modules 或本地数据库迁移工程。

## Windows 推荐目录

```text
D:\Projects\xiangfengxing
```

避免 Desktop、Downloads、OneDrive 自动同步目录。

## 第一次 Git 初始化

PowerShell：

```powershell
mkdir D:\Projects\xiangfengxing
cd D:\Projects\xiangfengxing

git init
git branch -M main
```

把初始化包内容复制到仓库根目录后：

```powershell
git add .
git commit -m "docs: initialize project baseline"
```

创建远程空仓库后：

```powershell
git remote add origin <REMOTE_URL>
git push -u origin main

git switch -c develop
git push -u origin develop
```

## 环境检查

```powershell
.\scripts\check-env.ps1
```

第一阶段确认：

- Git
- VS Code
- Node / pnpm
- Python
- Docker Desktop / WSL2
- Chrome
- 微信开发者工具

具体 Node / pnpm / Python / Docker image 版本，不在文档阶段盲目锁死；在 Taro 与 Camera/CV Spike 开始前核验兼容性后统一 pin，并提交到仓库。

## 第一批代码不要做什么

不要一开始就：

- 把 P01-P13 全写完；
- 接所有 AI 模型；
- 写一个超级 `photography-service`;
- 写一个超级 `photography.tsx`;
- 先实现复杂双手机；
- 先实现 Motion/Solo/Commerce。

## 第一批代码做什么

### Global V1

先冻结：

```text
PhotographySession
WorkflowState
AssetRef
DomainEvent
ErrorContract
SelectedTarget
ShotDirection
CurrentShotState
CaptureDecision
RetakePlan
```

### Skeleton

```text
apps/client
apps/lab
apps/api
packages/contracts
packages/workflow
packages/platform
packages/scenario-fixtures
```

### Fast Feedback

先让 Web Lab 可以：

```text
FakeCamera
Mock Capability
Scenario Select
State Jump
Replay
Debug Trace
```

## 微信端开始条件

Web Lab 和 Session/Workflow Skeleton 跑通后，再开：

```text
spike/wechat-camera-cv
```

验证：

```text
Camera Open
→ Frame Access
→ Person Bounding Box
→ Overlay
→ FPS / Memory / Heat / Latency
```

Spike 结果决定 P05/P08/P09 的正式技术实现。

## Mac 接入

Windows 第一版 Push 后，Mac：

```bash
cd ~/Projects
git clone <REMOTE_URL> xiangfengxing
cd xiangfengxing
git switch develop
./scripts/check-env.sh
```

Mac 的第一任务不是继续加功能，而是先验证：

```text
Git clean
Web Lab runs
Backend runs
Fixtures load
Contracts pass
No Windows absolute paths
No CRLF-only core scripts
```

## 第一周建议

Day 1：Docs + Git + Windows Baseline  
Day 2：Global Contracts + Skeleton  
Day 3：Web Lab Runtime  
Day 4：S01 Fixture + Replay / Trace  
Day 5：WeChat Camera/CV Spike

目标不是一周做完 AI Photographer，而是建立一套以后能够快速迭代、跨 Windows/Mac、不会推倒重来的工程基础。
