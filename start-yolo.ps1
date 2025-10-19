Write-Host " 启动猫咪健康监测系统 + 真实YOLO AI分析" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 检查best.pt文件
if (Test-Path "best.pt") {
    Write-Host " 找到YOLO模型文件: best.pt" -ForegroundColor Green
} else {
    Write-Host " 未找到best.pt文件" -ForegroundColor Red
    Write-Host " 请将best.pt文件放在: $(Get-Location)" -ForegroundColor Yellow
}

# 启动YOLO Python服务
Write-Host " 启动YOLO AI分析服务..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "yolo_service.py"

# 等待YOLO服务启动
Write-Host " 等待YOLO服务启动(5秒)..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 启动Node.js服务器
Write-Host " 启动Web服务器..." -ForegroundColor Yellow
node server.js
