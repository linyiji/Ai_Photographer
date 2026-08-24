# 向风行｜AI 后期介入范围与 Reality+ 分层设计记录 V1.0

**Document ID：** `XFX_AI_POST_PRODUCTION_INTERVENTION_POLICY_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 产品策略 / AI 后期 / 生成式设计边界  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 第一版设计基线；后续修订应追加版本，不静默覆盖

---

# 0. 文档目的

本文件用于冻结向风行在完成真实拍摄之后，AI 对照片进行后期介入的第一版产品边界。

这里决定的不是单纯“修图修多重”，而是：

> **向风行最终到底是一款 AI 帮用户把现实拍好的产品，还是一款拿现实照片重新生成作品的产品。**

如果后期边界不清楚，会直接削弱前面已经建立的：

```text
Reality Understanding
→ Target
→ Shot Direction
→ Realtime Guidance
→ Capture QA
```

因为如果最终 AI 可以完全重新生成：

```text
Bad Capture
→ AI Recreate
→ Same Final Result
```

那么用户会自然产生问题：

> “既然后面都能生成，前面为什么还要认真站位、构图、摆动作？”

因此必须确保：

# Better Capture → Better Final Result

真实拍摄行为必须对最终结果存在明确因果价值。

---

# 1. 核心原则：Capture Causality

最终结果必须继承真实拍摄中已经完成的核心信息，包括：

- 人物身份；
- 当天穿搭；
- 实际动作；
- 真实构图；
- 人物与背景关系；
- 实际场景；
- 拍摄时的主要光线条件；
- 摄影者通过 Guidance 得到的视觉结果。

因此：

> **AI 后期首先应该把“刚刚真正拍到的照片”做得更好，而不是把它当成一个重新生成的 Prompt 素材。**

---

# 2. 两类 AI 行为必须分开

## 2.1 Enhancement

目标：

> **把真实拍摄结果做到它本来应该有的最好状态。**

产品名称建议：

# Reality+

照片仍然代表：

> “刚才真实发生的那一刻。”

AI 主要承担专业摄影后期、修图和 Target-aware 调整。

---

## 2.2 Creation

目标：

> **以真实 Capture 为素材，进一步创造现实中没有完全发生过的视觉作品。**

产品名称建议：

# AI Artwork

允许更多生成式设计：

- 重新设计光影；
- 天气；
- 环境扩展；
- 场景视觉重构；
- 新增视觉元素；
- 海报化；
- 动态化；
- 文旅限定视觉；
- 商品衍生。

核心区别：

```text
Reality+
=
让现实变得更好

AI Artwork
=
基于现实重新设计
```

---

# 3. 默认结果必须是 Reality+

向风行目前真正的产品差异化已经不是“AI 写真生成”。

而是：

> **AI 真正在现场帮助普通人完成专业摄影判断。**

因此默认 Final Result 必须让用户感觉：

> “这是我们刚才真的拍出来的，只是 AI 帮我做成了专业摄影师会交付的样子。”

Reality+ 是向风行摄影价值链的最终证明。

---

# 4. AI 后期介入建议分为三级

建议正式形成：

```text
Level 1
Reality Retouch
真实精修

        ↓

Level 2
Director+ / Creative Enhancement
导演增强

        ↓

