# 向风行｜Final Action Hub 最终成片后链路与优先级设计记录 V1.0

**Document ID：** `XFX_FINAL_ACTION_HUB_PRIORITY_V1`  
**项目：** 向风行 AI Visual Director  
**文档类型：** 产品设计 / Final Result / 保存 / 分享 / 实体化 / 创作衍生 / 作品资产  
**版本：** V1.0  
**日期：** 2026-08-21  
**状态：** 第一版设计基线；后续能力通过配置逐步开放，不要求反复重构 Final 页面

---

# 0. 文档目的

本文件用于冻结向风行在完成：

```text
真实拍摄
↓
AI Reality+
↓
用户 Fine Tune
↓
My Final Photo
```

之后的 Final 后链路设计。

这一阶段已经不只是“结果页放几个按钮”，而是同时承担：

1. **交付**：用户把照片真正拿走；
2. **传播**：用户把作品分享出去；
3. **商业化**：将数字图片转为实体商品；
4. **继续创作**：视频、海报、AI Artwork 等衍生；
5. **长期资产沉淀**：作品库、再打印、再拍同款、复购。

因此 Final 页的目标不是一次性把所有功能展示出来，而是：

> # **搭建稳定的 Final Action Hub，页面结构保持克制，复杂能力在入口背后持续增加。**

---

# 1. Final 的正式起点：My Final Photo

经过：

```text
Accepted Capture
↓
AI Reality+
↓
User Fine Tune
↓
My Final Photo
```

`My Final Photo` 定义为：

> **用户最终确认、可保存、可分享、可打印、可继续衍生的正式数字母资产。**

后续所有动作都应该从 `My Final Photo` 派生，而不是覆盖原始资产。

---

# 2. Final 的五条后链路

完整结构：

```text
My Final Photo
        │
        ├── 01 Save
        │
        ├── 02 Share
        │
        ├── 03 Physical Product
        │
        ├── 04 Creative Derivative
        │
        └── 05 Works Library
```

分别对应：

## 2.1 Save

把正式成片保存到：

- 用户设备；
- 向风行作品库。

## 2.2 Share

把照片或作品卡分享至外部社交渠道，并为后续“拍同款”增长闭环预留入口。

## 2.3 Physical Product

把数字照片实体化，例如：

- 照片打印；
- 冰箱贴；
- 大头贴 / 照片条；
- 后续其他纪念品。

## 2.4 Creative Derivative

在正式真实照片基础上继续创作：

- 动态短片；
- 旅行海报；
- AI Artwork；
- 其他视觉衍生。

## 2.5 Works Library

将一次拍摄沉淀为长期 Visual Asset：

- 再下载；
- 再编辑；
- 再打印；
- 再做商品；
- 再拍同款；
- 再做创意衍生。

---

# 3. Final 页面不能随着业务增长越来越复杂

即使后台未来拥有：

```text
SAVE
SHARE
PHYSICAL
VIDEO
POSTER
ARTWORK
RE_SHOOT
PRINT
MAGNET
PHOTO_STRIP
POSTCARD
ACRYLIC
PHOTO_BOOK
...
```

Final 首屏也不应该把这些功能全部铺开。

推荐长期稳定保持：

```text
保存高清图
分享
做成实物
更多玩法
```

再加一个非按钮状态：

```text
✓ 已自动保存到「我的作品」
```

核心原则：

> # Backend Rich, Frontend Simple.

后台能力可以不断增加，前台主结构尽量不变。

---

# 4. Final Action 的三个层级

建议将全部后链路能力分为：

```text
第一层：立即完成
第二层：继续探索
第三层：长期资产
```

---

# 5. 第一层｜立即完成

这是用户刚刚完成照片以后，最直接的任务。

只保留：

## 5.1 保存高清图

最高优先级。

```text
[ 保存高清图 ]
```

默认保存：

> `My Final Photo`

而不是：

- Original Capture；
- 未 Fine Tune 的 Reality+；
- 其他中间版本。

---

## 5.2 分享

```text
[ 分享 ]
```

第一版只需要完成基本分享即可。

后续再增加：

- 分享作品卡；
- 小程序回流；
- “我也要拍这个”。

---

## 5.3 做成实物

