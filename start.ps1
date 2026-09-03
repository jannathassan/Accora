<#
  Accora — One-click development / demo startup.

  Starts both the Python backend (FastAPI on port 8000) and the
  Vite frontend dev server (port 5173), then opens Accora in the
  default browser.

  Usage:
    .\start.ps1            # normal start
    .\start.ps1 -NoBrowser # start without opening browser
#>

param(
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Write-Host ''
Write-Host '  Accora — Starting...' -ForegroundColor Cyan
Write-Host ''

# ── 1. Start backend ──────────────────────────────────────────────
$backendDir = Join-Path $root 'backend'
Write-Host '  [1/2] Starting backend on http://127.0.0.1:8000' -ForegroundColor White

$backend = Start-Process -FilePath python `
    -ArgumentList '-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000' `
    -WorkingDirectory $backendDir `
    -PassThru `
    -NoNewWindow

# Wait for backend readiness (poll up to 15 seconds)
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/' -UseBasicParsing -TimeoutSec 1 -ErrorAction Stop
        if ($r.StatusCode -lt 500) { $ready = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 500
}

if ($ready) {
    Write-Host '        Backend is ready.' -ForegroundColor Green
} else {
    Write-Host '        Backend may still be starting — continuing anyway.' -ForegroundColor Yellow
}

# ── 2. Start frontend ─────────────────────────────────────────────
$frontendDir = Join-Path $root 'frontend'
Write-Host '  [2/2] Starting frontend on http://127.0.0.1:5173' -ForegroundColor White

$frontend = Start-Process -FilePath npx `
    -ArgumentList 'vite','--host','127.0.0.1','--port','5173' `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -NoNewWindow

Start-Sleep -Seconds 3
Write-Host '        Frontend is starting.' -ForegroundColor Green

# ── 3. Open browser ───────────────────────────────────────────────
if (-not $NoBrowser) {
    Write-Host ''
    Write-Host '  Opening Accora in your browser...' -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process 'http://127.0.0.1:5173'
}

Write-Host ''
Write-Host '  Accora is running!' -ForegroundColor Green
Write-Host '  Frontend:  http://127.0.0.1:5173' -ForegroundColor White
Write-Host '  Backend:   http://127.0.0.1:8000' -ForegroundColor White
Write-Host ''
Write-Host '  Press Ctrl+C to stop both servers.' -ForegroundColor Gray
Write-Host ''

# ── 4. Cleanup on exit ────────────────────────────────────────────
try {
    Wait-Process -Id $frontend.Id
} finally {
    Write-Host '  Shutting down...' -ForegroundColor Yellow
    if (-not $backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    if (-not $frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host '  Accora stopped.' -ForegroundColor White
}
