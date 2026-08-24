# XFX Live Physical Agent — LIVE-P0 Camera Sandbox

这是一个独立的 Mobile Web 相机基础验证面，只覆盖真实摄像头预览、前后摄选择、镜像/坐标状态和帧调度观测。它不包含 CV/ML、Pose、Perception、Delta/Priority、Guidance、Luna、Backend、Capture、QA 或 Reality+。

## Locked runtime

```text
Node 24.18.0
npm 11.6.2
Vite 8.2.2
TypeScript 5.9.3
Vanilla TypeScript
```

在 Windows PowerShell 新会话中初始化锁定运行时：

```powershell
$fnm = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe\fnm.exe"
& $fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
fnm use 24.18.0
node --version
npm --version
```

预期为 `v24.18.0` 和 `11.6.2`。

## AUTOMATED_DESKTOP_VALIDATION

在本目录运行：

```powershell
npm ci
npm ls --depth=0
npm run typecheck
npm run build
npm run dev
```

然后打开：

```text
http://localhost:5173/
```

此路径只用于桌面自动化和 UI smoke。它验证页面启动、HUD、相机访问前置条件和错误展示，不证明真实手机 Camera/CV 可行性。

受控 unsupported 错误路径：

```text
http://localhost:5173/?simulateUnsupported=1
```

该 query 只关闭本页的 MediaDevices 能力分支，用于验证可见错误状态，不会请求摄像头。

## MANUAL_PHONE_VALIDATION

手机浏览器摄像头要求可信安全上下文。不要用 `http://<LAN-IP>:5173` 冒充可用的手机测试地址，也不要关闭证书校验。

推荐的 HTTPS secure-tunnel 路径：

1. 在电脑上运行本项目：

   ```powershell
   npm run dev
   ```

2. 使用已安装并受信任的 `cloudflared` 建立临时 HTTPS tunnel：

   ```powershell
   cloudflared tunnel --url http://localhost:5173
   ```

3. 只使用 `cloudflared` 输出的 `https://...trycloudflare.com` 地址在手机浏览器打开。
4. 核对地址栏为有效 HTTPS；不要绕过浏览器安全警告。
5. 点击“启动相机”后再授予权限。页面加载本身不应请求相机。
6. 测试结束后点击“停止”，关闭 tunnel，并确认浏览器的摄像头指示已消失。

也可以使用组织批准的 HTTPS tunnel 或由本机/组织 CA 签发并已在测试手机上正确信任的证书。证书、私钥、token 和 tunnel 凭据不得放入仓库；禁止使用忽略证书错误的浏览器参数。

### Manual evidence checklist

将结果记录到新的人工验收 Task，不要把桌面结果填成真机结果：

```text
Device class / OS / Browser:
Camera permission result:
Front camera result:
Rear camera result:
Camera switch result:
Mirror behavior:
Preview FPS average:
Visible frame stalls:
Orientation behavior:
Sensor / Preview / User-Action direction sanity:
Raw Video Upload: 0
```

候选门槛 `Preview FPS >=25` 只有在真实手机上测得才可填写。本 README 完成时的门禁固定为：

```text
Implementation Gate = PASS
Real Device Gate = MANUAL_REVIEW_REQUIRED
Task Disposition = READY_FOR_MANUAL_DEVICE_TEST
```

## Coordinate and frame semantics

- `Sensor Coordinate`：媒体轨道的原始非镜像坐标。
- `Preview Coordinate`：仅前摄 UX 预览应用 X 轴镜像；不会重写 sensor 数据。
- `User-Action Coordinate`：保留为语义动作空间，P0 不产生左右移动指导。
- 首选 `requestVideoFrameCallback` 观测合成帧；不可用时以约 30Hz 限频的 `requestAnimationFrame` 回退。
- late frame 是帧间隔超过 50ms 的观测计数；drop estimate 仅在浏览器提供 `presentedFrames` 时估算。
- 所有预览均在主线程、本机内存中进行；页面不保存、不上传、不捕获帧。

## Stop boundary

完成手工真机测试前，不得称为 `LIVE-P0 PASS`。下一建议任务仅为：

```text
XFX_LIVE_PHYSICAL_AGENT_P0_MANUAL_DEVICE_ACCEPTANCE_01
```

不要自动开始 P1。
