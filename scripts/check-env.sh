#!/usr/bin/env bash
set -u

echo "向风行开发环境检查"
echo "===================="

for cmd in git node pnpm python3 docker; do
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "[OK] $cmd"
    "$cmd" --version || true
  else
    echo "[MISSING] $cmd"
  fi
  echo
done

echo "检查完成。具体版本在 Skeleton/Camera Spike 前锁定。"
