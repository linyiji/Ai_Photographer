# 向风行｜Prototype Global Design Foundation V1.0

**Document ID：** `XFX_PROTOTYPE_GLOBAL_DESIGN_FOUNDATION_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** Prototype Design System / Global UX / Visual / Motion / Interaction  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 第一版全局设计基线；后续 P01～P13 均引用本规范

> **Authority update (2026-08-31):** visual and interaction rules remain active, while Product Master Flow/module responsibility is governed by `82-product-master-flow-v2.md`. P01-P13 are screens supporting that flow, not a competing product-state authority.

---

# 0. 设计目标

向风行原型的基础设计统一围绕：

> **Warm Gallery × Dark Camera × Wind Teal Accent**  
> **暖白画册 × 墨黑相机 × 风青品牌色**

整体体验目标：

> **阅读时像画册，拍摄时像导航，调整时像一个极简照片编辑器。**

核心原则：

1. One Screen, One Decision；
2. Visual First；
3. AI Auto Advance；
4. State, not Form；
5. AI First, not AI Only；
6. Complexity Belongs to the System；
7. Motion is State Communication, not Decoration。

---

# 1. 视觉模式

## Decision Mode

适用于：

`P01 / P02 / P03 / P04 / P06`

特点：

- 暖白背景；
- 大图；
- 少量选择；
- Tap / Swipe / Confirm。

## Creation Mode

适用于：

`P05 / P07 / P08 / P09`

特点：

- 墨黑 / Camera；
- 大字实时指令；
- 少文字；
- Voice / Haptic；
- Auto Advance；
- 不做长页面滚动。

## Result Mode

适用于：

`P10 / P11 / P12 / P13`

特点：

- 作品优先；
- Review；
- Reality+；
- Fine Tune；
- 保存 / 分享 / 实体化。

其中 `P12 Fine Tune` 再进入 Dark Editing Mode。

---

# 2. Color Tokens

```text
PRIMARY                #3F8F84
PRIMARY_DARK           #286B63
PRIMARY_SOFT           #DCEDEA

BACKGROUND_LIGHT       #F7F6F2
BACKGROUND_DARK        #101312
SURFACE_DARK           #191D1B

TEXT_PRIMARY           #171A19
TEXT_SECONDARY         #6D7571
TEXT_ON_DARK           #F5F7F5

BORDER                 #E3E6E2

SUCCESS                #52A879
WARNING                #E4AD4E
DANGER                 #D65757

OPTIONAL_WARM_ACCENT   #CBA56A
```

颜色职责：

- 风青：品牌、AI Active、Selected、Guidance；
- 墨黑：Camera / Creation；
- 暖白：Decision / Result；
- 绿：Ready；
- 黄：Adjusting；
- 红：Safety；
- 暖沙：商品 / 文旅点缀，可选。

AI 不使用大面积紫蓝渐变。

---

# 3. Typography

V1 使用系统字体：

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "PingFang SC",
  "HarmonyOS Sans SC",
  "Microsoft YaHei",
  "Noto Sans CJK SC",
  sans-serif;
```

字重：

```text
Regular   400
Medium    500
Semibold  600
```

尽量不使用 700+。

## Typography Tokens

| Token | Size / Line Height | Weight | 使用 |
|---|---|---:|---|
| Display | 30 / 38 | 600 | 极少大标题 |
| Page Title | 24 / 32 | 600 | 页面主问题 |
| Section Title | 20 / 28 | 600 | Target / Result |
| Body Large | 17 / 26 | 400/500 | 核心说明 |
| Body | 16 / 24 | 400 | 正文 |
| Secondary | 14 / 21 | 400 | 辅助说明 |
| Caption | 12 / 18 | 400/500 | Tag / 日期 / 状态 |
| Button | 16 / 22 | 600 | CTA |
| Camera Instruction | 28 / 36 | 600 | 摄影者实时指导 |
| Subject Instruction | 32 / 40 | 600 | 被拍摄者提示 |
| Countdown | 64～72 | 600 | 3 / 2 / 1 |

---

# 4. Live 文案语言

实时指令：

> **动词优先 + 一个动作 + 4～10 个中文字。**

例如：

```text
往右一点
再后退一点
靠湖边一步
身体侧一点
慢慢回头
看镜头
很好，保持
现在拍
```

原因说明放到 Secondary Layer，不进入 Live 主界面。

---

# 5. Buttons

## Primary

```text
Height   52px
Radius   14px
Font     16 / 22 / 600
BG       #286B63
Text     #F7F6F2
```

## Secondary

```text
Height   44～48px
```

白底 / Border；Dark Mode 使用半透明 Surface。

## Touch Area

任何可点击区域最少：

`44 × 44px`

---

# 6. Bottom Sheet

用于：

