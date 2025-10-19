# 手动修复index.html的脚本
# 请在关闭所有可能占用index.html的程序后运行此脚本

Write-Host "正在修复index.html..." -ForegroundColor Yellow

$content = Get-Content "backend\public\index.html" -Raw

# 修复所有路径
$content = $content -replace 'href="/manifest.json"', 'href="manifest.json"'
$content = $content -replace 'href="/images/icons/', 'href="images/icons/"'
$content = $content -replace 'src="/js/', 'src="js/"'
$content = $content -replace 'href="/css/', 'href="css/"'

# 移除有问题的图标引用
$content = $content -replace '<link rel="apple-touch-icon"[^>]*>', ''

# 保存修复后的文件
$content | Out-File -FilePath "backend\public\index_fixed.html" -Encoding UTF8

Write-Host " 已创建修复后的文件: backend\public\index_fixed.html" -ForegroundColor Green
Write-Host "请手动重命名: Rename-Item index_fixed.html index.html" -ForegroundColor Yellow
