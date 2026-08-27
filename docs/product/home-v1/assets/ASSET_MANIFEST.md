# Asset Manifest

## 1. 禁止项

本交付包不包含、也不应提交任何字体文件。

书法标题通过图片资产保证跨移动端一致。

## 2. hero-title-calligraphy.png

Path:

`assets/hero-title-calligraphy.png`

用途：

Hero 固定书法标题。

内容：

`AI 看看这里怎么拍`

特性：

- PNG
- RGBA
- 透明背景
- 包含书法文字与下划线视觉

Taro：

推荐作为固定 Image 使用。

如果最终实现采用另一份已验收的同视觉标题图，必须做截图 diff。

## 3. landmark-guangzhou-tower.png

Path:

`assets/landmark-guangzhou-tower.png`

用途：

广州 `440100` 的 Landmark 示例。

特性：

- PNG
- RGBA
- 透明背景
- 仅主体
- 不包含天气背景

该文件是动态 Landmark Asset 的样例，不代表首页永远显示广州塔。

## 4. 动态 Landmark CDN 规范

推荐：

- WebP transparent 或 PNG transparent
- 不包含天空
- 不包含天气
- 不包含街区背景
- 无文字
- 去除无意义透明外边距
- 返回 `intrinsicWidth / intrinsicHeight`
- 客户端统一 fit 到 LandmarkStage

推荐 CDN 控制：

- Long edge: 1000–1600 px
- Typical file: ≤ 500KB
- alpha 边缘干净
- 不带白边、蓝边

## 5. Fallback Landmark Assets

正式项目需额外准备至少 4 个本地 fallback 建筑资产：

```text
fallback-landmark-01.webp
fallback-landmark-02.webp
fallback-landmark-03.webp
fallback-landmark-04.webp
```

这些是通用装饰性地标，仅在城市没有配置地标时使用。

选择算法见：

`04_LANDMARK_WEATHER_RULES.md`

## 6. 推荐拍法 Covers

推荐拍法图片由后端数据下发。

客户端：

- 使用固定卡片尺寸。
- `cover` 裁切。
- 图片加载失败使用固定 placeholder。
- 不允许图片天然比例改变卡片几何。

## 7. Bundle Checksums

- `prototype/ai-photographer-home-v1.html`: `376f5ed302a740debcd9610a4fef1921535bb18c8057874291e19adf12bd7fec`
- `assets/hero-title-calligraphy.png`: `fd6110b26dd5227789f05ca5fa663d7aa39164421a02a3af52ba9f8397d628bd`
- `assets/landmark-guangzhou-tower.png`: `b8f2897f9aefddd588276c8add7c6e5f1c3cde645d2166d5810667f73a09631e`
