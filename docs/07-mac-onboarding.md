# 07｜Mac Onboarding

Mac 不重新创建项目。

```bash
cd ~/Projects
git clone <REMOTE_URL> xiangfengxing
cd xiangfengxing
git switch develop
./scripts/check-env.sh
```

验收：

- git status clean
- Web Lab 可启动
- Backend 可启动
- Fixture 可加载
- Contract tests 通过
- 无 Windows 绝对路径
- 无 CRLF-only 核心脚本
