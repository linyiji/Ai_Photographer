# 02 — UI Visual Specification

## 1. Source of Truth

唯一视觉基线：

`prototype/ai-photographer-home-v1.html`

机器可读取尺寸：

`codex/HOME_DESIGN_TOKENS.json`

Taro 实现不得凭感觉重新换布局。

## 2. 基准画布

设计基准：

- Width: `390px`
- Height: `844px`
- 页面底色：`#F6F2EC`
- 外部预览底色：`#E9ECE7`

Taro：

```ts
designWidth: 390
```

390px 基准下，Design Tokens 中的 px 值按 1:1 使用。

## 3. Page

```text
top    24px
left   18px
right  18px
bottom 10px
bottom tab reserved 82px
```

Bottom Tab 不参与普通文档流。

## 4. Top Bar

- Height: `42px`
- Margin Bottom: `16px`
- Brand: `21px / 800`
- Gear: `40 × 40px`

## 5. Hero

固定，不随任何后端数据变化：

```text
height        276px
radius        32px
margin-bottom 9px
border        #ECE3D9
```

Hero 的视觉职责分为：

```text
Hero
├── Fixed Copy
└── Visual Stage
    ├── Weather Stage
    ├── Landmark Stage
    └── Dynamic Weather Overlay
```

## 6. Hero Fixed Copy

```text
width       62%
padding     18px 0 16px 16px
z-index     10
```

### Context Chips

- gap: `7px`
- height: `32px`
- horizontal padding: `10px`
- radius: `999px`
- font: `11px`

城市名称必须使用短城市显示名。

推荐服务端输出：

- 广州
- 北京
- 乌鲁木齐
- 呼和浩特

不要输出“广州市天河区”。

前端城市 Chip 必须有 `max-width` 与 ellipsis，不能挤压天气 Chip。

### Eyebrow

- Font: `9px`
- Weight: `700`
- Letter spacing: `.20em`
- Color: `#9AA59F`

### Hero Title

文案固定：

`AI 看看这里怎么拍`

Taro 正式实现优先使用：

`assets/hero-title-calligraphy.png`

原因：

- 不依赖客户端是否存在书法字体。
- 避免 H5 / 微信 / Android / iOS 字形变化。
- 不分发字体文件。

如果项目设计资产已有完全等价的标题图，允许替换资源，但像素结果必须与视觉基线一致。

### Description

- Text: `对准人物和环境，我来设计拍法。`
- Font: `13px`
- Line Height: `1.55`
- Max Width: `178px`
- Color: `#68776F`

### CTA Dock

```text
dock width   168px
dock height  52px
dock padding 4px
button       44px height
```

主按钮：

- Background: `#2F6B5B`
- Color: white
- Font: `14px / 700`

## 7. Weather Stage

固定视觉区域：

```text
width   46% of Hero
right   0
top     0
bottom  0
```

天气必须在右侧形成视觉感知，但向左使用渐隐桥接，不能出现硬分栏线。

天气不能改变 Hero 高度，也不能改变 Fixed Copy 宽度。

## 8. Landmark Stage

固定空间：

```text
width   136px
height  246px
right   4px
bottom -3px
z-index 9
```

所有城市地标都只能在这个空间内展示。

Landmark 不能：

- 撑大 Hero。
- 推动左侧内容。
- 修改 Stage 尺寸。
- 溢出 Hero。
- 因图片宽高比改变 Stage。

Landmark 必须：

- 保持比例。
- Bottom Center 对齐。
- contain 到固定 Stage。
- 使用透明 PNG/WebP。
- 图片切换使用 preload + crossfade。

## 9. Weather Z-order

```text
12  Rain / Snow Dynamic Overlay
10  Fixed Copy
 9  Landmark
 4  Haze
 2  Sun / Clouds
 0  Sky
```

Rain / Snow 虽然是 z=12，但其容器只占 Hero 右侧 46%，因此不得覆盖左侧文案。

## 10. Weather Visual States

### Sunny

- 天空更蓝。
- 顶部：`#C9E4F2`
- 金色太阳存在，但不能太亮。
- Sun: `58 × 58px`
- top: `21px`
- right: `-18px`
- opacity: `0.72`
- 太阳只作为环境光源，不作为天气 icon。
- 云量接近不可见。

### Cloudy

- 云明显比 Sunny 多。
- 五层大面积模糊云。
- 不使用小型卡通云 icon。
- 整体灰蓝、低饱和。
- 云层应形成“低云顶”感。

### Rain

- 灰蓝天空。
- 厚云 + haze。
- 雨滴为最顶层动态。
- 雨滴可以经过 Landmark 前方。
- 动态 overlay 只占右侧 46%。

### Snow

- 冷灰蓝天空。
- 厚云 + 偏白空气 haze。
- 雪花位于 Landmark 前方。
- 雪花有 2–5px 三层视觉深度。
- 下落中允许极轻横向漂移。

## 11. Reference Entry

- Height: `54px`
- Icon: `30 × 30px`
- Title: `13px`
- Subtitle: `10px`

## 12. 推荐拍法

Header：

- Height `38px`
- Title `19px / 800`
- “全部” `13px / 700`

Carousel：

```text
min-height 150px
max-height 178px
gap        11px
card width 250px
card radius 22px
```

V1 不允许为了后端图片比例改变卡片尺寸。

Cover 使用 crop/cover。

## 13. Bottom Tab

- Height: `82px`
- Columns: 3 equal
- Active: `#2F6B5B`
- Inactive: `#A6AFAB`

移动端有 Safe Area 时：

- 保持 Tab 上边界位置稳定。
- Safe Area 追加到底部内部 padding。
- 不压缩 82px 的主要点击区域。

## 14. 响应式

### Width ≤ 520px

页面直接铺满 viewport：

```text
width  100vw
height 100vh
radius 0
```

### Height ≤ 760px

允许使用 Tokens 中的 compact 值。

除此之外不得自行“优化布局”。

## 15. 禁止项

- 禁止 UI Library 默认 Button 替换当前按钮外观。
- 禁止自动 Dark Mode。
- 禁止把 Weather 做成独立天气卡。
- 禁止把 Landmark 做成背景大图。
- 禁止地标数据控制 CSS。
- 禁止把天气粒子铺到全屏。
