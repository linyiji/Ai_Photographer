# 04｜Development Environments

核心原则：

> One Repository, Multiple Runtimes, Reproducible Environment.

```text
Shared Core
├─ Web Lab      # Debug / Replay
├─ WeChat       # 第一产品 Runtime
├─ Douyin       # 第二阶段
└─ Native       # 后续性能升级
```

Windows 与 Mac 使用同一个 Git Remote。

环境差异只能进入：

- Platform Adapter
- Local Configuration
- OS-specific Script

不能出现两套业务源码。