```text
[ 做成实物 ]
```

Final 首屏不展开 SKU。

点击后进入：

# Product Sheet

例如：

```text
把这张带回家

照片打印
冰箱贴

────────────
更多以后开放
```

未来增加新 SKU 时：

> 不需要改变 Final 页结构。

---

# 6. 自动保存到「我的作品」

这是一个系统行为，而不是用户必须做的决定。

建议：

```text
My Final Photo
↓
Works Library
```

自动发生。

Final 页底部只展示：

> ✓ 已自动保存到「我的作品」

用户无需额外点击“收藏”才能继续使用这张资产。

---

# 7. 第二层｜继续探索

统一收纳到：

# ✦ 更多玩法

避免 Final 首屏出现：

- 视频；
- 海报；
- AI作品；
- 再拍；
- 滤镜；
- Live Photo；
- 文旅模板；
- 等大量入口。

点击“更多玩法”后再展示创意能力。

推荐：

```text
用这张继续创作

动态短片
旅行海报
AI 作品

────────────

再拍一个动作
再拍同款
```

---

# 8. P1 最值得优先增加的能力

## 8.1 分享作品卡

普通图片分享升级为：

```text
Final Photo
+
Target
+
地点
+
向风行品牌
+
拍同款入口
```

价值：

> **增长。**

未来形成：

```text
A 用户作品
↓
分享
↓
B 用户点击“我也要拍这个”
↓
Target Template
↓
B 自己的 Reality
↓
新作品
```

---

## 8.2 动态短片

```text
My Final Photo
↓
5～8 秒动态版本
↓
抖音 / 小红书 / 微信
```

价值：

> **传播。**

尤其适合抖音小程序后续承接。

---

## 8.3 旅行海报

可用于：

- 分享；
- 打印；
- 文旅；
- 纪念品；
- 景区合作。

价值：

> **创作 + 商业化。**

---

## 8.4 再拍同款

复用：

```text
SelectedTarget
+
部分 ShotDirection Template
```

重新分析：

```text
今天的人
+
今天的现场
```

价值：

> **留存 / 复购。**

---

# 9. 第三层｜长期资产

这一层主要由 Works Library 承担。

作品库不应该只是“向风行版手机相册”。

每个作品应该是：

# Visual Asset

可以包含：

```text
Original Capture
Reality+
Fine Tune Recipe
My Final Photo
Target
Scene
ShotDirection
Artwork
Video
实体商品
订单
```

用户以后可以：

- 再下载；
- 再编辑；
- 再打印；
- 再做冰箱贴；
- 再生成视频；
- 再做海报；
- 再拍同款。

---

# 10. 保存逻辑

保存建议分成两层。

## 10.1 保存到用户设备

动作：

> 保存高清图。

这是用户明确可感知的交付。

---

## 10.2 保存到向风行作品库

默认自动完成。

价值：

- 后续不用重复上传；
- 实体商品可直接复用；
- AI Artwork 可直接复用；
- 用户可再次下载；
- 可形成长期复购。

---

# 11. 分享逻辑

分享不能长期停留在“调用系统分享”。

建议分阶段：

## V1

普通图片分享。

## V1.1 / P1

作品卡分享。

作品卡可以包含：

```text
大图
Target 名称
地点
拍摄日期
向风行品牌
“我也要拍这个”
小程序入口
```

最终目标：

> # 分享本身成为 Growth Asset。

---

# 12. 图片实体化

图片实体化是向风行后续商业化的核心链之一。

第一阶段优先：

## 12.1 照片打印

优势：

- 供应链成熟；
- 实现简单；
- 用户理解成本低；
- 适合作为第一实体 SKU。

## 12.2 冰箱贴

优势：

- 比普通打印更具有纪念品属性；
- 特别适合旅行与文旅；
- 更容易形成溢价；
- 可以与地点 / 城市 / 景区模板结合。

## 12.3 大头贴 / 照片条

根据线下设备方向推进。

适合：

- 商场；
- 景区；
- 快闪；
- 大头贴机；
- 现场打印。

---

# 13. 实体化必须有 Product Preview

禁止：

```text
点击冰箱贴
↓
直接下单
```

建议：

