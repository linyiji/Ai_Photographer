# XFX_CODEX_TASK_00_WINDOWS_PROJECT_BOOTSTRAP

**TASK_ID:** `XFX_PROJECT_BOOTSTRAP_WINDOWS_01`  
**项目:** 向风行 / AI Photographer  
**执行环境:** Windows First  
**任务类型:** Project Bootstrap / Baseline Import / Local Git Initialization  
**执行原则:** Read → Validate → Execute → Verify → Report

---

## 0. 你的角色

你是本项目的 **Repository Bootstrap Agent**。

你的任务不是设计新产品功能，也不是开始开发 AI/CV。

你的唯一目标是：

> 将已经冻结的 Project Baseline 正确落到 Windows 本地项目目录，建立可审计的 Git 本地仓库，完成第一版 Baseline Commit，并为后续 Global Contract / Skeleton 开发准备一个干净、可复现、Mac 可直接 clone 的工程起点。

---

# 1. 权威输入

需要使用的初始化包：

```text
向风行_AI_Photographer_Project_Baseline_V0.5_含Framework与架构优化.zip
```

优先从当前用户 Downloads 目录查找该**精确文件名**。

如果用户已经把 ZIP 放入 Codex Workspace，则优先使用 Workspace 中的文件。

不要自行下载其他版本。

不要使用旧的 V0.1 / V0.2 / V0.3 / V0.4 Bootstrap 作为最终基线。

---

# 2. Windows 目标目录

默认目标：

```text
D:\Projects\xiangfengxing
```

如果 `D:` 不存在：

1. 不要擅自改用任意目录；
2. 使用：

```text
%USERPROFILE%\Projects\xiangfengxing
```

作为 fallback；
3. 在报告里明确记录实际路径。

---

# 3. 硬性安全边界

必须遵守：

1. 只允许写入：
   - 本次项目目标目录；
   - 必要的临时解压目录。
2. 不删除目标目录之外的任何文件。
3. 如果目标目录已经存在并且非空：
   - 先检查；
   - 不覆盖；
   - 不删除；
   - 报告 `SOURCE_REQUIRED / MANUAL_REVIEW_REQUIRED`。
4. 不修改 Windows 系统设置。
5. 不修改全局 Git 配置。
6. 不自动安装 Node、pnpm、Python、Docker、微信开发者工具等软件。
7. 本任务只检查环境，不负责安装环境。
8. 不创建、写入或猜测：
   - API Key
   - Token
   - Password
   - Provider Secret
   - Git credential
9. 不把 `.env`、凭据、本地数据库提交到 Git。
10. 不改变现有产品设计文档的业务含义。
11. 不重写 CURRENT HTML Prototype。
12. 不删除 archive / baseline 资料。
13. 不创建 Git Remote，除非任务上下文明确提供了 Remote URL。
14. 不执行 `git push`，除非：
   - Remote URL 已明确提供；
   - 当前凭据已经合法配置；
   - Push 不会覆盖远程现有历史。
15. 不使用 `--force`。
16. 不做 destructive Git 操作：
   - `reset --hard`
   - `clean -fd`
   - `push --force`
   - 删除已有 branch
17. 不为了“让测试通过”隐藏错误。

---

# 4. 全局工程原则

必须保留以下架构原则：

```text
Workflow 是骨架
Session 是共享状态
Contract 是模块语言
Capability 是独立实现
```

以及：

```text
Global Definition First
Modular Delivery Second
```

和：

```text
One Repository
Multiple Runtimes
Reproducible Environment
```

Windows 不是单独产品版本。

后续 Mac 必须可以：

```text
git clone
```

同一 Remote Repository 后继续开发。

因此本任务禁止引入：

- Windows 绝对路径到业务源码；
- Windows-only 业务实现；
- 第二套 Mac/Windows 代码目录。

---

# 5. 执行步骤

## STEP 0 — Preflight

先只读检查。

输出并记录：

```text
OS
PowerShell version
Current workspace
Git version
Node version / missing
pnpm version / missing
Python version / missing
Docker version / missing
```

检查：

```text
git
node
pnpm
python
docker
```

