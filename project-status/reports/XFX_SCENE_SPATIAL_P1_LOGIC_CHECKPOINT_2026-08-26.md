# Scene Spatial P1 逻辑与节点阶段报告

报告日期：2026-08-26  
任务：`XFX_SCENE_SPATIAL_P1_SCENE_CONTEXT_AND_PHOTOGRAPHY_OPPORTUNITY_01`  
Worktree：`D:\Projects\_worktrees\Ai_Photographer-scene-spatial`  
Branch：`spike/scene-spatial-photography-v0.1`  
授权起点：`b7b60466bd65187c34b542e656849eabc328a55b`  
当前 HEAD：`209da6eb9c2dfcec572b3d164b8ba4d3568b42de`  
阶段状态：**CHECKPOINT — 等待产品逻辑确认，P1 尚未验收**

## 1. 本报告的边界

本报告只记录截至当前 HEAD 已实现的逻辑、验证结果、OPPO 真机发现和待确认方向。

以下内容尚未执行：

- 未按新的产品理解修改运行时代码或 UI；
- 未把当前 P1 标记为 PASS / PASS_WITH_WARNING；
- 未更新 Integration Status 为 `READY_FOR_INTEGRATION_DESIGN`；
- 未开始 P1 后续任务、Main Integration 或 AI Provider；
- 未修改 Main、develop、Live、Fine Tune、AI Visual Worktree。

## 2. 当前已经实现的逻辑

当前链路为：

`SceneSweepManifest + YawMap + 瞬时关键帧像素`

→ 每个关键帧的本地视觉描述子

→ 基于相邻 yaw 和描述子差异的角度区域分组

→ 每个代表帧的 LEFT / CENTER / RIGHT_THIRD 画面区域评估

→ 每个区域生成一个确定性 PhotographyOpportunity

→ 按评分排序并做 24° 邻域去重，最多返回 3 个方向。

### 2.1 关键帧视觉描述子

当前对每个瞬时关键帧计算：

- 亮度、阴影裁切、高光裁切和平衡曝光分数；
- 清晰度、对比度和边缘密度；
- 3×3 局部亮度、对比度、边缘和 clutter 网格；
- 全局及左、中、右区域的视觉繁杂度代理；
- 摄影帧质量与质量置信度。

该逻辑是纯本地、确定性的低成本视觉代理，不理解人物、道路、树木、建筑等语义。

### 2.2 角度区域划分

关键帧先按相对 yaw 排序。相邻帧在 yaw 间隔过大或亮度、对比度、clutter、边缘密度差异超过阈值时形成边界；过小的孤立分组会被合并。

这是一种“相对角度 + 二维图像统计”的组织方式，不是 panorama、深度估计、SLAM 或三维重建。

### 2.3 人物画面区域评估

当前实现为四种画幅模板（CLOSE / MEDIUM / ENVIRONMENTAL / FULL_BODY）在 LEFT_THIRD、CENTER、RIGHT_THIRD 三个锚点上的归一化二维矩形。

每个矩形根据背景繁杂度、曝光、画面边缘余量和人物头部/躯干范围内的强边缘冲突代理评分。当前最终机会只选择分数最高的一个矩形。

它表达的是画面构图代理，不是现实空间中人物应该站立的物理位置。

### 2.4 方向机会排序

当前评分综合：

- 代表帧质量；
- 区域质量；
- 低繁杂度；
- 画面放置余量；
- 边缘冲突；
- 曝光；
- 置信度。

严重模糊或严重曝光异常会被额外降权。输出含相对 yaw、代表关键帧、单一 placement zone、评分拆解、确定性原因码及明确限制：物理人物位置和物理相机位置均 `NOT_SUPPORTED`，安全性为 `UNKNOWN_REQUIRES_USER_CONFIRMATION`。

## 3. 已达到的工程节点

### 3.1 分支与边界