```text
My Final Photo
↓
选择商品
↓
自动适配版式
↓
Product Preview
↓
用户移动 / 缩放
↓
确认
↓
下单
```

用户需要确认：

- 裁切；
- 人物位置；
- 边框；
- 文字；
- 日期；
- 地点。

---

# 14. Pure Photo Product 与 Designed Product

实体商品分两类。

## 14.1 Pure Photo Product

基本不重新设计：

```text
My Final Photo
↓
Crop
↓
Print
```

例如：

- 5寸照片；
- 6寸照片。

---

## 14.2 Designed Product

增加商品模板：

```text
My Final Photo
+
Product Template
+
Location
+
Date
+
Target
↓
Product Artwork
```

例如：

```text
广州 · 珠江
2026.08
```

或：

> 景区限定边框 / 城市限定视觉。

Designed Product 的商业空间明显更大。

---

# 15. Product Artwork

实体商品不应该直接修改 `My Final Photo`。

需要增加独立资产：

# Product Artwork

关系：

```text
My Final Photo
      ↓
Product Template
      ↓
Product Artwork
      ↓
Print-ready File
      ↓
Order
```

同一张正式照片可以派生：

- 6寸照片；
- 冰箱贴；
- 明信片；
- 大头贴；
- 亚克力；
- 旅行海报。

母图始终保持不变。

---

# 16. SKU 策略

第一阶段不建议建设大型商品商城。

推荐只做：

```text
照片打印
冰箱贴
大头贴 / 照片条（按设备节奏）
```

后续再增加：

- 明信片；
- 相框；
- 亚克力；
- 钥匙扣；
- 台历；
- 手机壳；
- 照片书。

原则：

> 先验证成交和供应链，再扩 SKU。

---

# 17. 实体商品履约链

实体业务需要独立完整链路：

```text
Product Selection
↓
Preview
↓
Specification
↓
Quantity
↓
Address / Pickup
↓
Payment
↓
Print-ready Asset
↓
Supplier
↓
Production
↓
Quality Check
↓
Shipping / Pickup
↓
After-sales
```

软件只覆盖前半段。

实体业务真正的复杂度最终会进入：

- 供应链；
- 打印品质；
- 色彩一致性；
- 物流；
- 售后。

---

# 18. Digital → Physical → Digital 回流

未来非常值得做：

实体商品上附带：

> 二维码 / 小程序码。

扫描后可以看到：

```text
数字照片
+
地点
+
日期
+
Target
+
动态版
+
再拍同款
```

形成：

```text
Digital
↓
Physical
↓
QR
↓
Digital
```

特别适合：

- 文旅；
- 城市纪念品；
- 景区限定商品。

---

# 19. Final Action Registry

建议 Final 页按钮不要写死。

后台定义：

```yaml
FinalAction:
  id:
  name:
  icon:
  group:
  priority:
  enabled:
  visible:
  badge:
  destination:
```

示例：

```yaml
- id: SAVE
  name: 保存高清图
  group: DELIVERY
  priority: P0
  enabled: true
  visible: true

- id: SHARE
  name: 分享
  group: GROWTH
  priority: P0
  enabled: true
  visible: true

- id: PHYSICAL
  name: 做成实物
  group: COMMERCE
  priority: P0
  enabled: true
  visible: true

- id: VIDEO
  name: 动态短片
  group: CREATIVE
  priority: P1
  enabled: false
  visible: false
```

以后能力上线时只改变配置：

```text
enabled = true
visible = true
```

而不重构 Final 页面。

---

# 20. Product Catalog

实体商品同样不应该写死。

建议：

```yaml
PHOTO_PRINT:
  enabled: true

MAGNET:
  enabled: true

PHOTO_STRIP:
  enabled: false

POSTCARD:
  enabled: false
```

未来不同渠道可以加载不同 Catalog。

---

# 21. Channel-aware Final Action

Final Action 排序不能永远固定。

未来不同渠道的最佳动作可能完全不同。

例如：

## 微信小程序

优先：

```text
保存
分享
实物
```

## 抖音小程序

优先：

```text
保存
动态短片
分享
```

## 大头贴机

优先：

```text
打印
冰箱贴
保存电子版
```

## 景区合作

优先：

