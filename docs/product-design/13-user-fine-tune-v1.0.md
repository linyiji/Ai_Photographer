# 向风行｜用户 Fine Tune 最后一公里设计记录 V1.0

**Document ID：** `XFX_USER_FINE_TUNE_LAST_MILE_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 产品设计 / 图片后期 / 用户微调 / 非生成式编辑  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 第一版设计基线；后续修订追加版本，不静默覆盖

---

# 0. 文档目的

本文件用于冻结向风行在 `AI Reality+` 完成之后，用户进行“最后一公里”手动微调的第一版产品设计。

核心目标不是建设完整修图软件，而是：

> **AI 负责把照片做到专业可交付，用户负责把最后 5%～10% 调成自己真正喜欢的样子。**

最后一公里原则：

```text
AI Reality+
↓
用户确定性 Fine Tune
↓
My Final Photo
```

其中基础微调：

> **不调用生成式 AI。**

主要采用：

- 已有语义 Mask；
- 参数化图像处理；
- 局部 Mask；
- 实时预览；
- 非破坏式 Adjustment Recipe。

---

# 1. 为什么需要用户手动 Fine Tune

如果所有修改继续交给 AI：

```text
用户：脸再亮一点
↓
AI Edit
↓
重新生成 / 重处理
↓
等待
↓
重新判断结果
```

会产生：

- 生成成本；
- 等待；
- 结果随机性；
- 人脸 / 发丝 / 衣物被意外改变；
- Reality+ 已经很好时仍存在“毁图”风险；
- 用户缺少最后审美控制权。

而用户直接调整：

```text
拖动参数
↓
实时变化
↓
停在自己喜欢的位置
```

具有：

- 边际 AI 成本接近 0；
- 结果确定；
- 实时反馈；
- 易撤销；
- 用户参与感更强；
- 更适合“最后 5%”审美收口。

---

# 2. 正式产品原则

> # AI 负责“做到专业”，用户负责“调成自己喜欢”。

以及：

> # Parametric Adjustment 交给用户，Semantic Modification 才交给 AI。

---

# 3. Fine Tune 不做成完整修图工作台

向风行不应该复制：

- 美图秀秀；
- 醒图；
- Lightroom；
- Photoshop。

不建设：

- 曲线；
- HSL；
- 自由蒙版；
- 专业液化；
- 自由画笔；
- 多级色轮；
- 大量滤镜；
- 复杂图层；
- 贴纸 / 拼图 / 专业文字排版。

Fine Tune 的定位是：

> **“AI 已经做好了，你只调整哪里还差一点。”**

---

# 4. 一屏完成

推荐页面：

```text
               MY FINAL PHOTO

┌────────────────────────────┐
│                            │
│          Reality+          │
│                            │
└────────────────────────────┘


    整体    人物    背景    局部
     ●       ○       ○       ○


              明暗
      ─────────●────

              冷暖
      ──────●───────

              氛围
      ───────●──────


[ 按住看 Reality+ ]    [ 重置 ]

             [ 完成 ]
```

不通过多页面拆分。

---

# 5. 四种 Adjustment Scope

正式定义：

```text
ALL
PERSON
BACKGROUND
LOCAL_REGION
```

用户界面：

> **整体｜人物｜背景｜局部**

这些不是四个独立功能模块，而是：

> **“当前参数作用到哪里。”**

---

# 6. Scope 01｜整体

用于整张照片的大方向调整。

MVP 建议：

- 明暗；
- 冷暖；
- 氛围强度；
- 可选：轻量对比。

用户语言优先，不展示复杂摄影参数。

例如：

```text
暗一点 ← 明暗 → 亮一点

