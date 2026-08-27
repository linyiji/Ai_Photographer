# 01 — AI Photographer 首页产品规格

## 1. 页面定位

首页是 AI Photographer 的摄影入口，不是天气 App、城市导览页，也不是内容运营装修页。

首页的核心任务：

1. 告诉用户“AI 可以看看这里怎么拍”。
2. 通过当前城市地标与天气形成现场感。
3. 将用户快速导向“开始拍摄”。
4. 提供“参考图”入口。
5. 提供当前场景下的推荐拍法。

## 2. 页面模块

### 2.1 Top Bar

固定：

- 品牌：向风行
- 设置入口

不随地点和天气变化。

### 2.2 Hero

Hero 分成两类职责：

**左侧 Fixed Content**

- 城市 Chip：动态城市名称。
- 天气 Chip：动态天气标签。
- `AI PHOTOGRAPHER`
- 固定书法标题：`AI 看看这里怎么拍`
- 固定描述：`对准人物和环境，我来设计拍法。`
- 固定 CTA：`开始拍摄 →`

**右侧 Visual Stage**

- WeatherStage
- LandmarkStage
- WeatherDynamicOverlay

右侧是视觉舞台，不承担额外文本说明。

### 2.3 参考图

固定入口：

- 标题：参考图
- 描述：按喜欢的感觉拍

点击后进入参考图摄影流程。

### 2.4 推荐拍法

内容动态，视觉结构固定。

卡片字段：

- `tag`
- `title`
- `subtitle`
- `coverUrl`

排序由后端返回或前端按 `priority` 使用，但卡片宽度、圆角、字号等全部固定。

### 2.5 Bottom Navigation

固定：

- 首页
- 作品
- 我的

## 3. 首页不负责的事情

首页不承担：

- Scene Understanding 详细过程。
- Target Blueprint 展示。
- 实时拍摄引导。
- Photo QA。
- Reality+ Enhancement。
- 天气详情页面。
- 区/街道级城市地标判断。

这些属于其他页面或服务。

## 4. 地点产品规则

首页地点的业务身份是：

`cityCode`

例如：

- 广州天河区
- 广州海珠区
- 广州越秀区

全部归一到：

`440100 / 广州`

区、街道、POI 变化不得触发 Hero 地标变化。

## 5. 天气产品规则

首页只展示 4 种视觉天气：

| type | UI 标签 |
|---|---|
| sunny | 晴天 |
| cloudy | 阴天 |
| rain | 雨天 |
| snow | 雪天 |

不得新增“小雨”“大雨”“多云”“雷阵雨”等首页视觉状态。

第三方天气的复杂状态在服务端归一化。

## 6. Landmark 产品规则

Landmark 是动态主体。

广州塔只是广州场景的一个实例。

规则：

- 城市有多个可用地标：进入该城市时随机一个。
- 城市不变：当前地标不变。
- 城市变化：重新请求并重新选择。
- 无城市地标：从本地 fallback 池随机一个通用地标建筑。
- fallback 一旦选中，在城市不变期间保持不变。
- Landmark 不显示名称，不影响左侧排版。

## 7. CTA 业务流

### 开始拍摄

```text
Home
→ Create Photography Session
→ Camera
→ Scene Understanding
→ Guidance
→ Capture
→ QA
→ Enhancement
```

### 参考图

```text
Home
→ Reference Picker
→ Reference Analysis
→ Create Photography Session(source=reference)
→ Camera
```

## 8. Home V1 成功标准

首页成功不是“信息最多”，而是：

- 视觉稳定。
- 地点与天气有现场感。
- 用户第一眼仍然聚焦“AI 看看这里怎么拍”和 CTA。
- 动态地标和天气不破坏已有设计。