- 为什么推荐；
- Target 调整；
- Taste Feedback；
- 商品选择；
- 更多玩法；
- Secondary 信息。

统一：

```text
Top Radius  24px
Motion      240～280ms
```

---

# 7. Navigation

进入 Creation Session 后：

> 隐藏普通底部导航。

Back 不等于浏览器 History，而是：

> **Product State Transition**

例如 P08 Back 可回 P07 Shot Blueprint，而不是逐条回上一条 Guidance。

---

# 8. Target Interaction

P06：

- 一屏一个主 Target；
- 左右露出 8%～12% 邻卡；
- 横向 Swipe；
- Dot Indicator；
- 风青 Selected；
- 用户必须点击“就拍这个”明确确认。

---

# 9. Reality Scan

流程：

```text
看人物
↓
系统确认
↓
👤 ✓
↓
自动进入看现场
```

若信息不足，不打开表单，直接要求补充：

> 再往后一点，让我看到完整穿搭。

---

# 10. Shot Blueprint

P07 是：

> **预演 / Preview**

不是专业参数编辑器。

统一结构：

```text
Target Mini Reference
↓
Visual Blueprint
↓
当前最重要的一句话
↓
开始现场指导
```

---

# 11. Live Director

核心规则：

> **用户不点“完成”，系统判断完成。**

例如：

```text
Camera进入Acceptable Zone
持续 > 600ms
↓
Camera Ready
↓
自动切换下一Instruction
```

Live 主表达只使用：

- 文字；
- 箭头；
- Ghost Zone；
- 状态灯；
- Voice；
- Haptic。

---

# 12. Voice Policy

核心：

> **One Active Speaker**

双手机：

- Subject：Voice First；
- Photographer：Visual + Haptic。

单手机：

- Photographer 看 Visual；
- Subject 听 Voice。

Solo：

- Voice First。

一次只说一件事。

---

# 13. Haptic Semantics

| Event | Haptic |
|---|---|
| Target选中 | Light |
| Camera Ready | Light |
| Subject Ready | Light |
| Both Ready | Medium |
| Capture | Shutter |
| QA PASS | Light Success |
| Safety | Strong / Double |
| Error | Medium |

---

# 14. Safety

Safety 抢占全部普通 Guidance。

发生风险：

```text
Camera Overlay 暗下
↓
Danger Banner
↓
Strong Double Haptic
↓
Voice Warning
```

正常 Instruction 暂停。

恢复安全后回原 Session State。

---

# 15. Fine Tune

统一 Scope：

```text
整体
人物
背景
局部
```

交互：

- Tap：Scope；
- Slider：参数；
- Hold：查看 Reality+；
- Reset / Undo；
- Local：拖动 / Pinch / 调整矩形。

进入 Local 后锁定图片 Zoom，避免 Pinch 冲突。

基础 Fine Tune 不调用生成式 AI。

---

# 16. Motion System

核心：

> **Motion is State Communication, not Decoration.**

五类：

1. Transition Motion；
2. State Motion；
3. Guidance Motion；
4. Feedback Motion；
5. Ambient Motion。

## Motion Tokens

```text
MOTION_INSTANT     80ms
MOTION_FAST        160ms
MOTION_BASE        220ms
MOTION_PAGE        280ms
MOTION_REVEAL      360ms
MOTION_AI_RESULT   600ms
```

气质：

```text
Decision   Smooth
Creation   Responsive
Result     Satisfying
```

一句话：

> **选择时柔和，拍摄时直接，完成时有仪式感。**

---

# 17. Reality Scan Motion

人物识别：

```text
轮廓逐渐闭合
↓
风青Flash
↓
● → ✓
↓
“看懂了”
↓
自动进入Scene
```

Scene Anchor 轻量出现：

```text
✓ 湖面
✓ 山谷
✓ 可拍区域
```

随后弱化。

---

# 18. Target Motion

Reality First：

```text
Scene Freeze
↓
轻缩
↓
这里可以这样拍
↓
Target Crossfade / Morph
```

Target Carousel：

- 主卡 Scale 1.00；
- 邻卡 Scale 0.94；
- 邻卡 Opacity 0.75。

Target Confirm：

```text
1.00 → 0.985 → 1.00
```

随后通过 Shared Element Transition 缩成 P07 Target Mini Reference。

---

# 19. Shot Blueprint Motion

进入：

```text
Scene Base
↓
Subject Anchor
↓
Camera Anchor
↓
Relation Line
↓
Movement Path
```

Motion Shot 可播放 2～3 秒轻量 Choreography Loop。

---

# 20. Guidance Motion

箭头每 900～1200ms 向目标方向偏移约 4～6px，再回位。

Ghost Zone：

```text
White Dashed
↓
接近Target时风青增强
↓
Ready变风青实线
↓
Light Haptic
```

形成 Magnetic Feedback。

