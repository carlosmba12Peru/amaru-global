# AMARU-CLIMATE: SCRIPT DE RESPALDO Y VERSIONAMIENTO RAPIDO
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$ZipFile = Join-Path $BackupDir "amaru_climate_snapshot_$Timestamp.zip"

Write-Host "Generando snapshot de rescate en: $ZipFile" -ForegroundColor Cyan

# Creamos el snapshot via git archive (codigo y configuraciones limpias)
git archive --format=zip --output="$ZipFile" HEAD

if (Test-Path $ZipFile) {
    $Item = Get-Item $ZipFile
    $Size = [math]::Round($Item.Length / 1048576, 2)
    Write-Host "Snapshot creado con exito ($Size MB)." -ForegroundColor Green
    Write-Host "Archivo guardado en: $ZipFile" -ForegroundColor Yellow
} else {
    Write-Host "Error al generar el snapshot." -ForegroundColor Red
}
