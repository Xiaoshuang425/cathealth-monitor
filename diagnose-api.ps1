Write-Host " 诊断分析API问题..." -ForegroundColor Yellow

# 检查文件
Write-Host "检查必要文件:" -ForegroundColor Cyan
$files = @(
    "backend/routes/analysis.js",
    "server.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host " $file 存在" -ForegroundColor Green
    } else {
        Write-Host " $file 缺失" -ForegroundColor Red
    }
}

# 检查server.js中的路由配置
Write-Host "`n检查路由配置:" -ForegroundColor Cyan
if (Test-Path "server.js") {
    $serverContent = Get-Content "server.js" -Raw
    if ($serverContent -match "app.use.*analysis") {
        Write-Host " 分析路由配置正确" -ForegroundColor Green
    } else {
        Write-Host " 分析路由配置缺失" -ForegroundColor Red
        Write-Host "请在server.js中添加: app.use('/api/analysis', require('./backend/routes/analysis'));" -ForegroundColor Yellow
    }
}

Write-Host "`n 解决方案:" -ForegroundColor Cyan
Write-Host "1. 重启Node.js服务: npm start" -ForegroundColor White
Write-Host "2. 测试API: http://localhost:3000/api/analysis/analyze" -ForegroundColor White
Write-Host "3. 检查控制台错误信息" -ForegroundColor White
