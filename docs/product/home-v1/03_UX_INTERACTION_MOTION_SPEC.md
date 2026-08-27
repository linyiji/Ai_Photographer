# 03 — UX / Interaction / Motion Specification

## 1. 动效原则

首页是摄影产品，不是特效页面。

动效只服务三个目标：

1. 让天气“活着”。
2. 让动态地标更新不跳变。
3. 给关键点击提供反馈。

除文档明确列出的动画外，不额外增加持续动画。

## 2. 页面首次进入

页面结构立即出现，不等待全部 API。

顺序：

```text
Local cache available
→ 立即渲染
→ 定位/天气刷新
→ 后台更新对应内容
```

禁止：

- 全页面 Loading。
- Hero 高度变化。
- 推荐区高度变化。
- LandmarkStage 从 0 高度展开。

## 3. CTA

Touch Down：

```text
scale 1 → 0.97
80–100ms
```

Release：

```text
scale 0.97 → 1
```

创建 session 时允许按钮文案短暂变成：

`正在准备摄影师…`

不要用大面积 spinner 替代按钮。

## 4. Weather Transition

天气状态发生变化：

- duration: `420ms`
- 属性：background / opacity / filter
- easing: `ease` 或现有视觉基线等价 easing
- 不重排布局

天气更新不能触发 Landmark 更新。

## 5. Sunny Motion

Sunny 不是太阳特效。

建议：

- Sun Disc 基本静态。
- Sun Bloom 可做 `8s` 左右轻微呼吸。
- opacity 波动不超过约 `±5%`。
- 不旋转。
- 不闪烁。
- 不做 lens-flare 大动画。

在 reduced motion 下保持静态太阳和蓝天。

## 6. Cloudy Motion

云层：

- 22–30s 慢速漂移。
- 单层水平位移约 6–12px。
- 不同云层速度略有差异。
- 云层不允许进入左侧固定文案区。

用户不应该明显感到“云在跑”。

## 7. Rain Motion

Rain 是顶层 WeatherDynamicOverlay。

规则：

- Overlay: Hero 右侧 46%。
- z-index: 12。
- Landmark: z-index 9。
- 因此雨滴会从 Landmark 前方经过。
- 左侧 Fixed Copy 不被覆盖。

建议参数：

```text
base drops      9
height          20px
angle           ~10deg
cycle           ~2.5s
opacity peak    ~0.86
```

雨量是 UI 氛围，不根据真实降水量细分。

首页没有“小雨 / 中雨 / 大雨”视觉状态。

## 8. Snow Motion

Snow 同样是顶层 WeatherDynamicOverlay。

规则：

- Overlay: Hero 右侧 46%。
- z-index: 12。
- Landmark: z-index 9。
- 12 个左右粒子即可。
- Size: 2–5px。
- Duration: 5.7–8.0s。
- 下落过程中横向 drift 约 ±8px。

雪花必须比雨滴慢。

不要做暴雪遮挡主体。

## 9. Landmark Change

Landmark 只在 `cityCode` 改变后更新。

更新流程：

```text
收到新城市候选 landmark
→ 选择 landmark
→ preload 新 asset
→ preload success
→ 当前 landmark opacity 1 → 0 (180–220ms)
→ 替换 src
→ opacity 0 → 1 (220–280ms)
```

Stage 尺寸不变。

如果新图片加载失败：

- 保留旧 Landmark 或 fallback。
- 不显示破图 icon。
- 不清空 Stage。

## 10. Location / Weather Chip

生产模式：

- Chip 是状态显示，不是天气选择器。

Prototype/Dev 模式：

- 允许点击天气 Chip 循环 4 种天气，方便视觉验收。

生产构建必须关闭天气手动切换。

## 11. 推荐拍法 Carousel

保持现有视觉行为：

- 横向拖动。
- snap 到卡片。
- 动画约 `420ms`。
- 滑动阈值约 `46px`。
- Auto rotate 允许保留，但用户交互后应重新计时。

如果产品认为自动轮播干扰摄影入口，可在正式版本关闭 Auto rotate；关闭时不得改变布局。

## 12. Reduced Motion

支持 `prefers-reduced-motion` 的平台：

- 禁止 rain/snow 持续运动。
- 禁止 cloud drift。
- Weather 状态仍通过静态天空、云、粒子表达。
- Landmark crossfade 可缩短为极短淡入淡出，但不要瞬间闪切。