缺失不是本任务 FAIL。

标记：

```text
ENVIRONMENT_GAP
```

本任务不要自动安装。

---

## STEP 1 — Locate Baseline ZIP

查找精确文件：

```text
向风行_AI_Photographer_Project_Baseline_V0.5_含Framework与架构优化.zip
```

优先：

1. Workspace
2. `%USERPROFILE%\Downloads`

如果找不到：

```text
STATUS = SOURCE_REQUIRED
```

停止后续写操作。

不要猜文件名。

---

## STEP 2 — Prepare Target Directory

目标优先：

```text
D:\Projects\xiangfengxing
```

如果 `D:` 不存在：

```text
%USERPROFILE%\Projects\xiangfengxing
```

如果目标目录：

### 不存在

创建。

### 存在且为空

可以继续。

### 存在且非空

不要覆盖。

输出：

```text
MANUAL_REVIEW_REQUIRED
```

停止本任务。

---

## STEP 3 — Extract Baseline

将 ZIP 解压到临时位置。

检查 ZIP 顶层结构。

最终目标目录必须直接是：

```text
xiangfengxing\
  README.md
  BASELINE_MANIFEST.json
  docs\
  apps\
  packages\
  prototypes\
  assets\
  infrastructure\
  scripts\
```

禁止形成：

```text
xiangfengxing\
  xiangfengxing-project-baseline-v0.2\
    README.md
```

如果 ZIP 自带外层目录：

> 解压后把外层目录中的内容移动到目标项目根目录。

只操作本项目目标。

---

# 6. Baseline 完整性验收

必须检查以下文件/目录存在。

## Root

```text
README.md
BASELINE_MANIFEST.json
.gitignore
.gitattributes
.editorconfig
.env.example
```

## Product Documents

```text
docs/product-design/10-golden-flow-v1.0.md
docs/product-design/11-realtime-shot-control-v1.0.md
docs/product-design/12-reality-plus-policy-v1.0.md
docs/product-design/13-user-fine-tune-v1.0.md
docs/product-design/14-final-action-hub-v1.0.md
docs/product-design/15-story-a-f-master-v1.0.md
docs/product-design/16-global-design-foundation-v1.0.md
```

## Research

```text
docs/research/20-product-tech-architecture-research-v1.0.md
```

## Project Init

```text
docs/project-init/30-windows-first-project-init-v1.0.md
```

## Current Prototype

```text
prototypes/current/向风行_S01_风暴来临之前_CURRENT_V1.6.1.html
```

## Baseline Prototype

```text
prototypes/baseline/向风行_P01-P13_交互骨架_BASELINE_V1.1.html
```

## S01 Assets

至少：

```text
assets/story-s01/source/
assets/story-s01/generated/
```

并核验 S01-A01 ~ S01-A07 对应资产存在。

## Story Library

至少：

```text
assets/story-library/subject-anchor.png
assets/story-library/source-scenes/
```

以及 5 个真实 Scene Source。

---

# 7. Manifest Validation

读取：

```text
BASELINE_MANIFEST.json
```

核验：

```text
baseline_version == 0.5
```

核验 CURRENT prototype 指向：

```text
prototypes/current/向风行_S01_风暴来临之前_CURRENT_V1.6.1.html
```

如果 Manifest 与文件实际不一致：

```text
STATUS = FAIL
```

不要自行修改 Manifest 来掩盖问题。

---

# 8. Repository Hygiene Check

检查：

## Secrets

至少扫描明显：

```text
api_key
secret
token
password
BEGIN PRIVATE KEY
sk-
```

只报告疑似项。

不要打印完整秘密值。

## Git Ignore

确认：

```text
.env
node_modules
.venv
本地数据库
Secrets
大批量 Raw Fixtures
```

被忽略。

## Line Ending

确认：

```text
.gitattributes
```

定义跨 Windows / Mac 的 LF 策略。

## Path

检查文档/源码中是否出现会成为生产依赖的：

```text
C:\
D:\
/Users/...
```

Windows setup 文档中的示例路径允许存在。

业务源码中不允许写死。

---

# 9. Git Initialization

进入项目根目录。