- 在授权的独立 Scene Spatial Worktree 和同一分支完成；
- P0 accepted runtime 保持不变；
- 无跨 Worktree Runtime Dependency；
- Provider、backend per-frame、Luna 和 raw upload 均为 0；
- 未调用 AI Provider，未实现语义识别或物理三维定位。

### 3.2 已提交节点

1. `196eb5a` — `feat: add deterministic scene context and opportunity ranking`
2. `209da6e` — `docs: define scene spatial p1 contracts and evidence`

### 3.3 自动化与构建

- Scene Spatial 测试：131/131 PASS；
- TypeScript：PASS；
- Build：PASS；
- P0 replay：11/11 PASS；
- P1 controlled replay：5/5 PASS；
- 合成素材验证了曝光、模糊、繁杂度、边缘冲突、左右构图和去重逻辑；
- 没有提交真实用户媒体字节。

### 3.4 桌面浏览器节点

- QUICK fixture：114°、10 个关键帧、3 regions、3 opportunities，冷启动分析 27.1 ms；
- WIDE fixture：180°、15 个关键帧、3 regions、3 opportunities，重复分析 2.9–13.5 ms；
- 重复扫描、结果替换、下载开关和 393×873 响应式布局正常；
- 浏览器 console warning/error 为 0。

这些结果只证明实现和合成数据链路可运行，不证明真实场景推荐合理。

## 4. OPPO K11 真机数据与结论

用户提供了 4 次真实 P1 结果和对应 P0 sweep manifest：

| Sweep | 模式 | 覆盖 | 描述子 | Regions | Opportunities | P1 总耗时 | Top yaw | Top score | Anchor |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|
| `1787723500381` | QUICK | 110.3° | 7 | 1 | 1 | 71.6 ms | 83.8° | 0.234 | LEFT_THIRD |
| `1787723532462` | QUICK | 110.1° | 8 | 1 | 1 | 17.7 ms | -58.5° | 0.591 | LEFT_THIRD |
| `1787723543689` | QUICK | 110.9° | 7 | 1 | 1 | 10.9 ms | 65.0° | 0.249 | LEFT_THIRD |
| `1787723609230` | WIDE | 182.5° | 12 | 1 | 1 | 18.5 ms | 91.4° | 0.255 | RIGHT_THIRD |

共同事实：

- 四次扫描都正常完成；
- Preview FPS median 约 29.97；
- P1 分析耗时显著低于 1500 ms 候选目标；
- Provider、backend per-frame、Luna、raw media upload 均为 0；
- 但是 QUICK 和 WIDE 全部退化成 `1 region / 1 opportunity`；
- 用户认为结果过于二维、候选只有一个、推荐位置不好。

### 当前结论

1. **P0 扫描与关键帧采集能力仍成立。** 真机覆盖、帧率、完成状态和隐私边界没有出现回归证据。
2. **P1 本地分析链路在性能和工程确定性上成立。** 它能完成描述子、区域、评分和序列化。
3. **真实场景的候选方向与人物位置推荐质量尚未成立。** 四次真机均只有一个区域和一个机会，不能满足“多个有意义候选”的产品目标。
4. **当前单一 Top 推荐不应被视为摄影决策。** 合成 fixture 上成立的视觉统计差异，没有在这些真实室内/真实手机帧中形成可靠区分；单一低置信代理容易给出用户认为不好的 placement。
5. **P1 当前状态不是 PASS，也不应以 PASS_WITH_WARNING 关闭。** 应保持 `CHECKPOINT / NOT_ACCEPTED`，等待产品逻辑确认后再做有边界的修订和新一轮真机门。

## 5. 已识别的逻辑偏差

### 5.1 “区域分割”与“候选方向”被错误绑定

当前代码是“一 region 产生一 opportunity”。真实场景被聚合为一个 region 时，UI 必然只显示一个候选。即使 sweep 覆盖 110°–182° 且已准备 7–12 张关键帧，也无法展示角度上分散的候选视角。

### 5.2 二维 placement 被表现得过于具体

