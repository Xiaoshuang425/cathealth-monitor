@echo off
cd /d "C:\Users\user\cathealth-app\backend\python"
echo ?? CatHealth YOLOv8 ??...
echo ????: %CD%
echo.

echo ??Python??...
python --version
echo.

echo ????...
python -c "import flask; print('? Flask ???'); import ultralytics; print('? Ultralytics ???'); import cv2; print(' OpenCV ???')"
echo.

echo ????...
python main.py
pause