如果不存在 `.git`：

```powershell
git init
git branch -M main
```

如果已经是 Git Repository：

不要重新初始化，先报告现状。

---

# 10. Git Identity Check

执行：

```powershell
git config user.name
git config user.email
```

允许读取 local / inherited config。

如果缺失：

```text
STATUS = SOURCE_REQUIRED
ITEM = GIT_IDENTITY
```

不要自行写假姓名或邮箱。

此时可以完成：

- 文件解压
- Baseline验收
- `git status`

但不要创建 Commit。

---

# 11. First Baseline Commit

只有 Git Identity 有效时执行。

先：

```powershell
git status
git add .
```

再次确认：

- `.env` 未被 staged；
- 没有 Secret；
- 没有 node_modules；
- 没有本地 DB；
- 没有目标目录之外内容。

然后：

```powershell
git commit -m "docs: initialize product and architecture baseline"
```

记录 Commit Hash。

---

# 12. Develop Branch

Commit 成功以后：

```powershell
git switch -c develop
```

如果 `develop` 已存在：

不要重建，检查其来源和状态。

本地至少应该最终存在：

```text
main
develop
```

---

# 13. Remote Handling

## 如果任务上下文没有 REMOTE_URL

不要问一个无关问题，也不要猜。

输出：

```text
REMOTE_STATUS = SOURCE_REQUIRED
NEXT_REQUIRED_INPUT = REMOTE_URL
```

保留本地 Git 正常完成。

## 如果已经明确提供 REMOTE_URL

先检查：

```powershell
git remote -v
```

无 origin 时：

```powershell
git remote add origin <REMOTE_URL>
```

有 origin 时：

> 不覆盖，先比对。

在没有确认远程为空 / 不会覆盖历史之前：

> 不 push。

如果确定是刚创建的空仓库：

```powershell
git push -u origin main
git push -u origin develop
```

禁止 force push。

---

# 14. 本任务不做的事情

本任务不要：

- 初始化 Taro；
- 初始化 React；
- 初始化 FastAPI；
- 创建 PostgreSQL；
- 创建 Redis；
- 编写 Docker Compose；
- 安装 CV 模型；
- 接模型 Provider；
- 开发 P01-P13；
- 改 Prototype；
- 开始 Camera Spike。

这些属于后续 Task。

---


# 14.1 Project Progress Governance

本任务必须读取并遵守：

```text
docs/project-management/40-progress-governance.md
docs/project-management/41-milestone-plan.md
docs/project-management/42-codex-task-template.md
```

进度权威文件：

```text
project-status/PROJECT_STATUS.md
project-status/PROJECT_STATUS.json
```

难点治理权威：

```text
project-status/CHALLENGES.md
project-status/CHALLENGES.json
docs/project-management/43-challenge-resolution-governance.md
```

可视化进程图：

```text
prototypes/project-control-center/XFX_Project_Control_Center_V0.1.html
```

必须确认这些文件存在并可打开。

Framework / Execution Context：

```text
docs/framework/AI_Native_Product_Creation_Framework_V1_SOURCE.md
docs/architecture/50-xfx-product-architecture-optimization-v2.md
docs/project-management/44-framework-to-xfx-stage-mapping.md
AGENTS.md
project-status/CURRENT_VERSION_SCOPE.md
project-status/GPT_HANDOFF.md
```

这些文件属于 Baseline 的新增内容，只做完整性检查；TASK 00 不执行新的架构重构。

在本任务执行期间：

```text
current_milestone = M00
current_task = XFX_PROJECT_BOOTSTRAP_WINDOWS_01
```

任务完成以后：

## 如果 LOCAL_BOOTSTRAP = PASS

更新：

```text
M00 Project Baseline = PASS
M00_BASELINE_LOCK = PASS

current_milestone = M01
current_task = XFX_GLOBAL_CONTRACTS_AND_SKELETON_01
```

但是：

> 只更新“下一推荐任务”，不要执行 M01。

## 如果 BLOCKED / SOURCE_REQUIRED

保持：

```text
M00 = IN_PROGRESS / BLOCKED
```

并在状态文件中写明：

