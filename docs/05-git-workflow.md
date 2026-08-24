# 05｜Git Workflow

## Branch

```text
main
develop
feature/*
fix/*
spike/*
```

`main` 保持稳定；`develop` 日常集成。

第一批 Commit：

```text
docs: initialize project baseline
chore: add repository standards
feat: add frontend and backend skeleton
feat: add web lab runtime
```

禁止提交：

- .env
- Secret / Token / Key
- node_modules
- 本地数据库
- Build Artifact
- 大批量原始图片/视频测试资产