归一化人物矩形在视觉上接近“系统已知道人物应放在哪里”，但当前算法仅依据 clutter、曝光和边缘代理，没有人物、地面、遮挡、尺度、深度、安全或审美语义，因此表达强于证据。

### 5.3 确定性评分被表现为推荐结论

当前 score 是工程基线的加权代理，适合做诊断和未来候选预筛，不足以在真实环境中作为最终摄影推荐。尤其在无 AI 语义与美学判断时，不应把最高分包装为唯一最佳位置。

### 5.4 当前产物没有把“已准备的图片集合”作为一等输出

运行时虽然持有瞬时关键帧和 thumbnail URL，但持久化结果重点是 descriptor、region 和 opportunity，没有明确表达“哪些图片已准备好、它们沿相对 yaw 如何排列、后续 AI 可以消费哪些瞬时输入”。

## 6. 待确认的修订逻辑（尚未实现）

根据当前产品反馈，建议把 P1 的职责调整为以下三层。这里是供确认的方案，不是已完成事实。

### 6.1 图片准备层

目标：把 P0 接受的关键帧整理成后续能力可以消费的场景素材集合。

建议每张图只记录：

- `keyframe_id`；
- 相对 yaw；
- 原始尺寸与质量状态；
- 瞬时 thumbnail / pixel 是否在当前浏览器内存可用；
- descriptor 引用；
- privacy 状态。

导出和提交仍不得包含真实图像字节。未来 AI 被明确授权时，只通过 provider-neutral seam 消费当前会话中的瞬时图像。

### 6.2 诚实的 2.5D 场景搭建

当前输入只有旋转扫描的相对 yaw 和二维关键帧，没有深度与平移，因此建议只实现“相对航向弧线上的图片节点”：

- 按 yaw 排列全部关键帧；
- 展示覆盖范围、采样密度和图像节点；
- 允许以弧形/环形视觉表达方向关系；
- 明确 `depth=UNKNOWN`、`metric_geometry=NOT_SUPPORTED`；
- 不声称是真实 3D、相机轨迹或物理空间模型。

如未来存在被授权且验证过的深度/姿态算法，再在独立能力层补充真实几何；本任务不先伪造 3D。

### 6.3 候选标记层

目标：明确“这些是留待后续判断的候选”，而不是输出一个确定的最终位置。

建议：

- 候选视角不再依赖 region 数量，可从相对 yaw 覆盖中选择最多 3 个角度分散的代表帧；
- UI 显示“候选视角 / 待后续 AI 或用户判断”，取消 Top 1 最佳推荐语义；
- 每个候选帧只显示人物构图锚点标记，例如 LEFT / CENTER / RIGHT 的候选点或候选带；
- 不输出物理站位，不输出米制坐标，不把矩形当成可靠人物位置；
- 本地 descriptor 分数保留为诊断或预筛依据，不作为用户可见的最终审美结论；
- 若证据不足，可同时保留多个 anchor，而不是强行挑选唯一位置。

## 7. 需要产品负责人确认的问题

继续实现前需要确认以下逻辑：

1. P1 是否正式从“确定性 Top 摄影推荐”调整为“图片准备 + 2.5D 相对方向索引 + 多候选标记”？
2. 候选视角是否固定最多 3 个，并优先保证 yaw 方向分散，而不是要求算法判定审美优劣？
3. 每个候选视角的人物标记是显示多个可选锚点，还是仍允许本地代理筛成 1–2 个锚点？
4. 现有 score 和 reason codes 是否只保留在调试/导出中，不在主要 UI 中作为推荐强度展示？
5. 本阶段是否接受“2.5D 仅表示相对 yaw 弧线，不含深度和物理坐标”的定义？

## 8. 当前停点

当前安全停点为 `209da6eb9c2dfcec572b3d164b8ba4d3568b42de`。

收到产品逻辑确认前：

- 不继续修改 P1 runtime/UI；
- 不重跑 OPPO 接受门；
- 不关闭 P1；
- 不更新集成清单为可集成；
- 不启动 P1 之后的任务。

