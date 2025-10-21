@echo off
echo CatHealth ????
echo ===================
echo ??: https://cathealth-backend1.onrender.com
echo.

:monitor
echo [%time%] ??????...
echo.

echo 1. ????:
curl -s https://cathealth-backend1.onrender.com/ > home.txt
type home.txt
echo.

echo 2. ??????:
curl -s https://cathealth-backend1.onrender.com/api/health > health.txt
type health.txt
echo.

echo 3. ??YOLO??:
curl -s https://cathealth-backend1.onrender.com/api/debug/yolo-status > yolo.txt 2>nul
if %errorlevel% == 0 (
    type yolo.txt
) else (
    echo  YOLO???????
)
echo.

echo 4. ??2??????...
timeout /t 120 /nobreak > nul
echo.
goto monitor
