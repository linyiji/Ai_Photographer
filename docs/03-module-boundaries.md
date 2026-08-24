# 03｜Module Boundaries

## Backend

```text
apps/api/
  core/
    contracts/
    workflow/
    session/
    events/
    errors/
    observability/
  modules/
    reality/
    target/
    shot/
    live/
    capture/
    qa/
    enhancement/
    final/
    commerce/
  gateways/
    model/
    storage/
    queue/
```

## Frontend

```text
apps/client/src/
  pages/
  features/
  components/
  platform/
  api/
  state/
  contracts/
  design-system/
```

页面 ≠ 模块。

例如 P08 只是 Screen，应组合 LiveShotRuntime、GuidanceOverlay、ReadyState、CameraAdapter，而不是把所有逻辑写进一个页面文件。
