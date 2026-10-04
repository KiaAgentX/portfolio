$ErrorActionPreference = 'Continue'
$Token = $env:GT
$Owner = 'KiaAgentX'; $Repo = 'portfolio'; $ReleaseId = '402944514'
$PartsDir = Join-Path $PSScriptRoot '..\release\parts'
$Log = Join-Path $PSScriptRoot '..\parts-upload.log'
function W($m) { $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m; Add-Content -Path $Log -Value $line; Write-Output $line }

$H = @{ Authorization = "Bearer $Token"; Accept = 'application/vnd.github+json' }
$existing = @()
try { $existing = (Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/$ReleaseId/assets" -Headers $H).name } catch { W "asset list failed: $($_.Exception.Message)" }

$files = Get-ChildItem $PartsDir | Sort-Object Name
W ("uploading " + $files.Count + " files (existing: " + $existing.Count + ")")
$fail = 0
foreach ($f in $files) {
  if ($existing -contains $f.Name) { W ("SKIP " + $f.Name + " (already uploaded)"); continue }
  $url = "https://uploads.github.com/repos/$Owner/$Repo/releases/$ReleaseId/assets?name=" + [uri]::EscapeDataString($f.Name)
  $ok = $false
  for ($a = 1; $a -le 4 -and -not $ok; $a++) {
    W ("UPLOAD " + $f.Name + " (" + [math]::Round($f.Length/1MB,1) + " MB) attempt " + $a)
    $out = & curl.exe -sS -X POST $url -H "Authorization: Bearer $Token" -H 'Accept: application/vnd.github+json' -H 'Content-Type: application/octet-stream' --data-binary "@$($f.FullName)" --connect-timeout 30 --speed-limit 250 --speed-time 60 --retry 2 --retry-all-errors --retry-delay 10 -o "$env:TEMP\part-resp.json" -w 'HTTP %{http_code} in %{time_total}s sent=%{size_upload}'
    W ("  -> " + $out)
    if ($out -match 'HTTP 20[01]') { $ok = $true }
    else { Start-Sleep -Seconds 20 }
  }
  if (-not $ok) { $fail++; W ("FAILED " + $f.Name + " — re-run this script to resume") }
}
if ($fail -eq 0) { W 'ALL PARTS UPLOADED'; exit 0 } else { W "INCOMPLETE: $fail part(s) failed — re-run to resume"; exit 2 }
