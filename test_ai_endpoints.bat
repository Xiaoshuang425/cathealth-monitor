@echo off
echo ??CatHealth AI??...
echo.

echo 1. ??????:
curl -s https://cathealth-backend1.onrender.com/api/health
echo.

echo 2. ??AI??:
curl -s https://cathealth-backend1.onrender.com/api/debug/yolo-status
echo.

echo 3. ??AI???? (??????):
curl -X POST https://cathealth-backend1.onrender.com/api/ai/analyze -H "Content-Type: application/json" -d "{\"image\":\"test\"}"
echo.

pause