Level 3
AI Artwork
AI 作品
```

---

# 5. Level 1｜Reality Retouch

定义：

> **不改变拍摄事实，只修正技术和审美缺陷。**

## 5.1 人物允许默认处理

包括：

- 曝光；
- 肤色；
- 轻微磨皮；
- 黑眼圈；
- 小痘痘；
- 飞发；
- 衣服小褶皱；
- 局部阴影；
- 面部亮度；
- 头发细节；
- 小范围污点。

默认不做：

- 换脸；
- 大幅瘦脸；
- 改五官；
- 改身材；
- 拉长腿；
- 改胸腰臀比例；
- 换发型；
- 换衣服。

---

# 6. 环境在 Reality+ 中可以更自由

默认允许：

- 删除小路人；
- 删除垃圾桶；
- 清理小电线；
- 清除地面小杂物；
- 删除小广告牌；
- 删除小面积车辆干扰；
- 曝光调整；
- 天空层次增强；
- 色温；
- 雾霾改善；
- 景深轻微强化；
- 局部高光；
- 轻微透视；
- 小范围构图修正。

形成产品原则：

# Identity Conservative, Environment Flexible.

中文：

> **人物身份处理保守，环境视觉可以更灵活。**

原因是用户对于人物“像不像自己”的敏感度，远高于对环境小元素变化的敏感度。

---

# 7. Level 2｜Director+ / Creative Enhancement

这一层不是普通修图，也还没有进入完全重新生成。

它回答：

> **如果现场真的有一位专业摄影师 + 高级后期，他会怎样把这张照片进一步推近 SelectedTarget？**

允许处理：

## 7.1 光线设计

例如：

- 人物轻微提亮；
- 背景轻微压暗；
- 强化主体与环境层次；
- 非常轻的轮廓光增强。

## 7.2 Target-aware Color Grading

不是统一套滤镜。

根据不同 Target 调整不同视觉方向。

例如：

### 冷雾湖畔

- 湖面保持冷灰；
- 黑色服装保持深色；
- 绿色干扰降低；
- 肤色保持自然；
- 整体低饱和、克制。

### 夏日黑裙海岛

- 肤色更明亮；
- 蓝海更清透；
- 高光更活跃；
- 黑色衣服仍然保留层次。

---

# 8. Target-aware Retouch 是核心差异化

普通修图 App 通常只看到：

> 一张照片。

向风行可以同时拥有：

```text
RealityContext
SelectedTarget
ShotDirection
CaptureShotState
CaptureQA
AcceptedCapture
```

因此系统知道：

- 为什么拍这张；
- 原来想拍成什么；
- 哪些部分已经拍对；
- 哪些部分需要修；
- 哪些东西绝不能破坏。

这使后期可以从：

> “一键增强”

升级为：

# Target-aware Retouch

---

# 9. Reality+ 的推荐正式定义

建议：

# Reality+ = Technical Retouch + Target-aware Creative Direction

它不是传统意义的“原图轻修”。

而是：

> **保持现实真实性前提下的导演级自动后期。**

---

# 10. 更强 AI 设计仍然应该存在

结论：

# 需要。

但不应该全部混入默认 Reality+。

原因是 AI 创作还有独立价值：

- 分享；
- 小红书 / 抖音传播；
- 头像；
- 海报；
- 文旅；
- 大头贴；
- 冰箱贴；
- 明信片；
- 纪念品；
- 动态视频。

因此更强生成能力应该进入：

# AI Artwork Branch

---

# 11. AI Artwork 可以增加的设计能力

例如：

## 11.1 光线重新设计

阴天 → 更戏剧性的侧光。

## 11.2 天气设计

- 雾气增强；
- 小雪；
- 轻雨；
- 黄昏氛围。

## 11.3 环境延展

- 清除大量杂乱元素；
- 延展街景；
- 强化建筑透视；
- 扩展湖面 / 天空。

## 11.4 叙事元素

- 花瓣；
- 风；
- 发丝运动；
- 远处灯光；
- 雨雾；
- 电影灯光。

## 11.5 海报化与商业衍生

- 文旅限定海报；
- 城市纪念视觉；
- 景区限定 Artwork；
- 大头贴；
- 冰箱贴；
- 视频封面；
- 动态短片。

---

# 12. AI Artwork 仍然需要 Anchor

即使进入创作层，也不能完全脱离真实拍摄。

建议至少固定四类 Anchor：

# Identity Anchor

必须还是本人。

# Outfit Anchor

默认仍然是当天穿搭；除非用户明确要求更换。

# Scene Anchor

仍然与真实拍摄地点保持可识别关系。

# Pose / Capture Anchor

优先继承真实照片的动作、视线和主要构图。

因此 AI Artwork 推荐：

```text
AcceptedCapture
+
Creative Transformation
```

而不是：

```text
Person Anchor
+
Text Prompt
→
完全重新生成
```

---

# 13. 推荐完整后期分层

```text
Accepted Capture
        ↓

① Reality+
真实导演精修

        ↓

② Creative+
更强氛围设计

        ↓

