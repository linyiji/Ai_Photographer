# AI Photographer Home V1 — 设计与开发交付包

## 1. 目的

本目录是 AI Photographer 首页 V1 的唯一工程交付基线，用于产品、UI、UX、Taro 前端、后端、联调、QA 以及 Codex 自动生成代码。

本包不是“设计参考”。它是实现约束。

**视觉 Source of Truth：**

`prototype/ai-photographer-home-v1.html`

该 HTML 基于已确认的 V24 首页设计，只补齐了第四种固定天气 `snow` 以及用于联调测试的稳定 DOM ID；首页几何布局不得重新设计。

## 2. 必须冻结的设计

以下内容不得因为 Taro 重构、后端接入、动态地标或天气变化而改变：

- 页面整体视觉风格。
- Hero 高度、圆角、内边距。
- Hero 左侧布局和固定文案。
- LandmarkStage 的固定可用空间。
- WeatherStage 的固定可用空间。
- 推荐拍法区域的尺寸关系。
- Bottom Tab 的结构。
- 色彩、圆角、按钮大小、信息层级。

Hero 左侧只有两个动态文本：

1. `cityName`
2. `weather.type / weather.label`

标题、描述、CTA 文案和布局固定。

## 3. 动态内容边界

### Landmark

地标按“市”级处理，不使用区、街道、POI 作为 Hero 地标粒度。

- `cityCode` 变化：重新请求城市地标。
- `cityCode` 不变：不得重新选择地标。
- 城市有 1..N 个地标：进入新城市时随机选择 1 个，并保持。
- 城市无地标：从本地 fallback 地标池随机选择 1 个，并保持。
- 地标只替换图片内容，不改变 LandmarkStage 几何尺寸。

### Weather

首页固定只认 4 种视觉天气：

- `sunny`
- `cloudy`
- `rain`
- `snow`

后端负责将第三方天气接口归一化成这四种值。

## 4. 文档阅读顺序

1. `01_PRODUCT_HOME_SPEC.md`
2. `02_UI_VISUAL_SPEC.md`
3. `03_UX_INTERACTION_MOTION_SPEC.md`
4. `04_LANDMARK_WEATHER_RULES.md`
5. `05_FRONTEND_ARCHITECTURE_TARO.md`
6. `06_API_DATA_CONTRACT.md`
7. `07_FRONTEND_BACKEND_INTEGRATION.md`
8. `08_STATE_ERROR_CACHE_SPEC.md`
9. `09_QA_ACCEPTANCE_CHECKLIST.md`

Codex 自动生成代码时，优先读取：

1. `codex/CODEX_TASK.md`
2. `codex/TARO_IMPLEMENTATION_SPEC.md`
3. `codex/HOME_DESIGN_TOKENS.json`
4. `codex/HOME_COMPONENT_TREE.json`
5. `codex/HOME_DATA_SCHEMA.json`
6. `codex/HOME_MOCK_DATA.json`
7. `prototype/ai-photographer-home-v1.html`

## 5. 目录

```text
ai-photographer-home-v1/
├── 00_README.md
├── 01_PRODUCT_HOME_SPEC.md
├── 02_UI_VISUAL_SPEC.md
├── 03_UX_INTERACTION_MOTION_SPEC.md
├── 04_LANDMARK_WEATHER_RULES.md
├── 05_FRONTEND_ARCHITECTURE_TARO.md
├── 06_API_DATA_CONTRACT.md
├── 07_FRONTEND_BACKEND_INTEGRATION.md
├── 08_STATE_ERROR_CACHE_SPEC.md
├── 09_QA_ACCEPTANCE_CHECKLIST.md
├── codex/
│   ├── CODEX_TASK.md
│   ├── TARO_IMPLEMENTATION_SPEC.md
│   ├── HOME_COMPONENT_TREE.json
│   ├── HOME_DESIGN_TOKENS.json
│   ├── HOME_DATA_SCHEMA.json
│   └── HOME_MOCK_DATA.json
├── prototype/
│   └── ai-photographer-home-v1.html
└── assets/
    ├── ASSET_MANIFEST.md
    ├── hero-title-calligraphy.png
    └── landmark-guangzhou-tower.png
```

## 6. 最重要的工程原则

> 后端告诉前端“是什么”，前端决定“长什么样”。

后端不得下发布局像素、圆角、颜色、动画时长、z-index 或 LandmarkStage 位置。

> Location 决定 Landmark，Weather 决定 Atmosphere。

不要让天气决定地标图片，也不要让地标改变 Hero 几何结构。