```text
景区限定冰箱贴
照片打印
分享
```

因此建议：

```text
Action Priority
=
Base Priority
+
Channel Context
+
Scene Context
```

---

# 22. 场景化推荐

P1 以后可以根据场景推荐动作。

例如：

```text
旅行场景
→ 推荐冰箱贴

情侣
→ 推荐双人照片条

大头贴设备
→ 推荐现场打印

景区
→ 推荐景区限定纪念版

抖音入口
→ 推荐动态短片
```

第一版暂时不需要动态推荐。

只需要预留数据结构。

---

# 23. Final 页推荐结构

```text
             MY FINAL PHOTO

┌────────────────────────────┐
│                            │
│          最终大图           │
│                            │
└────────────────────────────┘

冷雾湖畔
广州 · 2026.08.21


        [ 保存高清图 ]


   [ 分享 ]       [ 做成实物 ]


        ✦ 更多玩法


✓ 已自动保存到「我的作品」
```

长期 Final 首屏保持这种克制结构。

---

# 24. Final 后链路完整闭环

```text
RealityContext
↓
SelectedTarget
↓
ShotDirection
↓
Realtime Guidance
↓
Capture QA
↓
Accepted Capture
↓
AI Reality+
↓
User Fine Tune
↓
MY FINAL PHOTO
        │
        ├── Save
        │
        ├── Share
        │      ↓
        │   Growth / 拍同款
        │
        ├── Physical Product
        │      ↓
        │   Print / Magnet / Photo Strip
        │
        ├── Creative Derivative
        │      ↓
        │   Video / Poster / AI Artwork
        │
        └── Works Library
               ↓
        Re-edit / Re-print /
        Re-create / Re-shoot
```

---

# 25. Final 功能优先级总表

| 优先级 | 能力 | 用户入口 | 首屏是否直接展示 | V1 建议 | 核心价值 | 后续扩展 |
|---|---|---|---:|---:|---|---|
| **P0** | 保存高清图 | 保存高清图 | ✅ | ✅ 必做 | 完成交付 | 原图/多尺寸下载 |
| **P0** | 自动作品库 | 系统自动 | 状态提示 | ✅ 必做 | 长期资产沉淀 | 分类、搜索、地图 |
| **P0** | 普通分享 | 分享 | ✅ | ✅ 必做 | 基础传播 | 作品卡、拍同款 |
| **P0** | 做成实物入口 | 做成实物 | ✅ | ✅ 预留/开放 | 商业化入口 | Catalog动态配置 |
| **P0** | 照片打印 | 实物 Sheet | ❌ | ✅ 优先 | 低门槛实体成交 | 多尺寸 / 现场取件 |
| **P0** | 冰箱贴 | 实物 Sheet | ❌ | ✅ 优先 | 旅行纪念 / 文旅 | 城市 / 景区限定版 |
| **P1** | 分享作品卡 | 分享 Sheet | ❌ | 后续 | 增长回流 | “我也要拍这个” |
| **P1** | 再拍同款 | 更多玩法 / 作品库 | ❌ | 后续 | 留存 / 复购 | Target Template |
| **P1** | 动态短片 | 更多玩法 | ❌ | 后续 | 社媒传播 | 5～8秒 / 多模板 |
| **P1** | 旅行海报 | 更多玩法 | ❌ | 后续 | 创作 + 商品化 | 文旅限定模板 |
| **P1** | AI Artwork | 更多玩法 | ❌ | 后续 | 创意增值 | 多风格 / 场景设计 |
| **P1** | 大头贴 / 照片条 | 实物 Sheet | ❌ | 按设备推进 | 线下即时消费 | 大头贴机联动 |
| **P1** | 重新打印 | 作品库 | ❌ | 后续 | 复购 | 一键复用旧订单模板 |
| **P1** | 再编辑 | 作品库 | ❌ | 后续 | 长期使用 | Fine Tune Recipe复用 |
| **P2** | 明信片 | 实物 Catalog | ❌ | 暂不开放 | SKU扩展 | 文旅 |
| **P2** | 亚克力 / 相框 | 实物 Catalog | ❌ | 暂不开放 | 高客单衍生 | 礼赠 |
| **P2** | 照片书 | 作品库 / 实物 | ❌ | 暂不开放 | 多图消费 | 旅行合集 |
| **P2** | 景区限定商品 | Context推荐 | ❌ | 商务合作后 | B2B2C | 景区主题模板 |
| **P2** | 实体二维码回流 | 商品背面 | ❌ | 后续 | Physical→Digital | 动态作品 / 拍同款 |
| **P2** | 多图作品册 | 作品库 | ❌ | 后续 | 长期资产 | 城市 / 旅行分类 |

