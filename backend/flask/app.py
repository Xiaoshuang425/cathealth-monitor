import os
import sys
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, g
from flask_cors import CORS
from database import Database

app = Flask(__name__)
# 允許所有來源（開發階段）
CORS(app, resources={
    r"/api/*": {
        "origins": ["*", "https://xiaoshuang425.github.io", "http://localhost", "http://127.0.0.1"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 配置
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cathealth-secret-key-change-in-production')
app.config['TOKEN_EXPIRY'] = 30  # 天

# 設置數據庫路徑（Render 使用 /data）
if os.environ.get('RENDER'):
    os.environ['DATABASE_PATH'] = '/data/cathealth.db'
    print(f"[DB] Using Render disk path: /data/cathealth.db")

# 初始化數據庫
db = Database()

# YOLO狀態
yolo_available = False
yolo_detector = None

def init_yolo():
    """初始化YOLO模型"""
    global yolo_available, yolo_detector
    if yolo_available:
        return True
    try:
        # 清除可能的緩存
        import importlib
        if 'yolo.detector' in sys.modules:
            del sys.modules['yolo.detector']
        if 'yolo' in sys.modules:
            del sys.modules['yolo']

        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "python")
        sys.path.insert(0, backend_dir)
        sys.path.insert(0, os.path.join(backend_dir, "src"))

        from yolo.detector import YOLODetector
        import yolo.detector as detector_module
        print(f"[INIT] Loaded detector from: {detector_module.__file__}")

        # Verify it's the correct file
        with open(detector_module.__file__, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'self.model(image, conf=self.conf_threshold' in content:
                print("[INIT] Detector version: FIXED (PIL Image passed to model)")
            elif 'np.array(image)' in content:
                print("[INIT] Detector version: BUGGY (numpy array passed)")
            else:
                print("[INIT] Detector version: UNKNOWN")

        model_path = os.path.join(backend_dir, "models", "best.pt")
        print(f"[INIT] Model path: {model_path}")
        print(f"[INIT] Model exists: {os.path.exists(model_path)}")
        if os.path.exists(model_path):
            yolo_detector = YOLODetector(model_path)
            yolo_available = yolo_detector.model is not None
            print(f"[INIT] YOLO loaded: {yolo_available}")
            print(f"[INIT] Conf threshold: {yolo_detector.conf_threshold}")
            return yolo_available
    except Exception as e:
        print(f"[INIT] Error: {e}")
        import traceback
        traceback.print_exc()
    return False

# ========== 認證裝飾器 ==========

def token_required(f):
    """驗證 JWT Token 的裝飾器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'success': False, 'error': 'Token format invalid'}), 401

        if not token:
            return jsonify({'success': False, 'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.get_user_by_id(data['user_id'])
            if not current_user:
                return jsonify({'success': False, 'error': 'User not found'}), 401
            g.current_user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'error': 'Token is invalid'}), 401

        return f(*args, **kwargs)
    return decorated

# ========== 前端路由 ==========

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if filename in ['index.html', 'dashboard.html', 'manifest.json', 'service-worker.js']:
        return send_from_directory('.', filename)
    return jsonify({"error": "Not found"}), 404

# ========== 認證 API ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """用戶註冊"""
    data = request.get_json()

    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    if not email or not password or not name:
        return jsonify({'success': False, 'error': 'Email, password and name are required'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400

    user = db.create_user(email, password, name)
    if not user:
        return jsonify({'success': False, 'error': 'Email already exists'}), 409

    # 生成 token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=app.config['TOKEN_EXPIRY'])
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """用戶登錄"""
    data = request.get_json()

    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    user = db.get_user_by_email(email)
    if not user or not db.verify_password(user, password):
        return jsonify({'success': False, 'error': 'Invalid email or password'}), 401

    # 生成 token
    token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=app.config['TOKEN_EXPIRY'])
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    """獲取當前用戶信息"""
    user = g.current_user
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
    })

@app.route('/api/auth/update', methods=['PUT'])
@token_required
def update_user():
    """更新用戶信息"""
    data = request.get_json()
    user = g.current_user

    name = data.get('name')
    email = data.get('email')

    success = db.update_user(user['id'], name=name, email=email)
    if not success:
        return jsonify({'success': False, 'error': 'Email already exists'}), 409

    updated_user = db.get_user_by_id(user['id'])
    return jsonify({
        'success': True,
        'user': {
            'id': updated_user['id'],
            'email': updated_user['email'],
            'name': updated_user['name']
        }
    })

# ========== 貓咪管理 API ==========

@app.route('/api/cats', methods=['GET'])
@token_required
def get_cats():
    """獲取用戶的所有貓咪"""
    user = g.current_user
    cats = db.get_user_cats(user['id'])
    return jsonify({
        'success': True,
        'cats': cats
    })

@app.route('/api/cats', methods=['POST'])
@token_required
def create_cat():
    """創建新貓咪"""
    user = g.current_user
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'success': False, 'error': 'Cat name is required'}), 400

    cat = db.create_cat(
        user_id=user['id'],
        name=data.get('name'),
        breed=data.get('breed'),
        age=data.get('age'),
        weight=data.get('weight'),
        gender=data.get('gender'),
        photo=data.get('photo'),
        notes=data.get('notes')
    )

    return jsonify({
        'success': True,
        'cat': cat
    })

@app.route('/api/cats/<int:cat_id>', methods=['GET'])
@token_required
def get_cat(cat_id):
    """獲取單個貓咪信息"""
    user = g.current_user
    cat = db.get_cat_by_id(cat_id)

    if not cat or cat['user_id'] != user['id']:
        return jsonify({'success': False, 'error': 'Cat not found'}), 404

    return jsonify({
        'success': True,
        'cat': cat
    })

@app.route('/api/cats/<int:cat_id>', methods=['PUT'])
@token_required
def update_cat(cat_id):
    """更新貓咪信息"""
    user = g.current_user
    data = request.get_json()

    cat = db.update_cat(
        cat_id=cat_id,
        user_id=user['id'],
        name=data.get('name'),
        breed=data.get('breed'),
        age=data.get('age'),
        weight=data.get('weight'),
        gender=data.get('gender'),
        photo=data.get('photo'),
        notes=data.get('notes')
    )

    if not cat:
        return jsonify({'success': False, 'error': 'Cat not found or no permission'}), 404

    return jsonify({
        'success': True,
        'cat': cat
    })

@app.route('/api/cats/<int:cat_id>', methods=['DELETE'])
@token_required
def delete_cat(cat_id):
    """刪除貓咪"""
    user = g.current_user
    success = db.delete_cat(cat_id, user['id'])

    if not success:
        return jsonify({'success': False, 'error': 'Cat not found or no permission'}), 404

    return jsonify({
        'success': True,
        'message': 'Cat deleted successfully'
    })

# ========== 健康記錄 API ==========

@app.route('/api/health-records', methods=['GET'])
@token_required
def get_health_records():
    """獲取健康記錄"""
    user = g.current_user
    cat_id = request.args.get('cat_id', type=int)
    limit = request.args.get('limit', 50, type=int)

    records = db.get_user_health_records(user['id'], cat_id=cat_id, limit=limit)
    return jsonify({
        'success': True,
        'records': records
    })

@app.route('/api/health-records', methods=['POST'])
@token_required
def create_health_record():
    """創建健康記錄"""
    user = g.current_user
    data = request.get_json()

    import json
    record = db.create_health_record(
        user_id=user['id'],
        cat_id=data.get('cat_id'),
        record_type=data.get('record_type', 'stool_analysis'),
        result_data=json.dumps(data.get('result_data')) if data.get('result_data') else None,
        risk_level=data.get('risk_level'),
        confidence=data.get('confidence'),
        notes=data.get('notes')
    )

    return jsonify({
        'success': True,
        'record': record
    })

@app.route('/api/health-records/<int:record_id>', methods=['DELETE'])
@token_required
def delete_health_record(record_id):
    """刪除健康記錄"""
    user = g.current_user
    success = db.delete_health_record(record_id, user['id'])

    if not success:
        return jsonify({'success': False, 'error': 'Record not found or no permission'}), 404

    return jsonify({
        'success': True,
        'message': 'Record deleted successfully'
    })

# ========== 統計 API ==========

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats():
    """獲取用戶統計數據"""
    user = g.current_user
    stats = db.get_user_stats(user['id'])
    return jsonify({
        'success': True,
        'stats': stats
    })

# ========== 原有 API ==========

@app.route('/api/health')
def health():
    """健康檢查端點"""
    return jsonify({
        "status": "healthy",
        "yolo_available": yolo_available,
        "database": "connected"
    })

@app.route('/api/init', methods=['POST'])
def api_init():
    """初始化 YOLO"""
    success = init_yolo()
    return jsonify({"success": success, "yolo_available": yolo_available})

@app.route('/api/ai/analyze', methods=['POST'])
@token_required
def analyze():
    """分析端點（現在需要登錄）"""
    user = g.current_user
    print(f"\n[API] ====== New Request from User {user['id']} ======")

    try:
        # 確保YOLO已加載
        if not yolo_available:
            print("[API] Initializing YOLO...")
            init_yolo()

        if not yolo_available:
            print("[API] YOLO not available")
            return jsonify({"success": False, "error": "YOLO not available"}), 503

        # 獲取數據
        data = request.get_json()
        print(f"[API] Request data type: {type(data)}")

        if not data or 'image' not in data:
            print("[API] No image data")
            return jsonify({"success": False, "error": "No image data"}), 400

        img_data = data['image']
        cat_id = data.get('cat_id')  # 可選：關聯到特定貓咪

        print(f"[API] Image data length: {len(str(img_data))}")

        # 解碼圖片
        image = yolo_detector.base64_to_image(img_data)
        if image is None:
            print("[API] Decode failed")
            return jsonify({"success": False, "error": "Decode failed"}), 400

        print(f"[API] Decoded image: {image.size}, mode: {image.mode}")

        # 運行檢測
        result = yolo_detector.detect_stool_features(image)
        print(f"[API] Result: {result['detection']['class_name']}")

        # 保存健康記錄
        import json
        db.create_health_record(
            user_id=user['id'],
            cat_id=cat_id,
            record_type='stool_analysis',
            result_data=json.dumps(result),
            risk_level=result['risk_metrics']['risk_level'],
            confidence=result['detection']['confidence'],
            notes=result['health_analysis']['message']
        )

        result["success"] = True
        return jsonify(result)

    except Exception as e:
        import traceback
        print(f"[API] ERROR: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10002))
    print(f"[SERVER] Starting on http://127.0.0.1:{port}")
    print(f"[SERVER] Database: {db.db_path}")
    app.run(host='0.0.0.0', port=port, debug=False)
