# Requires: Docker Desktop running
# Usage: Right-click start.ps1 and Run with PowerShell, or:
#   pwsh -File .\start.ps1

param(
  [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'

Write-Host "Starting Deepfake stack..." -ForegroundColor Cyan

# Ensure Docker Desktop Linux engine is available; otherwise fallback to local
$dockerOk = $false
try {
  $info = docker info 2>$null
  if ($LASTEXITCODE -eq 0 -and $info -match "Server:") { $dockerOk = $true }
} catch { $dockerOk = $false }

# Ensure we're in the script directory
Set-Location -Path $PSScriptRoot

# PowerShell uses ';' to separate commands, not '&&'
if ($dockerOk) {
  if ($Rebuild) {
    docker-compose down -v
    docker-compose build --no-cache
  }
  docker-compose up --build
} else {
  Write-Host "Docker not available. Starting local dev services..." -ForegroundColor Yellow
  & powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot\start-local.ps1"
}