冷一点 ← 冷暖 → 暖一点
```

---

# 7. Scope 02｜人物

底层复用：

```text
Person Mask
Face Mask
Hair Mask
Outfit Mask
```

用户只看到：

- 人物亮度；
- 肤色；
- 肤质；
- 后续可选：人物立体感。

重点：

> 人物调整不应该影响背景。

---

# 8. Scope 03｜背景

底层使用：

```text
Background Mask
Sky Mask
Scene Mask
```

MVP 建议：

- 背景明暗；
- 鲜艳度；
- 轻量虚化。

重点：

> 背景调整不改变人物身份和主体视觉。

---

# 9. Scope 04｜局部

这是用于解决：

> **既不是整个人物问题，也不是整个背景问题的小区域问题。**

典型需求：

- 左脸偏暗；
- 裙摆某一块过黑；
- 右上角天空太亮；
- 湖面某一区域高光太强；
- 树下局部太暗；
- 建筑某块颜色太抢。

用户进入「局部」后：

> 图片上出现一个可调整矩形区域。

---

# 10. 局部框交互

基本动作：

### 单指拖动
移动局部区域。

### 双指缩放
放大 / 缩小区域。

### 边角拖拽
允许改变区域宽高。

区域不锁死正方形。

支持：

- 方形；
- 横向长方形；
- 纵向长方形。

---

# 11. 局部框不是 Crop

局部框定义为：

# Local Adjustment Mask

它不改变：

- 图片尺寸；
- 构图；
- 裁切范围。

它只决定：

> 当前参数影响照片的哪一块。

例如：

```text
脸部局部
+
Brightness +8
```

照片构图完全不变。

---

# 12. Local Mask 必须自动 Feather

不能使用硬矩形边界。

底层应：

```text
中心区域
100% Adjustment

↓

边缘逐渐衰减

↓

区域外
0%
```

即：

# Feathered Region

V1 不向用户开放：

- 羽化参数；
- Mask 硬度；
- 透明度。

系统自动采用合理软边。

---

# 13. 局部参数

MVP 建议最多：

- 明暗；
- 冷暖；
- 鲜艳度；
- 可选：柔和。

不要扩展成专业 Local Mask 工具。

---

# 14. 局部选择的视觉反馈

进入局部编辑时：

- 当前区域边框明显；
- 框外可以轻微压暗作为 Editing Overlay；
- 用户拖动参数时直接实时显示真实效果。

注意：

> Overlay 只属于编辑状态，不写入照片。

---

# 15. AI / CV 在 Fine Tune 中的角色

AI 不负责：

> 根据一句话重新生成照片。

AI / CV 只负责：

> **自动建立语义选区。**

例如：

```text
Reality+ Processing
↓
Semantic Masks

Person
Face
Hair
Outfit
Background
Sky
```

进入 Fine Tune 后直接复用。

因此用户点击：

> 人物

可以立即编辑。

无需等待：

> “AI 正在识别人像”。

---

# 16. AI 应该隐形存在

界面无需写：

> AI 已识别人像。

用户点击：

> 人物

画面里人物区域轻微 Highlight。

她自然知道：

> 现在只调人物。

---

# 17. 为什么不以“点照片自动识别对象”为 V1 主交互

未来可以支持：

> 点哪里调哪里。

但 V1 不建议作为主方式。

原因：

- 点头发时范围有歧义；
- 点衣服时是人物还是服装；
- 人物与栏杆交界容易误选；
- 小屏操作误触率较高。

因此 V1：

```text
整体
人物
背景
局部
```

是最稳定的主入口。

“长按图片 → 局部调整”可以作为 V1.1 快捷方式。

---

# 18. 局部区域数量限制

技术上可以无限创建，但产品上不建议。

V1 建议：

> **最多 3 个 Local Adjustment。**

例如：

```text
局部 1
脸部 +6 明度

局部 2
天空 -8 明度

局部 3
裙摆 +4 阴影
```

如果用户需要 8～10 个局部 Mask：

> 已经属于专业修图需求，应交给专业工具。

---

# 19. Safe Range

即使用户自己调整，也不能开放极端范围。

例如：

```text
人物亮度
-15 ～ +20
```

而不是：

```text
-100 ～ +100
```

肤质：

```text
0 ～ 30
```

避免：

- 过曝；
- 过度磨皮；
- 极端饱和；
- 极端虚化；
- 把照片调坏。

原则：

> **用户拥有控制权，系统控制危险范围。**

---

# 20. 不建议显示专业数值

用户无需看到：

```text
Exposure +0.37 EV
Temperature -420K
```

只需要：

```text
暗一些 ← ● → 亮一些

