# Render 入口文件
import sys
import os

# 設置數據庫路徑（Render 使用 /data）
if os.environ.get('RENDER'):
    os.environ['DATABASE_PATH'] = '/data/cathealth.db'
    print("[RENDER] Setting database path to /data/cathealth.db")

# 獲取項目根目錄
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, 'backend', 'flask')

# 添加路徑
sys.path.insert(0, root_dir)
sys.path.insert(0, backend_dir)

print(f"[INIT] Root dir: {root_dir}")
print(f"[INIT] Backend dir: {backend_dir}")
print(f"[INIT] Python path: {sys.path}")

# 切換到 backend/flask 目錄（為了數據庫路徑正確）
os.chdir(backend_dir)

# 導入 Flask 應用
print("[INIT] Importing Flask app...")
try:
    from app import app
    print("[INIT] Flask app imported successfully")
except Exception as e:
    print(f"[INIT] Error importing app: {e}")
    import traceback
    traceback.print_exc()
    raise

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10002))
    print(f"[SERVER] Starting on http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
