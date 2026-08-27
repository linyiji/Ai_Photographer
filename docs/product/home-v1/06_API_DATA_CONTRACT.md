# 06 — API & Data Contract

## 1. 原则

移动端 UI 只接受业务数据，不接受视觉参数。

API 不允许返回：

- cardWidth
- heroHeight
- borderRadius
- landmarkRight
- zIndex
- animationDuration
- CSS color

这些由前端 `HOME_DESIGN_TOKENS.json` 决定。

## 2. Location Resolve

如果客户端定位能力只能拿经纬度，使用：

```http
GET /api/v1/location/resolve-city?lat={lat}&lng={lng}
```

Response：

```json
{
  "cityCode": "440100",
  "cityName": "广州",
  "lat": 23.1291,
  "lng": 113.2644
}
```

服务端必须返回市级 `cityCode`。

不要返回区作为 Hero 的 identity。

## 3. City Context

只在 `cityCode` 改变时请求：

```http
GET /api/v1/photographer/city-context?city_code=440100
```

Response：

```json
{
  "schemaVersion": "city-context.v1",
  "cityCode": "440100",
  "landmarks": [
    {
      "id": "guangzhou_tower",
      "name": "广州塔",
      "assetUrl": "https://cdn.example.com/landmarks/guangzhou-tower.webp",
      "intrinsicWidth": 791,
      "intrinsicHeight": 1506,
      "assetVersion": "v3",
      "isFallback": false
    }
  ],
  "shootMethods": [
    {
      "id": "walk_capture",
      "title": "轻松行走抓拍",
      "subtitle": "边走边拍，更自然",
      "tag": "自然 · 全身",
      "coverUrl": "https://cdn.example.com/methods/walk.webp",
      "priority": 0.95
    }
  ]
}
```

`landmarks` 可以：

- 0 条
- 1 条
- 多条

客户端负责当前城市进入时的随机选择。

## 4. Weather

Weather 独立刷新：

```http
GET /api/v1/weather/current?city_code=440100
```

Response：

```json
{
  "schemaVersion": "weather.v1",
  "cityCode": "440100",
  "type": "rain",
  "label": "雨天",
  "temperatureC": 27,
  "observedAt": "2026-08-26T14:45:00+08:00",
  "ttlSeconds": 600
}
```

`type` 必须是：

```text
sunny
cloudy
rain
snow
```

客户端不解释第三方 weather code。

## 5. Weather Normalization

Weather service 在后端做归一化。

未知天气：

`cloudy`

UI `label` 必须与 `type` 对应：

```text
sunny  晴天
cloudy 阴天
rain   雨天
snow   雪天
```

## 6. Create Photography Session

点击“开始拍摄”：

```http
POST /api/v1/photographer/sessions
Content-Type: application/json
```

Request：

```json
{
  "source": "live",
  "cityCode": "440100",
  "weatherType": "rain",
  "landmarkId": "guangzhou_tower"
}
```

Response：

```json
{
  "sessionId": "ps_01H...",
  "status": "created"
}
```

Reference 模式：

```json
{
  "source": "reference",
  "cityCode": "440100",
  "weatherType": "cloudy",
  "landmarkId": "guangzhou_tower",
  "referenceAssetId": "asset_..."
}
```

## 7. Error Contract

推荐统一：

```json
{
  "error": {
    "code": "CITY_CONTEXT_UNAVAILABLE",
    "message": "..."
  }
}
```

Home 关注的 codes：

```text
LOCATION_RESOLVE_FAILED
CITY_CONTEXT_UNAVAILABLE
WEATHER_UNAVAILABLE
LANDMARK_ASSET_UNAVAILABLE
SESSION_CREATE_FAILED
```

前端不得把 server message 原样显示到首页。

## 8. Timeout

建议客户端：

- Location Resolve: 4s
- City Context: 5s
- Weather: 4s
- Session Create: 6s

超时进入对应 fallback/cache，不改变页面几何。

## 9. Schema Compatibility

所有响应带 `schemaVersion`。

Home V1 只接受兼容 `*.v1`。

新增字段允许向后兼容。

删除/改名字段必须升级 major schema。
