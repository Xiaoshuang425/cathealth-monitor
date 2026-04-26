import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# YOLO状态
yolo_available = False
yolo_detector = None

def init_yolo():
    """初始化YOLO模型"""
    global yolo_available, yolo_detector
    if yolo_available:
        return True
    try:
        # 清除可能的缓存
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

# 前端路由
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_file(filename):
    if filename in ['index.html', 'dashboard.html', 'manifest.json', 'service-worker.js']:
        return send_from_directory('.', filename)
    return jsonify({"error": "Not found"}), 404

# API路由
@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "yolo_available": yolo_available})

@app.route('/api/init', methods=['POST'])
def api_init():
    success = init_yolo()
    return jsonify({"success": success, "yolo_available": yolo_available})

@app.route('/api/ai/analyze', methods=['POST'])
def analyze():
    """分析端点"""
    print("\n[API] ====== New Request ======")

    try:
        # 确保YOLO已加载
        if not yolo_available:
            print("[API] Initializing YOLO...")
            init_yolo()

        if not yolo_available:
            print("[API] YOLO not available")
            return jsonify({"success": False, "error": "YOLO not available"}), 503

        # 获取数据
        data = request.get_json()
        print(f"[API] Request data type: {type(data)}")

        if not data or 'image' not in data:
            print("[API] No image data")
            return jsonify({"success": False, "error": "No image data"}), 400

        img_data = data['image']
        print(f"[API] Image data length: {len(str(img_data))}")
        print(f"[API] Image data type: {type(img_data)}")
        print(f"[API] Image data first 100 chars: {str(img_data)[:100]}")

        # 解码图片
        image = yolo_detector.base64_to_image(img_data)
        if image is None:
            print("[API] Decode failed")
            return jsonify({"success": False, "error": "Decode failed"}), 400

        print(f"[API] Decoded image: {image.size}, mode: {image.mode}")

        # 检查detector中的模型状态
        print(f"[API] Detector model: {yolo_detector.model}")
        print(f"[API] Detector model path: {yolo_detector.model_path}")

        # 运行检测
        result = yolo_detector.detect_stool_features(image)
        print(f"[API] Result: {result['detection']['class_name']} (count: {result['detection']['detection_count']})")
        print(f"[API] Analysis info: {result.get('analysis_info', {})}")

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
    app.run(host='127.0.0.1', port=port, debug=False)
