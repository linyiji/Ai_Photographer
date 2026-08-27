# 07 — Frontend / Backend Integration Flow

## 1. 冷启动

```text
App/Home Open
   ↓
Read Home Cache
   ↓
Render immediately if cache exists
   ↓
Get device location
   ↓
Resolve city
   ↓
Compare cityCode
   ├─ same city
   │    ├─ keep landmark
   │    ├─ keep shoot methods
   │    └─ refresh weather only when TTL expired
   │
   └─ new city
        ├─ GET city-context
        ├─ select landmark / fallback
        ├─ preload landmark
        ├─ GET weather/current
        ├─ crossfade landmark
        └─ update recommendations
```

## 2. 城市变化

唯一 Landmark refresh condition：

```ts
nextCity.cityCode !== currentCity.cityCode
```

cityName 文案变化但 cityCode 不变时，以 cityCode 为准。

## 3. 地标请求时序

新城市：

```text
resolved city
→ request city-context
→ candidates received
→ random select once
→ cache selection
→ preload asset
→ commit state
→ crossfade UI
```

不要先把旧 Landmark 清空。

## 4. Fallback 时序

```text
city-context.landmarks.length === 0
→ get local FALLBACK_LANDMARKS
→ random pick
→ mark isFallback=true
→ cache with current cityCode
→ preload
→ display
```

只要 cityCode 不变，不重新随机。

## 5. Weather 时序

Weather 可独立于地点内容刷新。

建议：

- 前台 Home 打开时检查 TTL。
- App resume 检查 TTL。
- TTL 默认约 15 min。
- Rain/Snow 可由后端返回更短 TTL。

Weather update：

```text
weather response
→ validate enum
→ update store
→ 420ms atmosphere transition
```

不得：

- 请求 Landmark。
- 清空推荐。
- 重置 city selection。

## 6. Landmark Asset Failure

```text
selected landmark
→ preload fail
```

处理：

1. 如果当前旧 Landmark 可用，继续显示旧 Landmark。
2. 如果是新城市且无旧地标可复用，尝试 fallback。
3. fallback 也失败：Visual Stage 保留天气，不显示 broken image。
4. 页面结构不变。

## 7. API 并发

新城市可以并行：

```text
city-context
weather/current
```

但 Landmark 选择依赖 city-context。

Weather 不需要等待 Landmark。

## 8. 首页与 Camera

点击 CTA：

```text
Home state snapshot
→ POST session
→ sessionId
→ navigate Camera
```

Snapshot 包含：

- current cityCode
- current weatherType
- current landmarkId

这些是上下文，不是拍摄结果。

## 9. 联调 Mock

在后端完成前，前端直接使用：

`codex/HOME_MOCK_DATA.json`

必须覆盖：

- 广州晴天
- 广州阴天
- 广州雨天
- 北京雪天
- 无地标 fallback

## 10. 联调验证重点

后端同学重点验证：

- cityCode 是否始终是市级。
- city-context 是否不携带 UI 参数。
- weather 是否已归一化。
- landmark intrinsic size 是否真实。
- 空 landmark 是否返回空数组而不是伪造城市地标。

前端同学重点验证：

- cityCode 不变不请求 city-context。
- cityCode 改变才重新选择 landmark。
- weather update 不改变 landmark。
- rain/snow overlay 在 landmark 上层。
