# 06｜Windows First Setup

## 推荐位置

```text
D:\Projects\xiangfengxing
```

避免 Desktop、Downloads、自动同步目录。

## 初始化 Git

```powershell
mkdir D:\Projects\xiangfengxing
cd D:\Projects\xiangfengxing

git init
git branch -M main
```

复制本初始化包内容后：

```powershell
git add .
git commit -m "docs: initialize project baseline"

git remote add origin <REMOTE_URL>
git push -u origin main

git switch -c develop
git push -u origin develop
```

## 环境

Windows Native：

- Git
- VS Code
- Node / pnpm
- Chrome
- 微信开发者工具

Docker Desktop / WSL2：

- FastAPI
- PostgreSQL
- Redis
- Worker

先运行：

```powershell
.\scripts\check-env.ps1
```
