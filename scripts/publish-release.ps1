# Creates (idempotent) the v1.0.0 GitHub release and uploads the desktop artifact.
$ErrorActionPreference = 'Stop'
$Token = $env:GT
$Owner = 'KiaAgentX'; $Repo = 'portfolio'
$Tag = 'v1.0.0'
$Exe = Join-Path $PSScriptRoot '..\release\Kia-Portfolio-1.0.0-win-x64.exe'
$Log = Join-Path $PSScriptRoot '..\release-upload.log'
function W($m) { $line = "[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m; Add-Content -Path $Log -Value $line; Write-Output $line }

$H = @{ Authorization = "Bearer $Token"; Accept = 'application/vnd.github+json' }
$Name = 'Kia Portfolio v1.0.0 — Desktop (Windows portable, offline)'

$Body = [string](Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot '..\release-notes.md'))
try {
  $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/releases/tags/$Tag" -Headers $H
  W "release $Tag exists ($($rel.id))"
} catch {
  $post = @{ tag_name = $Tag; name = $Name; body = $Body; draft = $false; prerelease = $false } | ConvertTo-Json -Depth 5 -Compress
  $rel = Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$Owner/$Repo/releases" -Headers $H -Body ([System.Text.Encoding]::UTF8.GetBytes($post)) -ContentType 'application/json; charset=utf-8'
  W "release created id=$($rel.id) url=$($rel.html_url)"
}

$assetName = 'Kia-Portfolio-1.0.0-win-x64.exe'
$has = $rel.assets | Where-Object { $_.name -eq $assetName }
if ($has) { W "asset already uploaded: $($has.name) ($([math]::Round($has.size/1MB))MB)"; exit 0 }

$uploadBase = ($rel.upload_url -split '\{')[0]
$size = (Get-Item $Exe).Length
W "uploading $assetName ($([math]::Round($size/1MB,1)) MB)..."

Add-Type -AssemblyName System.Net.Http
$httpClient = [System.Net.Http.HttpClient]::new()
$httpClient.Timeout = [TimeSpan]::FromHours(2)
$fs = [System.IO.File]::OpenRead((Resolve-Path $Exe))
try {
  $content = [System.Net.Http.StreamContent]::new($fs)
  $content.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::new('application/x-msdownload')
  $url = $uploadBase + '?name=' + [uri]::EscapeDataString($assetName)
  $resp = $httpClient.PostAsync($url, $content).Result
  $code = [int]$resp.StatusCode
  $txt = $resp.Content.ReadAsStringAsync().Result
  if ($code -in 200,201) {
    $j = $txt | ConvertFrom-Json
    W "UPLOAD OK asset id=$($j.id) size=$([math]::Round($j.size/1MB,1))MB url=$($j.browser_download_url)"
    exit 0
  } else {
    W "UPLOAD FAIL http=$code body=$($txt.Substring(0,[Math]::Min(500,$txt.Length)))"
    exit 2
  }
} finally { $fs.Dispose(); $httpClient.Dispose() }
