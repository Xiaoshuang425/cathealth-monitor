@echo off
echo 🐱 启动猫咪健康监测系统...

:: 检查Node.js是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 请先安装Node.js
    pause
    exit /b 1
)

:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 请先安装Python
    pause
    exit /b 1
)

echo 📦 安装Node.js依赖...
npm install

echo 🐍 安装Python依赖...
cd python
pip install -r requirements.txt
cd ..

echo 🗄️ 初始化数据库...
npm run init-db

echo 🚀 启动服务...
npm run start-all

pause