③ AI Artwork
作品化创作
```

区别：

## Reality+

现实基本不变。

## Creative+

仍然可以被用户理解为：

> “这是我刚才拍的照片。”

但光线、环境、色彩、扩图等明显更加完整。

## AI Artwork

用户理解为：

> “这是基于刚才真实照片做出来的一件视觉作品。”

---

# 14. 不建议使用“AI强度 0～100”

用户并不能理解：

```text
AI 强度 63%
```

产品语言更应该是：

### 自然精修

> 保持刚拍的感觉。

### 导演增强

> 光线、色彩、环境更接近 Target。

### AI作品

> 允许更多生成式设计。

---

# 15. 默认结果页建议

用户拍摄成功后直接自动获得：

# Reality+

结果页：

```text
[ Reality+ 大图 ]

这张已经帮你自然精修好了。

[ 保存 ]

[ 更有感觉一点 ✦ ]

[ 做成 AI 作品 ✦ ]
```

即：

> 默认给用户一个安全答案，再允许主动进入更强 AI。

---

# 16. 人物几何修改必须属于 User Override

例如：

- 瘦脸；
- 瘦身；
- 长腿；
- 调整身体比例。

商业上会有需求，但不应该默认发生。

建议入口：

```text
人物优化
→ 自然 / 精致 / 明显
```

或者更具体：

- 脸部；
- 身形；
- 腿部比例。

这些必须明确属于：

# User Override

而不是 AI 自动决策。

---

# 17. 换脸 / 换衣服 / 换发型属于 AI Design

这些都不应该被称为：

> 精修。

应该属于明确的创作功能：

# AI Design

例如：

- 换旅行造型；
- 换礼服；
- 换发型；
- 海报版本；
- 主题作品。

用户必须清楚知道：

> 当前操作正在“创作”，而不是“还原”。

---

# 18. Intervention Matrix V1

| 修改对象 | Reality+ 默认 | Creative+ | AI Artwork |
|---|---:|---:|---:|
| 曝光 / 白平衡 | ✅ | ✅ | ✅ |
| 色彩风格 | 轻 | 强 | 自由 |
| 肤色 | ✅ | ✅ | ✅ |
| 小瑕疵 | ✅ | ✅ | ✅ |
| 小飞发 | ✅ | ✅ | ✅ |
| 明显瘦脸 | ❌ | 用户选择 | 用户选择 |
| 身材比例 | ❌ | 用户选择 | 用户选择 |
| 五官形状 | ❌ | 默认不做 | 用户明确选择 |
| 小路人 | ✅ | ✅ | ✅ |
| 环境垃圾 | ✅ | ✅ | ✅ |
| 大型建筑删除 | ❌ | 谨慎 | ✅ |
| 天空替换 | ❌ | 轻微 | ✅ |
| 天气变化 | ❌ | 轻微 | ✅ |
| 景深增强 | 轻度 | ✅ | ✅ |
| 光线重设计 | 轻 | ✅ | ✅ |
| 构图扩展 | 小范围 | ✅ | ✅ |
| 增加虚构元素 | ❌ | 极少 | ✅ |
| 换衣服 | ❌ | ❌ | 用户明确选择 |
| 换发型 | ❌ | ❌ | 用户明确选择 |
| 背景整体替换 | ❌ | ❌ | 可选 |

---

# 19. Semantic Distance

判断 AI 是否改过头，不应该只看：

> 修改了多少像素。

更重要的是：

# Semantic Distance

即：

> **最终图片距离真实 Capture 的“事实”有多远。**

例如：

### 删除垃圾桶

像素变化可能很多，但 Semantic Distance 很低。

### 白天变成暴雪夜晚

视觉漂亮，但 Semantic Distance 极高。

因此后期管理的核心，不只是图像改动面积，而是：

> **是否改变了用户对“当时发生了什么”的理解。**

---

# 20. Reality Fact Lock

Reality+ 至少锁定：

```text
WHO
谁

WHAT WORE
穿什么

WHERE
在哪

POSE
当时什么动作

MAJOR COMPOSITION
主要构图关系

