Write-Host " 启动猫咪健康监测系统..." -ForegroundColor Green

# 检查必要文件
if (Test-Path "server.js") {
    Write-Host " 找到 server.js" -ForegroundColor Green
} else {
    Write-Host " 错误: 找不到 server.js" -ForegroundColor Red
    Write-Host "请确保在 cathealth-app 目录中运行此脚本" -ForegroundColor Yellow
    exit
}

# 检查backend/public目录
if (Test-Path "backend\public") {
    Write-Host " 找到前端文件" -ForegroundColor Green
} else {
    Write-Host "  警告: backend\public 目录可能不存在" -ForegroundColor Yellow
}

# 获取IP地址用于手机访问
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -match "Wi-Fi|Ethernet|网络" -and $_.IPAddress -ne "127.0.0.1"
} | Select-Object -First 1).IPAddress

Write-Host "`n 访问信息:" -ForegroundColor Cyan
Write-Host "   电脑: http://localhost:3001" -ForegroundColor White
Write-Host "   手机: http://$ip`:3001" -ForegroundColor White
Write-Host "`n 启动服务器中..." -ForegroundColor Yellow

# 启动服务器
node server.js
