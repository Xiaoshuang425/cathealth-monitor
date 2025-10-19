Write-Host " 诊断前端问题..." -ForegroundColor Yellow

# 检查文件内容
Write-Host "检查 app.js 文件:" -ForegroundColor Cyan
if (Test-Path "backend/public/js/app.js") {
    $content = Get-Content "backend/public/js/app.js" -Raw
    $lines = $content -split "`n" | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host " app.js 存在 ($lines 行代码)" -ForegroundColor Green
    
    # 检查关键函数是否存在
    if ($content -match "loginUser") {
        Write-Host " 找到 loginUser 函数" -ForegroundColor Green
    } else {
        Write-Host " 缺少 loginUser 函数" -ForegroundColor Red
    }
    
    if ($content -match "registerUser") {
        Write-Host " 找到 registerUser 函数" -ForegroundColor Green
    } else {
        Write-Host " 缺少 registerUser 函数" -ForegroundColor Red
    }
} else {
    Write-Host " app.js 文件缺失" -ForegroundColor Red
}

Write-Host "`n检查 HTML 文件:" -ForegroundColor Cyan
if (Test-Path "backend/public/index.html") {
    $html = Get-Content "backend/public/index.html" -Raw
    if ($html -match "app.js") {
        Write-Host " HTML 正确引用了 app.js" -ForegroundColor Green
    } else {
        Write-Host " HTML 没有引用 app.js" -ForegroundColor Red
    }
}

Write-Host "`n 解决方案:" -ForegroundColor Cyan
Write-Host "1. 按 F12 查看浏览器控制台错误" -ForegroundColor White
Write-Host "2. 检查 Network 标签中文件加载状态" -ForegroundColor White
Write-Host "3. 清除浏览器缓存 (Ctrl+F5)" -ForegroundColor White