冷一点 ← ● → 暖一点
```

用户专注于画面，而不是参数。

---

# 21. 非破坏式编辑

Final Fine Tune 必须采用：

# Non-destructive Editing

不直接修改 Reality+ 原始资产。

建议：

```yaml
AdjustmentRecipe:

  global:
    brightness:
    warmth:
    mood:

  person:
    brightness:
    skin_tone:
    skin_retouch:

  background:
    brightness:
    saturation:
    blur:

  local:
    - region:
        x:
        y:
        width:
        height:
      feather:
      brightness:
      warmth:
      saturation:
```

点击“完成”时再 Render Final Photo。

---

# 22. 资产结构

```text
Original Capture
        ↓
AI Reality+
        ↓
User Adjustment Recipe
        ↓
My Final Photo
```

其中：

# Reality+

AI 自动专业精修结果。

# My Final Photo

Reality+ + 用户最后 Fine Tune 后确认的正式成片。

这个版本才是：

- 默认保存；
- 分享；
- 打印；
- 冰箱贴；
- 后续 AI Artwork；

的主要源资产。

---

# 23. 支持撤销 / 重置 / 原版对比

MVP 必须存在：

### Undo
撤销最近操作。

### Reset
恢复 Reality+ 默认。

### Compare
按住查看 Reality+。

这些功能比增加更多调色参数更重要。

---

# 24. Taste Data

用户手动调整会产生高质量偏好数据。

例如：

```yaml
UserVisualPreference:
  person_brightness: +0.07
  skin_retouch: +0.03
  background_brightness: -0.05
  warmth: -0.02
```

后续 Reality+ 可以把用户历史偏好作为默认参数初始化。

形成：

```text
第一次
AI Reality+
↓
用户 Fine Tune
↓
记录 Adjustment Recipe

第二次
AI Reality+
↓
参考个人历史 Recipe
↓
用户需要调得更少
```

---

# 25. Taste 可以反向影响拍摄

例如用户长期：

> 把人物调得更突出。

系统可以逐渐判断她偏好：

> 人物占比更大。

未来：

```text
Taste Profile
↓
Target Ranking
↓
ShotDirection
```

直接让摄影者：

> 拍得更靠近她的审美。

最终目标：

> 越来越少需要后期修正。

---

# 26. 参数调整 vs 语义修改

必须正式冻结：

## Parametric Adjustment

用户自己操作：

- 亮度；
- 冷暖；
- 饱和；
- 对比；
- 人物局部提亮；
- 背景压暗；
- 磨皮；
- 虚化；
- 裁切；
- Local Region。

特点：

> 确定、实时、低成本。

---

## Semantic Modification

AI 执行：

- 去路人；
- 删除大型物体；
- 补背景；
- 换天空；
- 改天气；
- 扩图；
- AI Artwork；
- 换服装；
- 新增视觉元素。

特点：

> 改变图片语义，需要明确进入 AI 能力。

---

# 27. Fine Tune 的产品边界

最后一公里不负责：

> 修复 AI Reality+ 的严重错误。

Reality+ 本身必须满足：

> **用户即使完全不调整，也能直接保存和分享。**

Fine Tune 只负责：

> “我个人更喜欢多一点 / 少一点。”

如果用户必须靠 Fine Tune 把 Reality+ 救回来：

> Reality+ 本身属于失败。

---

# 28. STEP 07 当前建议结构

```text
Accepted Capture

        ↓

AI Reality+
自动专业精修

        ↓

USER FINE TUNE
最后一公里

├─ 整体
├─ 人物
├─ 背景
└─ 局部
    ├─ 拖动
    ├─ 双指缩放
    └─ 参数调整

        ↓

MY FINAL PHOTO

        ↓

├─ 保存
├─ 分享
├─ 图片实体化
└─ AI Creative+
```

---

# 29. 第一版最终定义

> # **人物与背景在算法层必须分开，在产品层不拆成独立页面。**

用户只在同一个 Fine Tune UI 中切换：

```text
整体
人物
背景
局部
```

系统负责：

- 语义 Mask；
- Safe Range；
- Feather；
- 实时渲染；
- Undo / Reset。

用户负责：

- 调多少；
- 哪一块需要调；
- 最终确认。

生成式 AI：

> **不参与基础 Fine Tune。**

---

# 30. 一句话总结

> ## **AI 负责把照片做到专业，用户通过整体 / 人物 / 背景 / 局部四种作用范围，把最后一点审美差异调成自己的版本。**

这就是向风行图片后期“最后一公里”的 V1 产品基线。
