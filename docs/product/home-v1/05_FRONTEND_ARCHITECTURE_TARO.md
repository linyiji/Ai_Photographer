# 05 — Taro Frontend Architecture

## 1. 技术约束

目标：

- Taro
- React
- TypeScript
- SCSS
- H5 + 小程序 + 移动端 WebView 可复用

不要求引入 UI 组件库。

如果已有项目必须使用 UI Library，也不得使用其默认 Button/Card 样式替换本设计。

## 2. Taro Config

首页视觉以 390px 为设计宽。

建议项目配置：

```ts
export default {
  designWidth: 390,
  deviceRatio: {
    390: 1
  }
}
```

如果现有项目的 Taro 构建链对自定义 designWidth 有统一封装，以项目封装为准，但最终 390px 视口截图必须与 prototype 一致。

## 3. 文件结构

Codex 必须生成：

```text
src/
├── pages/
│   └── home/
│       ├── index.tsx
│       ├── index.scss
│       └── index.config.ts
├── components/
│   └── home/
│       ├── HomeTopBar/
│       ├── HomeHero/
│       ├── HeroFixedContent/
│       ├── WeatherStage/
│       ├── LandmarkStage/
│       ├── WeatherDynamicOverlay/
│       ├── ReferenceEntry/
│       ├── ShootMethodCarousel/
│       └── HomeBottomTabs/
├── services/
│   ├── location.service.ts
│   ├── weather.service.ts
│   └── home.service.ts
├── stores/
│   └── home.store.ts
├── types/
│   └── home.ts
├── constants/
│   ├── weather.ts
│   └── landmarks.ts
└── utils/
    ├── fitLandmark.ts
    └── pickLandmark.ts
```

## 4. Component Responsibilities

### HomePage

只负责：

- 组装组件。
- 调用 Home model/store。
- 路由跳转。
- 页面生命周期。

不得包含天气视觉 CSS 逻辑。

### HomeHero

结构容器。

```tsx
<HomeHero>
  <HeroFixedContent />
  <WeatherStage />
  <LandmarkStage />
  <WeatherDynamicOverlay />
</HomeHero>
```

### HeroFixedContent

Props：

```ts
interface HeroFixedContentProps {
  cityName: string
  weatherType: WeatherVisualType
}
```

固定：

- 标题。
- 描述。
- CTA。

只更新 city/weather label。

### WeatherStage

Props：

```ts
interface WeatherStageProps {
  type: WeatherVisualType
}
```

输出：

- Sky
- Sun/Cloud
- Haze

不得包含 Landmark。

### LandmarkStage

Props：

```ts
interface LandmarkStageProps {
  landmark: LandmarkCandidate
}
```

使用 `fitLandmark()` 计算宽高与坐标。

Stage 本身尺寸固定。

### WeatherDynamicOverlay

Props：

```ts
interface WeatherDynamicOverlayProps {
  type: WeatherVisualType
}
```

- `rain` → RainOverlay
- `snow` → SnowOverlay
- `sunny/cloudy` → no particle overlay

### ShootMethodCarousel

Props：

```ts
interface ShootMethodCarouselProps {
  methods: ShootMethod[]
}
```

卡片尺寸固定。

## 5. State

不强制 Redux / MobX / Zustand。

V1 可使用 React `useReducer` 封装到 `home.store.ts`。

建议：

```ts
export interface HomeState {
  phase: 'initial' | 'loading' | 'ready' | 'partial' | 'offline' | 'error'

  city: CityContext | null
  weather: Weather | null

  currentLandmark: LandmarkCandidate | null
  landmarkSelectionCityCode: string | null

  shootMethods: ShootMethod[]

  weatherUpdatedAt: number | null
}
```

## 6. City Update Handler

直接按如下规则实现：

```ts
async function handleResolvedCity(nextCity: CityContext) {
  const current = getHomeState()

  if (current.city?.cityCode === nextCity.cityCode) {
    // City 没变，Landmark 不请求、不重选。
    setCity(nextCity)
    return
  }

  setCity(nextCity)

  const cityContext = await homeService.getCityContext(nextCity.cityCode)

  const selection = pickLandmarkForCity(
    nextCity.cityCode,
    cityContext.landmarks,
    FALLBACK_LANDMARKS,
    null
  )

  await preloadLandmark(selection.landmark.assetUrl)
  setLandmark(selection.landmark, nextCity.cityCode)
  setShootMethods(cityContext.shootMethods)
}
```

## 7. Weather Refresh

Weather 与 Landmark 分开刷新。

```ts
async function refreshWeather(cityCode: string) {
  const weather = await weatherService.getCurrent(cityCode)
  setWeather(weather)
}
```

Weather refresh 不能调用 `pickLandmarkForCity()`。

## 8. Asset Rendering

推荐使用 Taro `<Image>`，但位置由 `fitLandmark` 显式计算。

伪代码：

```tsx
const rect = fitLandmark(
  landmark.intrinsicWidth,
  landmark.intrinsicHeight
)

<View className='landmarkStage'>
  <Image
    src={landmark.assetUrl}
    style={{
      position: 'absolute',
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      left: `${rect.left}px`,
      top: `${rect.top}px`
    }}
  />
</View>
```

禁止 stretch。

## 9. Title Asset

正式移动端不得依赖 Google Fonts。

使用：

`assets/hero-title-calligraphy.png`

或者项目内等价、已验收的标题图片。

不要提交字体文件。

## 10. CSS Architecture

建议：

- `HomeHero/index.scss`：Hero geometry。
- `WeatherStage/index.scss`：sky/cloud/sun/haze。
- `WeatherDynamicOverlay/index.scss`：rain/snow keyframes。
- `LandmarkStage/index.scss`：固定 Stage。
- `HeroFixedContent/index.scss`：左侧固定 UI。

禁止把所有天气样式写到 Page 根文件。

## 11. Production / Dev Mode

Production：

- Weather Chip 只读。
- Location Chip 只读或跳转到位置能力。
- 数据来自 API/store。

Dev：

允许增加：

```ts
const HOME_VISUAL_DEBUG = true
```

用于循环 4 种天气和 Mock City。

Debug UI 不得进入 production bundle。