TIME / WEATHER CLASS
大致时间和天气类别
```

允许美化。

但不默认改写事实。

例如：

原来是阴天：

> 可以变成更漂亮的阴天。

不应该默认变成：

> 黄金落日。

后者应进入 Creative+。

---

# 21. 文旅商业价值

该结构天然适合文旅。

例如：

```text
真实景区拍摄
↓
Reality+
真实旅行照片
↓
景区限定 AI Artwork
↓
电子纪念照
↓
冰箱贴
↓
大头贴
↓
旅行海报
↓
动态视频
```

因此：

> 不能砍掉 AI 创作能力。

但必须保护真实摄影链路。

---

# 22. 两层核心价值

## 第一价值层

# “真的帮我拍好了。”

这是向风行的产品核心。

## 第二价值层

# “还能把刚刚这张做成现实里做不到的作品。”

这是增值、传播和商业化价值。

顺序不能反。

---

# 23. 收费结构也可以因此分层

例如：

## 基础

AI 导演拍摄 + Reality+ 高清成片。

## 增值

Creative+ / AI Artwork / 多视觉版本 / 动态视频。

## 实体

- 大头贴；
- 相纸；
- 冰箱贴；
- 明信片；
- 文旅纪念品。

后期深度本身可以形成商业价格梯度。

---

# 24. 资产必须分层保存

不建议只有：

```text
final.jpg
```

建议：

```text
Original Capture
原始拍摄
        ↓
Reality+
正式真实精修版本
        ↓
Artwork
创意衍生作品
```

形成明确 Lineage：

```text
CaptureAsset #A83
    ↓
RealityPlus #R21
    ↓
Artwork #W09
```

---

# 25. Reality+ 是底片，Artwork 是衍生资产

Reality+ 应该相对稳定。

Artwork 可以持续重复生成：

```text
同一 Reality+
↓
夏日电影版
↓
旅行海报版
↓
夜景版
↓
动态视频版
↓
冰箱贴版
```

所以二者在数据层也必须分开。

---

# 26. STEP 07 推荐流程

```text
Accepted Capture
        ↓
AI Post-production Analysis
        ↓
Reality+  ← 默认
        │
        ├── 保存 / 分享
        │
        ├── 再精致一点
        │
        ↓
Creative+
        │
        ├── 保存 / 分享
        │
        ↓
AI Artwork
        │
        ├── 海报
        ├── 动态视频
        ├── 大头贴
        └── 冰箱贴
```

---

# 27. Reality+ 应继承完整上下文

生成 Reality+ 不应该只输入：

```text
AcceptedCapture
```

而应该继承：

```text
AcceptedCapture
+
Person Anchor
+
SelectedTarget
+
RealityContext
+
ShotDirection
+
CaptureQA
+
User Preferences
```

系统因此知道：

- 谁不能变；
- 哪些问题要修；
- 哪些东西已经很好不能破坏；
- Target 是什么；
- 最终视觉应该向哪里靠近。

---

# 28. 后期建议拆成两个 Engine

## Reality Enhancement Engine

负责：

```text
Technical Correction
Identity Preservation
Skin / Hair / Outfit Refinement
Environment Cleanup
Target-aware Color
Target-aware Light
Minor Crop / Expand
```

目标：

# Best Version of Reality

---

## Creative Artwork Engine

负责：

```text
Creative Lighting
Weather
Atmosphere
Scene Redesign
Generative Expansion
Visual Storytelling
Posterization
Dynamic Derivatives
```

目标：

# Best Creative Version Derived from Reality

---

# 29. 当前正式原则

## Principle 01

默认不重新创造人物。

## Principle 02

环境可以比人物更自由地优化。

## Principle 03

Reality+ 必须证明前面的摄影 Guidance 有价值。

## Principle 04

更强生成能力必须存在，但作为用户主动选择的 AI Artwork。

## Principle 05

系统不能偷偷跨越：

```text
真实精修
→
AI 创作
```

用户必须知道当前结果属于哪一层。

---

# 30. 第一版最终定义

向风行后期链路不应该在：

> Reality 和 AI

之间二选一。

而应该形成：

# **先把现实拍好 → 再把现实修好 → 最后才允许 AI 把它变成作品。**

这个顺序既保护前面的 AI Visual Director 核心价值，又保留生成式 AI、文旅、视频、大头贴、冰箱贴等商业化空间。

---

# 31. 一句话总结

> ## **Reality+ 是正式摄影结果，AI Artwork 是基于这个结果继续生长出来的创意资产。**

二者必须同时存在，但不能混为一件事。
