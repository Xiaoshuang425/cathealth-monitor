# 自动备份脚本 - backup_utils.ps1
function Backup-Project {
    param(
        [string]$BackupName = "auto_backup"
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups/${BackupName}_$timestamp"
    
    Write-Host " 开始备份项目到: $backupDir" -ForegroundColor Yellow
    
    # 创建备份目录
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # 备份重要文件
    $filesToBackup = @(
        "backend\public\index.html",
        "backend\public\js\app.js", 
        "backend\public\manifest.json",
        "backend\public\service-worker.js",
        "server.js",
        "yolo_service.py"
    )
    
    $backupCount = 0
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $fileName = (Get-Item $file).Name
            Copy-Item $file "$backupDir\${fileName}.backup"
            Write-Host "   备份: $file" -ForegroundColor Green
            $backupCount++
        } else {
            Write-Host "    跳过(不存在): $file" -ForegroundColor Yellow
        }
    }
    
    Write-Host " 备份完成! 位置: $backupDir" -ForegroundColor Green
    Write-Host " 共备份了 $backupCount 个文件" -ForegroundColor Cyan
    
    return $backupDir
}

# 安全文件更新函数
function Safe-FileUpdate {
    param(
        [string]$FilePath,
        [string]$NewContent,
        [string]$Description
    )
    
    Write-Host "`n 准备修改文件: $FilePath" -ForegroundColor Yellow
    Write-Host " 修改描述: $Description" -ForegroundColor Cyan
    
    # 备份原文件
    $backupDir = Backup-Project "before_$(Split-Path $FilePath -Leaf)_update"
    
    # 显示原文件和新文件的差异（前几行）
    if (Test-Path $FilePath) {
        Write-Host "`n 原文件前3行:" -ForegroundColor Gray
        Get-Content $FilePath -First 3 | ForEach-Object { Write-Host "  | $_" -ForegroundColor Gray }
    }
    
    Write-Host "`n 新文件前3行:" -ForegroundColor Green  
    $NewContent.Split("`n")[0..2] | ForEach-Object { Write-Host "  | $_" -ForegroundColor Green }
    
    Write-Host "`n 确认要替换吗？(y/n)" -ForegroundColor Yellow -NoNewline
    $confirm = Read-Host
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        # 停止可能占用文件的进程
        Write-Host " 停止相关进程..." -ForegroundColor Yellow
        taskkill /f /im node.exe 2>$null
        taskkill /f /im python.exe 2>$null
        Start-Sleep -Seconds 2
        
        # 写入新内容
        try {
            $NewContent | Out-File -FilePath $FilePath -Encoding UTF8
            Write-Host " 文件已更新: $FilePath" -ForegroundColor Green
            Write-Host " 备份位置: $backupDir" -ForegroundColor Cyan
            return $true
        } catch {
            Write-Host " 文件写入失败: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host " 操作已取消" -ForegroundColor Red
        return $false
    }
}

Write-Host " 备份工具已加载！" -ForegroundColor Green
Write-Host " 可用命令:" -ForegroundColor Cyan
Write-Host "   - Backup-Project '描述'" -ForegroundColor White
Write-Host "   - Safe-FileUpdate -FilePath '路径' -NewContent '内容' -Description '描述'" -ForegroundColor White