```text
blocker_type
blocking_scope
does_not_block
required_input
```

## Task Report

除原 Bootstrap execution report 外，还必须生成：

```text
project-status/reports/XFX_PROJECT_BOOTSTRAP_WINDOWS_01.md
```

其中至少包含：

```text
Task Status
Milestone
Changed Files
Tests
Acceptance
Evidence
Known Issues
Deferred
Git Commits
Next Task
```

禁止只更新 Markdown 不更新 JSON，或只更新 JSON 不更新 Markdown。


# 15. 生成执行报告

在项目中创建：

```text
docs/project-init/31-windows-bootstrap-execution-report.md
```

必须包含：

## Environment

```text
Actual project path
OS
Git
Node
pnpm
Python
Docker
```

## Baseline

```text
ZIP source
Baseline version
Manifest validation
Product docs
Current prototype
Assets
```

## Git

```text
Repository initialized?
main exists?
develop exists?
Commit hash
Working tree clean?
Remote configured?
Push completed?
```

## Security

```text
Secret scan result
.env tracked?
Unexpected credentials?
```

## Result Matrix

使用：

```text
PASS
FAIL
SOURCE_REQUIRED
MANUAL_REVIEW_REQUIRED
NOT_EXECUTED
```

不要把缺少 Remote URL 写成 FAIL。

---

# 16. Acceptance Criteria

本任务只有以下全部满足时，本地 Bootstrap 才可以标记 PASS：

```text
[ ] Project directory created correctly
[ ] No extra nested baseline folder
[ ] BASELINE_MANIFEST version = 0.2
[ ] Product design docs present
[ ] Technical research present
[ ] Current S01 V1.6.1 prototype present
[ ] Baseline prototype present
[ ] S01-A01 ~ A07 assets present
[ ] Five source scenes present
[ ] .gitignore present
[ ] .gitattributes present
[ ] No tracked secret
[ ] Git repository valid
[ ] main branch valid
[ ] develop branch valid
[ ] First baseline commit created
[ ] PROJECT_STATUS.md updated
[ ] PROJECT_STATUS.json updated
[ ] CHALLENGES.json present and valid
[ ] Challenge governance document present
[ ] Project Control Center HTML present
[ ] Framework source present
[ ] Architecture optimization document present
[ ] AGENTS.md present
[ ] CURRENT_VERSION_SCOPE.md present
[ ] GPT_HANDOFF.md present
[ ] project-status/reports/XFX_PROJECT_BOOTSTRAP_WINDOWS_01.md created
[ ] M00 status/gate updated correctly
[ ] Working tree clean after report commit
```

注意：

如果执行报告是在 First Baseline Commit 之后创建：

再创建第二个 Commit：

```powershell
git add docs/project-init/31-windows-bootstrap-execution-report.md
git commit -m "docs: record windows bootstrap execution"
```

最终 Working Tree 必须 clean。

Remote / Push 不属于本地 Bootstrap PASS 的硬性条件。

没有 Remote URL 时：

```text
LOCAL_BOOTSTRAP = PASS
REMOTE_BOOTSTRAP = SOURCE_REQUIRED
```

---

# 17. 最终终端输出格式

任务完成以后，只输出简洁总结：

```text
XFX_PROJECT_BOOTSTRAP_WINDOWS_01

Local Bootstrap: PASS / FAIL
Remote Bootstrap: PASS / SOURCE_REQUIRED / FAIL

Project Path:
Baseline Version:
Current Milestone:
Milestone Gate:
Current Branch:
main:
develop:

Baseline Commit:
Report Commit:

Environment Gaps:
Remote Status:

Report:
docs/project-init/31-windows-bootstrap-execution-report.md

Next Recommended Task:
XFX_GLOBAL_CONTRACTS_AND_SKELETON_01
```

如果有失败：

额外列：

```text
Blocking Issues
```

只列真实阻塞项。

---

# 18. 执行原则

不要只给我建议。

> **实际检查文件、实际创建目录、实际初始化 Git、实际运行验收命令、实际生成报告。**

但严格遵守上述写入和安全边界。

从 `STEP 0 — Preflight` 开始执行。
