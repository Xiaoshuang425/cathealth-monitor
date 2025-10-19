Write-Host " 简单系统检查" -ForegroundColor Green

# 检查Node.js
$node = tasklist | findstr node
if ($node) {
    Write-Host "✅ 发现Node.js在运行" -ForegroundColor Green
    $node
} else {
    Write-Host " 没有Node.js进程" -ForegroundColor Red
}

# 检查Python
$python = tasklist | findstr python
if ($python) {
    Write-Host " 发现Python在运行" -ForegroundColor Green  
    $python
} else {
    Write-Host " 没有Python进程" -ForegroundColor Red
}

Write-Host "`n 试试访问:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host "   http://localhost:3002" -ForegroundColor White