---

# 26. Final Action 分组表

| Group | 含义 | 代表能力 | 用户价值 | 商业价值 |
|---|---|---|---|---|
| **DELIVERY** | 把结果交付给用户 | 保存高清图 | 拿到照片 | 基础满意度 |
| **GROWTH** | 把作品传播出去 | 分享、作品卡、拍同款 | 展示作品 | 获客 / 裂变 |
| **COMMERCE** | 从图片产生交易 | 打印、冰箱贴、大头贴 | 纪念品 | 直接收入 |
| **CREATIVE** | 继续扩大作品价值 | 视频、海报、AI Artwork | 更多玩法 | 增值收入 |
| **RETENTION** | 让用户以后回来 | 作品库、再编辑、再拍 | 长期管理 | 留存 / 复购 |

---

# 27. 不同渠道 Final 优先级示例表

| 渠道 | 第一优先 | 第二优先 | 第三优先 | 后续特色能力 |
|---|---|---|---|---|
| **微信小程序** | 保存高清图 | 分享 | 做成实物 | 微信作品卡 / 拍同款 |
| **抖音小程序** | 保存高清图 | 动态短片 | 分享 | 短视频传播模板 |
| **大头贴机** | 现场打印 | 冰箱贴 / 照片条 | 保存电子版 | 扫码回流线上作品库 |
| **景区合作** | 景区纪念品 | 保存 | 分享 | 景区限定冰箱贴 / 海报 |
| **纯线上普通用户** | 保存 | 分享 | 更多玩法 | Video / Artwork |

---

# 28. 实体商品第一阶段推荐表

| SKU | 第一阶段建议 | 供应链复杂度 | 用户理解 | 文旅价值 | 建议 |
|---|---:|---:|---:|---:|---|
| **照片打印** | 高 | 低 | 高 | 中 | **首批上线** |
| **冰箱贴** | 高 | 中 | 高 | **高** | **首批重点** |
| **大头贴 / 照片条** | 中 | 中 | 高 | 中 | 跟随设备方向 |
| 明信片 | 低 | 低 | 高 | 高 | P2 |
| 亚克力摆件 | 低 | 中高 | 中 | 中 | P2 |
| 相框 | 低 | 中 | 高 | 低 | P2 |
| 照片书 | 低 | 高 | 中 | 中 | P2 |
| 手机壳 | 低 | 高 | 中 | 低 | 暂缓 |

---

# 29. V1 推荐实施范围

Final V1 优先完成：

```text
01 My Final Photo 正式资产
02 自动作品库
03 保存高清图
04 普通分享
05 “做成实物”统一入口
06 照片打印 Product Preview
07 冰箱贴 Product Preview
08 Final Action Registry
09 Product Catalog 开关
10 为“更多玩法”预制入口
```

可以先不真实开放但预留：

```text
动态短片
旅行海报
AI Artwork
大头贴
拍同款
```

---

# 30. 当前最终产品结论

Final 不应该建设成：

> 一个随着业务增长无限增加按钮的结果页。

而应该建设成：

# Final Action Hub

长期保持少量一级入口：

```text
保存高清图
分享
做成实物
更多玩法
```

复杂能力分别长在：

- Share Sheet；
- Product Catalog；
- Creative Hub；
- Works Library；

里面。

这使向风行未来从：

```text
线上 AI 摄影
```

逐步扩展到：

```text
抖音
微信
大头贴机
文旅
冰箱贴
视频
海报
更多实体商品
```

时，不需要反复推翻 Final 页面。

---

# 31. 一句话总结

> ## **Final 首屏只负责“把下一步说清楚”，真正复杂的传播、商业化、创作和资产逻辑全部放在四个稳定入口背后持续生长。**
