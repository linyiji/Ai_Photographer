# TARO IMPLEMENTATION SPEC — AI Photographer Home V1

This file is an implementation contract, not a design suggestion.

## 1. Goal

Implement the AI Photographer Home page in Taro + React + TypeScript so that the 390×844 result matches:

`../prototype/ai-photographer-home-v1.html`

Do not redesign.

## 2. Create Exactly These Core Files

```text
src/pages/home/index.tsx
src/pages/home/index.scss
src/pages/home/index.config.ts

src/components/home/HomeTopBar/index.tsx
src/components/home/HomeTopBar/index.scss

src/components/home/HomeHero/index.tsx
src/components/home/HomeHero/index.scss

src/components/home/HeroFixedContent/index.tsx
src/components/home/HeroFixedContent/index.scss

src/components/home/WeatherStage/index.tsx
src/components/home/WeatherStage/index.scss

src/components/home/LandmarkStage/index.tsx
src/components/home/LandmarkStage/index.scss

src/components/home/WeatherDynamicOverlay/index.tsx
src/components/home/WeatherDynamicOverlay/index.scss

src/components/home/ReferenceEntry/index.tsx
src/components/home/ReferenceEntry/index.scss

src/components/home/ShootMethodCarousel/index.tsx
src/components/home/ShootMethodCarousel/index.scss

src/components/home/HomeBottomTabs/index.tsx
src/components/home/HomeBottomTabs/index.scss

src/types/home.ts
src/constants/weather.ts
src/constants/landmarks.ts
src/services/location.service.ts
src/services/weather.service.ts
src/services/home.service.ts
src/stores/home.store.ts
src/utils/fitLandmark.ts
src/utils/pickLandmark.ts
```

## 3. Taro Components

Use primitives from `@tarojs/components`:

- `View`
- `Text`
- `Image`
- `Button`
- `ScrollView`

Do not introduce Card/Button components from a UI library.

## 4. Types

Implement:

```ts
export type WeatherVisualType =
  | 'sunny'
  | 'cloudy'
  | 'rain'
  | 'snow'

export interface CityContext {
  cityCode: string
  cityName: string
  lat?: number
  lng?: number
}

export interface Weather {
  type: WeatherVisualType
  label: '晴天' | '阴天' | '雨天' | '雪天'
  temperatureC?: number | null
  observedAt?: string | null
  ttlSeconds?: number
}

export interface LandmarkCandidate {
  id: string
  name: string
  assetUrl: string
  intrinsicWidth: number
  intrinsicHeight: number
  assetVersion?: string | null
  isFallback?: boolean
}

export interface ShootMethod {
  id: string
  title: string
  subtitle: string
  tag: string
  coverUrl: string
  priority?: number | null
}
```

## 5. Fixed Hero DOM/Component Order

Use this semantic order:

```tsx
<View className='hero'>
  <WeatherStage type={weather.type} />

  <LandmarkStage landmark={currentLandmark} />

  <WeatherDynamicOverlay type={weather.type} />

  <HeroFixedContent
    cityName={city.cityName}
    weatherType={weather.type}
  />
</View>
```

CSS z-index must still produce:

```text
WeatherDynamicOverlay 12
HeroFixedContent       10
LandmarkStage           9
Weather Haze            4
Sun/Cloud               2
Sky                     0
```

Dynamic overlay is clipped to right 46%, therefore it does not cover copy.

## 6. WeatherStage Exact Behavior

`sunny`:

- blue sky from tokens
- dim gold sun
- almost no clouds

`cloudy`:

- five large blurred cloud layers
- no visible sun
- gray-blue sky

`rain`:

- rain sky + thick clouds + haze
- particles come from WeatherDynamicOverlay

`snow`:

- cold gray-blue sky + thick clouds + pale haze
- particles come from WeatherDynamicOverlay

Do not infer real rainfall intensity in the client.

## 7. WeatherDynamicOverlay

Render nothing for sunny/cloudy.

Render rain component for `rain`.

Render snow component for `snow`.

The overlay container:

```scss
position: absolute;
top: 0;
right: 0;
bottom: 0;
width: 46%;
z-index: 12;
overflow: hidden;
pointer-events: none;
```

## 8. LandmarkStage

Geometry from tokens:

```text
136 × 246
right 4
bottom -3
```

Use `fitLandmark()`.

Implementation:

```ts
export function fitLandmark(
  assetWidth: number,
  assetHeight: number,
  stageWidth = 136,
  stageHeight = 246
) {
  const safeW = stageWidth * 0.94
  const safeH = stageHeight * 0.96
  const scale = Math.min(safeW / assetWidth, safeH / assetHeight)

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

The Stage does not change per landmark.

## 9. Random Landmark Selection

Use exactly this behavior:

```ts
export function pickLandmarkForCity(
  cityCode: string,
  cityLandmarks: LandmarkCandidate[],
  fallbackLandmarks: LandmarkCandidate[],
  current: { cityCode: string; landmark: LandmarkCandidate } | null
) {
  if (current?.cityCode === cityCode) return current

  const pool = cityLandmarks.length
    ? cityLandmarks
    : fallbackLandmarks.map(x => ({ ...x, isFallback: true }))

  if (!pool.length) throw new Error('FALLBACK_LANDMARK_POOL_EMPTY')

  const landmark = pool[Math.floor(Math.random() * pool.length)]

  return { cityCode, landmark }
}
```

Never call this when cityCode is unchanged.

## 10. City Update

Implement a city change gate before City Context API.

```ts
if (nextCity.cityCode === state.city?.cityCode) {
  return
}
```

Only after change:

- request city context
- select landmark
- update recommendations

Weather has its own refresh path.

## 11. Cache

Use Taro storage keys documented in:

`../08_STATE_ERROR_CACHE_SPEC.md`

On launch:

1. hydrate cache
2. render
3. resolve city
4. apply city change gate
5. refresh weather by TTL

## 12. Title

Do not use Google Fonts.

Copy:

`../assets/hero-title-calligraphy.png`

to the application asset directory and render it as a fixed Image.

Do not include font files.

## 13. Mock Mode

Before API integration, add:

```ts
const USE_HOME_MOCK = true
```

Load scenarios from the equivalent of:

`HOME_MOCK_DATA.json`

Minimum visual dev selector scenarios:

- Guangzhou sunny
- Guangzhou cloudy
- Guangzhou rain
- Beijing snow
- unknown city fallback

The selector/debug controls must be development-only and not affect production UI.

## 14. Styling

Read all exact values from:

`HOME_DESIGN_TOKENS.json`

Do not replace values with approximate Tailwind classes.

Do not use responsive rem guesses.

## 15. Done Definition

Implementation is done only if:

1. 390×844 screenshot matches prototype.
2. All 4 weather states match the design rules.
3. Rain and snow render above landmark.
4. Landmark never changes when cityCode is unchanged.
5. Landmark changes/preloads only after cityCode changes.
6. Empty city landmarks trigger stable fallback selection.
7. No remote font dependency.
8. No layout shift during API updates.
9. QA checklist passes.
