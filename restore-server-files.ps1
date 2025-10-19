# 服务器文件恢复脚本
Write-Host " 恢复服务器文件..." -ForegroundColor Cyan

$backupDir = "server-backup-20251020-073208"

if (Test-Path $backupDir) {
    Get-ChildItem $backupDir | ForEach-Object {
        Copy-Item $_.FullName -Destination "." -Force
        Write-Host " 恢复: $($_.Name)" -ForegroundColor Green
    }
    Write-Host " 服务器文件恢复完成!" -ForegroundColor Green
} else {
    Write-Host " 备份文件夹不存在: $backupDir" -ForegroundColor Red
}