---

# 21. Ready Motion

```text
●
↓
轻扩散
↓
✓
```

约 180～220ms。

双角色均 Ready 时：

```text
👤 ✓      📱 ✓
```

轻微向中间靠拢，并显示：

> 准备好了

然后自动进入下一状态。

---

# 22. Story-specific Motion

## Story C｜Single Device

Photographer Ready 后：

```text
Visual Instruction弱化
↓
🔊 正在指导她
↓
Subject Voice开始
```

## Story D｜Solo

Camera Stability：

```text
○ → ◔ → ◑ → ◕ → ●
```

稳定后：

> 手机放好了 ✓

Camera四角进入 Lock状态。

## Story E｜Recovery

QA：

```text
位置 ✓
机位 ✓
构图 ✓
回眸 ×
```

正确项保持，失败项 Morph 为：

> 这次回头慢一点。

强调不从头重来。

## Story F｜Difficult Scene

背景状态：

```text
背景 ● 杂乱
↓
背景 ◐
↓
背景 ✓ 更干净
```

随着摄影者移动，干扰 Anchor 淡出。

---

# 23. Capture / QA Motion

Capture：

```text
Shutter
↓
Camera Freeze
↓
Light Dark Flash
↓
Frame缩成Photo
↓
Review
```

约 260～320ms。

连拍：

- 图片轻叠；
- 推荐图向前；
- 其他图后退；
- 显示“更推荐这张”。

---

# 24. Reality+ Signature Motion

Reality+ 第一次完成：

> Before / After Reveal

例如左 → 右 Light Sweep。

约 500～700ms。

只用于首次 Reality+ Reveal，不用于 Slider 微调。

---

# 25. Fine Tune Motion

Slider：

> 实时变化。

Scope切换：

> Mask Highlight约200ms后弱化。

Local：

```text
中心点
↓
展开成区域框
```

约180ms。

Hold Compare：

```text
当前版
↔
Reality+
```

80～120ms快速Crossfade。

---

# 26. Fine Tune → Final

点击完成：

```text
编辑控件淡出
↓
照片轻缩
↓
暖白背景出现
↓
标题
↓
地点 / 日期
↓
Final Actions
```

Final Actions 使用轻量 Stagger Reveal，总时长约350～450ms。

---

# 27. AI Ambient Motion

统一品牌 AI Working 状态：

`✦ AI Breath`

```text
Scale   0.9 → 1.05 → 0.9
Opacity 0.55 → 1 → 0.55
Period  1.6～2.0s
```

仅用于：

- 理解；
- 规划；
- 后期处理。

---

# 28. AI Processing

小于约3秒：

```text
✦ 正在看看这里怎么拍
```

不显示百分比。

超过约4秒：

```text
正在理解现场…
正在整理拍摄方案…
```

禁止假百分比进度。

---

# 29. 信息曝光等级

## Level 0｜Machine Only

```text
subject_scale
yaw
confidence
difference_vector
```

## Level 1｜State

```text
人物 ✓
机位 调整中
```

## Level 2｜Action

```text
往右一点
```

## Level 3｜Explanation

用户主动展开“为什么”后再展示。

---

# 30. Accessibility

必须：

- 颜色 + 图形 + 文字共同表示状态；
- 户外高对比；
- Camera Overlay 有深色底；
- Instruction 大字号；
- Button ≥ 44px；
- Voice 可关闭；
- Voice关闭后仍可通过 Visual / Haptic完成；
- Safety提供高优先视觉与震动。

---

# 31. Prototype 实现原则

真实 CV 尚未实现时，Prototype 可以用：

> **State Machine 模拟现实判断。**

内部 Demo Controls 可包括：

```text
模拟摄影者移动
模拟人物到位
模拟Pose完成
模拟QA失败
模拟Safety
```

正式用户界面不展示这些控制。

---

# 32. 第一阶段必须实现的动态

1. Reality Scan → Ready；
2. Target Carousel；
3. Target → Blueprint Shared Element；
4. Blueprint Anchor / Path绘制；
5. Live Arrow Pulse；
6. Ghost Zone Ready吸附；
7. Dual Ready Sync；
8. Capture → Review；
9. Reality+ Before/After Reveal；
10. Fine Tune实时反馈；
11. Fine Tune → Final Gallery；
12. Safety Interrupt。

---

# 33. 最终总结

视觉：

> **Warm Gallery × Dark Camera × Wind Teal Accent**

字体：

> **系统无衬线 + 少量字重 + Live大字号**

交互：

> **One Screen / Auto Advance / Visual First / State-driven**

声音：

> **One Active Speaker**

动态：

> **选择时柔和，拍摄时直接，完成时有仪式感。**

总原则：

> **能自动就不让用户确认；能看懂就不解释；能用视觉表达就不依赖长文字。**
