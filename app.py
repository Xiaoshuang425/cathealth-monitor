import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS

# 整体项目部署配置
app = Flask(__name__)
CORS(app)

# 添加backend/python到路径
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend", "python")
sys.path.append(backend_dir)

print(f" CatHealth整体项目部署")
print(f" 根目录: {current_dir}")
print(f" Backend目录: {backend_dir}")

# 动态导入YOLO服务
yolo_detector = None
try:
    # 添加src目录到路径
    src_dir = os.path.join(backend_dir, "src")
    sys.path.append(src_dir)
    
    from yolo.detector import YOLODetector
    print(" 成功导入YOLODetector")
    
    # 初始化检测器
    model_path = os.path.join(backend_dir, "models", "best.pt")
    yolo_detector = YOLODetector(model_path=model_path)
    print(f" 模型加载状态: {yolo_detector.model is not None}")
    
except Exception as e:
    print(f" YOLO初始化失败: {e}")
    yolo_detector = None

# 服务路由
@app.route('/')
def home():
    return jsonify({
        "service": "CatHealth Full Stack App",
        "status": "running", 
        "yolo_loaded": yolo_detector is not None and yolo_detector.model is not None
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "services": {
            "web": "running",
            "yolo": "loaded" if yolo_detector and yolo_detector.model else "not loaded"
        }
    })

@app.route('/api/ai/analyze', methods=['POST'])
def analyze_stool():
    """YOLOv8分析端点"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"success": False, "error": "没有图像数据"}), 400
        
        print(" 收到AI分析请求")
        
        # 检查YOLO服务
        if yolo_detector is None or yolo_detector.model is None:
            return jsonify({
                "success": True,
                "detection": {
                    "color": "模拟", "texture": "模拟", "shape": "模拟",
                    "confidence": 0.90, "class_name": "normal"
                },
                "health_analysis": {
                    "risk_level": "normal", "message": "模拟分析完成",
                    "description": "YOLO服务配置中",
                    "confidence": 0.90,
                    "recommendation": "服务准备中，请稍后重试",
                    "detected_class": "normal"
                },
                "simulation": True
            })
        
        # 使用YOLO分析
        image = yolo_detector.base64_to_image(data['image'])
        if image is None:
            return jsonify({"success": False, "error": "图像解码失败"}), 400
        
        result = yolo_detector.detect_stool_features(image)
        return jsonify({"success": True, **result})
        
    except Exception as e:
        print(f" 分析失败: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

# 静态文件服务 - 提供前端页面
@app.route('/docs/<path:filename>')
def serve_docs(filename):
    """提供docs目录下的静态文件"""
    docs_dir = os.path.join(current_dir, 'docs')
    return app.send_static_file(filename)

@app.route('/')
def serve_index():
    """服务首页"""
    return app.send_static_file('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f" 服务启动在端口 {port}")
    print(f" YOLO状态: {'已加载' if yolo_detector and yolo_detector.model else '未加载'}")
    app.run(host='0.0.0.0', port=port, debug=False)
