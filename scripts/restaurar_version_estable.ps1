# ==============================================================================
# AMARU-CLIMATE: SCRIPT DE RESTAURACIÓN DE VERSIÓN ESTABLE (ROLLBACK DE EMERGENCIA)
# ==============================================================================
# Restaura el código al tag inmutable 'v1.0.0-stable' limpiando cambios fallidos.

param (
    [string]$TargetTag = "v1.0.0-stable"
)

Write-Host "⚠️  INICIANDO RESTAURACIÓN AL ESTADO ESTABLE: $TargetTag" -ForegroundColor Yellow

$Confirm = Read-Host "¿Desea restaurar el código y descartar los cambios no guardados? (S/N)"
if ($Confirm -ne 'S' -and $Confirm -ne 's') {
    Write-Host "Operación cancelada por el usuario." -ForegroundColor Gray
    exit 0
}

Write-Host "Restaurando archivos de trabajo..." -ForegroundColor Cyan
git reset --hard $TargetTag
git clean -fd

Write-Host "✅ SISTEMA RESTAURADO CON ÉXITO AL ESTADO: $TargetTag" -ForegroundColor Green
Write-Host "El backend y frontend vuelven a estar en su versión estable garantizada." -ForegroundColor White
