$ErrorActionPreference = "Continue"

Write-Host "向风行开发环境检查" -ForegroundColor Cyan
Write-Host "===================="

function Check-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) {
    Write-Host "[OK] $name" -ForegroundColor Green
    & $name --version
  } else {
    Write-Host "[MISSING] $name" -ForegroundColor Yellow
  }
  Write-Host ""
}

Check-Command "git"
Check-Command "node"
Check-Command "pnpm"
Check-Command "python"
Check-Command "docker"

Write-Host "检查完成。具体版本在 Skeleton/Camera Spike 前锁定。" -ForegroundColor Cyan
