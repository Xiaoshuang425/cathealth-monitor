@echo off
chcp 65001 > nul
echo ========================================
echo   ????????????
echo ========================================
echo ??: 3006
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo ???????...
    call npm install
    if errorlevel 1 (
        echo  ??????
        pause
        exit /b 1
    )
)

echo ?????...
echo ????: http://localhost:3006
echo.
echo ? Ctrl+C ?????
echo ========================================
echo.

node server.js

pause
