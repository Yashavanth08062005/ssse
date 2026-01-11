<#
Health check script for local services.
Run from repo root:
  powershell -ExecutionPolicy Bypass -File .\scripts\health-check.ps1
#>

$services = @{
    Flights = 'http://localhost:7001/health'
    Hotels = 'http://localhost:7003/health'
    IntlFlights = 'http://localhost:7005/health'
    BAP = 'http://localhost:8081/health'
    Frontend = 'http://localhost:3000'
}

foreach ($k in $services.Keys) {
    $url = $services[$k]
    try {
        $r = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5 -ErrorAction Stop
        Write-Host "$k => OK => $url"
    } catch {
        Write-Host "$k => FAIL => $url : $($_.Exception.Message)"
    }
}
