# 08 — State / Error / Cache Specification

## 1. Home Phase

```ts
type HomePhase =
  | 'initial'
  | 'loading'
  | 'ready'
  | 'partial'
  | 'offline'
  | 'error'
```

### initial

无内存状态。

### loading

正在拿 location/city。

页面仍渲染固定 UI。

### ready

city/weather/landmark 基本可用。

### partial

某个服务失败，但有可展示内容。

### offline

网络不可用，使用 cache。

### error

无 cache 且核心 location/city 无法取得。

即使 error，也不要破坏页面布局。

## 2. Cache Keys

建议 Taro Storage：

```text
ai-photographer.home.city.v1
ai-photographer.home.landmark-selection.v1
ai-photographer.home.weather.v1
ai-photographer.home.shoot-methods.v1
```

### city

```json
{
  "cityCode": "440100",
  "cityName": "广州"
}
```

### landmark-selection

只缓存“当前最近城市”的选择：

```json
{
  "cityCode": "440100",
  "landmark": {
    "id": "guangzhou_tower",
    "assetUrl": "...",
    "intrinsicWidth": 791,
    "intrinsicHeight": 1506,
    "isFallback": false
  }
}
```

当 cityCode 改变，旧 selection 失效。

这样用户离开一个城市后再回来，会按“城市发生变化”重新解析/选择，符合 V1 规则。

## 3. Weather TTL

默认：

`900s`

后端可以返回 `ttlSeconds`。

Weather 过期：

- 页面先显示缓存。
- 后台刷新。
- 成功后做视觉 transition。
- 失败继续使用旧天气，标记 partial。

## 4. City Context Cache

V1 规则强调：

**City Context 只在 cityCode 改变时重新请求。**

因此当前城市：

- Landmark selection 可一直保留。
- Shoot Methods 可一直保留。

如果未来要运营刷新，必须通过 V2 增加明确版本失效策略，不在 V1 偷偷加入定时刷新。

## 5. Loading State

禁止整屏 skeleton。

建议：

- Fixed Copy 立即显示。
- city chip 无 cache：`定位中`
- weather chip 无 cache：`获取中`
- Landmark 无 cache：Stage 只显示 Weather base atmosphere。
- Shoot Methods 无 cache：固定高度 skeleton。

Skeleton 不改变几何尺寸。

## 6. Permission Denied

定位权限拒绝：

- 使用上一次 city cache。
- 无 cache 时进入默认城市策略（由产品配置）。
- 不随机频繁切换 Landmark。
- 不显示红色 error banner。

## 7. Weather Failure

有 cache：

继续显示 cache。

无 cache：

使用：

`cloudy`

UI label 可显示 `阴天` 或产品定义的中性状态；V1 推荐直接 `阴天`，避免增加第五种视觉枚举。

## 8. Landmark API Empty

正常业务，不是错误。

执行 fallback selection。

## 9. Landmark Image Failure

优先级：

```text
current old landmark
→ local fallback asset
→ no landmark image
```

禁止浏览器破图图标。

## 10. Offline

离线：

- city cache
- landmark selection cache
- weather cache
- shoot method cache

均可以展示。

CTA 进入摄影流程时如果必须联网，由 session create 层提示，不在首页铺错误信息。

## 11. City Name Layout Protection

为了保持左侧固定：

- cityName 使用短名称。
- 前端 chip 设置 max-width。
- overflow: hidden。
- text-overflow: ellipsis。
- white-space: nowrap。

不允许城市名把天气 Chip 推出 Fixed Copy。
