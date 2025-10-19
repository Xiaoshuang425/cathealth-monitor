@echo off
echo 正在启动猫咪健康监测系统...
echo 端口: 3005
echo.

if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
)

echo 启动服务器...
node server.js

pause
