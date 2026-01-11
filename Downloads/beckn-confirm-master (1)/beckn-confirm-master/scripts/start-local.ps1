<#
Start all services locally for development (Windows PowerShell).

This script will:
- kill processes listening on common project ports to avoid collisions
- start Hotels, Flights, Intl-Flights BPPs, then BAP, then frontend in new PowerShell windows
- set DB env vars (DB_PASSWORD defaulted to 123456)

Usage: From repository root run:
  powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
#>

$ErrorActionPreference = 'Continue'

Set-StrictMode -Version Latest

function Kill-Port {
    param([int]$port)
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            foreach ($c in $conns) {
                try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch {}
            }
        }
    } catch {
        Write-Host ("Could not enumerate/kill processes on port {0}: {1}" -f $port, $_)
    }
}

Write-Host "Stopping processes on ports: 3000, 8081, 7001, 7003, 7005"
foreach ($p in 3000,8081,7001,7003,7005) { Kill-Port $p }

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = Resolve-Path "$root\.."
Write-Host "Repository root: $repo"

# Common DB env
$dbEnv = @{
    DB_HOST = 'localhost'
    DB_PORT = '5432'
    DB_NAME = 'travel_discovery'
    DB_USER = 'postgres'
    DB_PASSWORD = '123456'
}

function Start-ServiceWindow {
    param(
        [string]$workdir,
        [string]$command,
        [hashtable]$env = $null
    )
    $setEnvCmds = @()
    if ($env) {
        foreach ($k in $env.Keys) {
            $val = $env[$k] -replace "'","''"
            $setEnvCmds += "Set-Item -Path Env:\\$k -Value '$val'"
        }
    }
    $allCmd = @()
    if ($setEnvCmds.Count -gt 0) { $allCmd += $setEnvCmds }
    $allCmd += "cd '$workdir'"
    $allCmd += $command
    $cmd = $allCmd -join '; '
    Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',$cmd -WindowStyle Normal
}

Write-Host "Starting Hotels BPP..."
Start-ServiceWindow -workdir "$repo\travel-discovery-bpp-hotels" -command "npm install --silent; npm run dev" -env $dbEnv

Write-Host "Starting Flights BPP..."
Start-ServiceWindow -workdir "$repo\travel-discovery-bpp-flights" -command "npm install --silent; npm run dev" -env $dbEnv

Write-Host "Starting Intl Flights BPP..."
Start-ServiceWindow -workdir "$repo\travel-discovery-bpp-international-flights" -command "npm install --silent; npm run dev" -env $dbEnv

Write-Host "Starting BAP..."
Start-ServiceWindow -workdir "$repo\bap-travel-discovery" -command "npm install --silent; npm run dev" -env $dbEnv

Write-Host "Starting Frontend (Vite) on port 3000..."
$feEnv = $dbEnv.Clone()
$feEnv['PORT'] = '3000'
$feEnv['VITE_BAP_URL'] = 'http://localhost:8081'
Start-ServiceWindow -workdir "$repo\frontend-travel-discovery" -command "npm install --silent; npm run dev" -env $feEnv

Write-Host "All services started (each in its own PowerShell window). Check individual windows and logs for errors."
