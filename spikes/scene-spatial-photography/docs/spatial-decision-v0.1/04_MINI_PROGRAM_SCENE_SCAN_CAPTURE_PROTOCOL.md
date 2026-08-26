# 04 — Mini Program Scene Scan Capture Protocol

## 1. 平台

优先：
- 微信小程序
- 抖音小程序

Native App 不是当前默认路线。

## 2. 用户只做一次

```text
点击“扫描现场”
↓
跟随箭头缓慢扫动
↓
完成
```

不要求手动拍多张，不要求理解 3D，也不默认第二次补扫。

## 3. 扫描动作

建议默认：
- 120°–180°
- 缓慢旋转
- 自然轻微左右/弧形位移
- 不强制 360°

360° 作为特殊模式。

## 4. 端侧数据

每个候选采样记录：
- timestamp
- frame_sequence
- width/height
- relative_yaw
- orientation
- blur/exposure/quality
- motion_score
- parallax_proxy
- selected_as_keyframe

平台允许时附 device motion / gyro / accelerometer。

## 5. 数据层级

### Hot Frame
短生命周期，仅内存。

### Keyframe
经过质量/角度/重复筛选。

### Direction Evidence
持久化 yaw、manifest、descriptor。

### Spatial Input
只保留/上传必要的 overlapping frame subset + metadata。

不上传全量视频流。

## 6. 小程序必须做

- Camera permission/lifecycle
- Frame sampling
- Relative yaw
- Quality gate
- Keyframe selection
- Privacy gate
- Basic motion/parallax diagnostic

## 7. 后端主做

- Feature matching
- Pose estimation
- Triangulation
- Sparse geometry
- Optional depth/heavy reconstruction
- Geometry confidence
- Affordance
- Candidate generation

## 8. Scan Completion

分别输出：

```json
{
  "direction_status": "USABLE",
  "spatial_status": "INSUFFICIENT"
}
```

Spatial 不足不阻断主流程。

## 9. 隐私

默认：
- raw video upload = 0
- frame stream upload = 0
- 只上传必要 keyframe subset
- 记录图片生命周期和 provider 使用情况

## 10. 平台 Adapter

```text
SceneScanCaptureAdapter
├── WeChatSceneScanAdapter
└── DouyinSceneScanAdapter
```

上层不得直接耦合平台 API。
