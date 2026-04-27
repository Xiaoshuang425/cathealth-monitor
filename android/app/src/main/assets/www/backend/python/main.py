#!/usr/bin/env python3
"""Render 启动入口"""
import sys
import os

# 获取项目根目录
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
backend_flask_dir = os.path.join(root_dir, 'backend', 'flask')

# 添加路径
sys.path.insert(0, root_dir)
sys.path.insert(0, backend_flask_dir)

# 切换到后端目录
os.chdir(backend_flask_dir)

# 导入真正的 Flask 应用
from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10002))
    print(f"[RENDER] Starting Flask app on port {port}")
    print(f"[RENDER] Working dir: {os.getcwd()}")
    app.run(host='0.0.0.0', port=port, debug=False)
