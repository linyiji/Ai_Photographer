# 09 — QA Acceptance Checklist

## A. Visual Baseline

- [ ] 390×844 下页面与 `prototype/ai-photographer-home-v1.html` 肉眼一致。
- [ ] 页面背景为 `#F6F2EC`。
- [ ] Hero 高度 276px。
- [ ] Hero radius 32px。
- [ ] 左侧文案位置未因 Taro 重构变化。
- [ ] CTA 尺寸、位置、圆角一致。
- [ ] 推荐拍法卡片尺寸一致。
- [ ] Bottom Tab 高度一致。
- [ ] 无第三方 UI Library 默认样式污染。

## B. Fixed Copy

- [ ] 标题固定为 `AI 看看这里怎么拍`。
- [ ] 描述固定为 `对准人物和环境，我来设计拍法。`
- [ ] CTA 固定为 `开始拍摄 →`。
- [ ] 只有 city/weather 文本动态。
- [ ] 长城市名不会挤坏天气 Chip。
- [ ] Rain/Snow 不覆盖左侧文案。

## C. City / Landmark

- [ ] 地点使用 cityCode，不使用 district/street/POI 判断 Hero Landmark。
- [ ] 同一 cityCode 内位置变化不请求 city-context。
- [ ] cityCode 改变才请求 city-context。
- [ ] 1 个 Landmark 时正确展示。
- [ ] 多 Landmark 时仅在进入新城市时随机一次。
- [ ] cityCode 不变不重新随机。
- [ ] 0 个 Landmark 时进入 fallback。
- [ ] fallback 城市不变期间保持一致。
- [ ] Landmark 永远限制在 136×246 Stage 内。
- [ ] 高塔不拉伸。
- [ ] 横向建筑不拉伸。
- [ ] Landmark 切换无 layout shift。
- [ ] preload 后再 crossfade。
- [ ] broken image 不可见。

## D. Weather

- [ ] 只存在 sunny/cloudy/rain/snow 四种视觉类型。
- [ ] 晴天蓝色比阴天明显。
- [ ] 晴天金色太阳存在但不过亮。
- [ ] 阴天云量明显更多。
- [ ] 阴天云不是卡通 icon。
- [ ] 雨天不显示“小雨”。
- [ ] 雨滴 z-index 高于 Landmark。
- [ ] 雨滴能经过 Landmark 前方。
- [ ] 雪天为冷灰蓝天空。
- [ ] 雪花 z-index 高于 Landmark。
- [ ] 雪花运动慢于雨滴。
- [ ] 天气更新不触发 Landmark 更新。
- [ ] 未知 weather code 被后端归一化，不进入前端。

## E. Cache / Error

- [ ] 有 cache 时首页立即显示。
- [ ] Weather TTL 过期后台更新，不清空当前天气。
- [ ] 定位权限拒绝有可控 fallback。
- [ ] city-context 空数组视为正常 fallback。
- [ ] Weather API 失败页面仍稳定。
- [ ] Offline 可以展示缓存首页。
- [ ] 所有失败状态 Hero 高度不变化。

## F. Interaction

- [ ] CTA press feedback 正确。
- [ ] Session create 成功进入 Camera。
- [ ] 参考图入口正常。
- [ ] Carousel 可横向拖动。
- [ ] 用户拖动后 carousel 不出现跳卡。
- [ ] Landmark 更新淡出/淡入而非闪切。
- [ ] Weather transition 约 420ms。
- [ ] Reduced Motion 下持续粒子动画可关闭。

## G. Platform

- [ ] Taro H5。
- [ ] iOS WebView。
- [ ] Android WebView。
- [ ] 目标小程序环境。
- [ ] Safe Area 正确。
- [ ] 标题不依赖远程字体。
- [ ] Landmark 透明图在各平台边缘无蓝边/白边。
