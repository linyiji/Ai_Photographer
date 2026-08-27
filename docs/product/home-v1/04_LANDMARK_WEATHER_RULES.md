# 04 — Landmark & Weather Rules

## 1. 核心模型

Hero 右侧：

```text
Fixed Visual Stage
=
Dynamic City Landmark
+
Fixed 4-state Weather System
```

广州塔不是固定 UI 元素，只是 `广州 / 440100` 的 Landmark 示例。

## 2. 地点颗粒度

Hero 地标粒度只到“市”。

唯一用于判断地标变化的 key：

`cityCode`

不使用：

- districtCode
- 区名称
- street
- POI
- GPS 细微漂移

示例：

```text
广州天河区   \
广州海珠区    > cityCode = 440100 → 同一组地标
广州越秀区   /
```

## 3. 城市变化触发规则

必须使用：

```ts
const cityChanged = nextCityCode !== currentCityCode
```

### cityCode 相同

不得：

- 重新请求 Landmark API。
- 重新随机地标。
- 更换 fallback。
- 重置 Landmark 动画。

可以：

- 按 TTL 刷新 Weather。

### cityCode 不同

执行：

```text
clear current city selection
→ request city context
→ select city landmark or fallback
→ preload
→ crossfade
→ cache current city + selection
```

## 4. 城市地标候选

后端允许返回：

`landmarks: LandmarkCandidate[]`

### 1 个候选

直接选择。

### 多个候选

进入新城市时随机选择 1 个。

城市不变期间保持。

### 0 个候选

进入 fallback。

## 5. Fallback Pool

前端项目内置若干通用地标建筑资源。

示例：

```ts
export const FALLBACK_LANDMARKS = [
  fallbackLandmark01,
  fallbackLandmark02,
  fallbackLandmark03,
  fallbackLandmark04
]
```

Fallback 不需要与当前城市真实对应。它的目标是避免 Visual Stage 为空。

## 6. 可直接使用的随机选择算法

```ts
export interface LandmarkCandidate {
  id: string
  name: string
  assetUrl: string
  intrinsicWidth: number
  intrinsicHeight: number
  isFallback?: boolean
}

export interface LandmarkSelectionCache {
  cityCode: string
  landmark: LandmarkCandidate
}

export function pickLandmarkForCity(
  cityCode: string,
  cityLandmarks: LandmarkCandidate[],
  fallbackLandmarks: LandmarkCandidate[],
  currentCache: LandmarkSelectionCache | null
): LandmarkSelectionCache {
  // 地点没有变化：绝不重新选。
  if (currentCache?.cityCode === cityCode) {
    return currentCache
  }

  const pool = cityLandmarks.length > 0
    ? cityLandmarks
    : fallbackLandmarks.map(item => ({ ...item, isFallback: true }))

  if (pool.length === 0) {
    throw new Error('FALLBACK_LANDMARK_POOL_EMPTY')
  }

  const index = Math.floor(Math.random() * pool.length)

  return {
    cityCode,
    landmark: pool[index]
  }
}
```

这是 UI 随机，不涉及安全用途，`Math.random()` 足够。

## 7. Landmark 固定 Stage 适配算法

Stage：

```text
width  = 136
height = 246
```

要求后端/资产流水线提供去除无意义透明边距后的图片与 intrinsic size。

跨 Taro 平台不要依赖 `object-position: bottom` 的实现差异。

建议显式计算：

```ts
export function fitLandmark(
  assetWidth: number,
  assetHeight: number,
  stageWidth = 136,
  stageHeight = 246
) {
  const safeW = stageWidth * 0.94
  const safeH = stageHeight * 0.96

  const scale = Math.min(
    safeW / assetWidth,
    safeH / assetHeight
  )

  const width = assetWidth * scale
  const height = assetHeight * scale

  return {
    width,
    height,
    left: (stageWidth - width) / 2,
    top: stageHeight - height
  }
}
```

所有类型地标：

- 高塔
- 钟楼
- 大型建筑
- 横向建筑群

都使用同一 Stage。

横向建筑因此会相对矮，这是允许的；禁止为了“填满”而改 Stage。

## 8. Landmark Asset 规则

必须：

- 透明背景 PNG 或 WebP。
- 无天空。
- 无额外城市背景。
- 无天气特效。
- 无大面积透明留白。
- 主体真实比例。
- 不允许把地点和天气预合成一张图。

推荐最大文件：

`≤ 500KB`（按最终 CDN/WebP 优化后）

## 9. Weather 固定枚举

```ts
export type WeatherVisualType =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'snow'
```

UI 标签：

```ts
export const WEATHER_LABELS = {
  sunny: '晴天',
  cloudy: '阴天',
  rain: '雨天',
  snow: '雪天'
} as const
```

## 10. 服务端天气归一化

第三方天气 code 不能直接传给 Home。

建议：

```text
晴 / clear / mostly-clear
→ sunny

多云 / 阴 / overcast / cloudy / unknown-non-precipitation
→ cloudy

毛毛雨 / 阵雨 / 中雨 / 大雨 / 雷雨 / rain / shower / thunderstorm
→ rain

小雪 / 中雪 / 大雪 / 暴雪 / flurries / snow / blizzard
→ snow
```

雨夹雪 V1 建议归入 `snow` 或由业务统一配置；客户端不新增第五种状态。

无法识别：

`cloudy`

## 11. Weather 与 Landmark 独立

正确：

```text
Location → Landmark
Weather  → Atmosphere
```

错误：

```text
Weather → 新地标图片
```

天气更新不能触发 Landmark 请求。

Landmark 更新不能重置天气。
