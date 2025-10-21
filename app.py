import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)

# 云部署配置
is_render = 'RENDER' in os.environ
current_dir = os.path.dirname(os.path.abspath(__file__))

print(f" 运行环境: {'Render' if is_render else '本地'}")

# YOLO服务状态
yolo_available = False
yolo_detector = None

if is_render:
    # Render环境 - 尝试加载YOLO
    try:
        backend_dir = os.path.join(current_dir, "backend", "python")
        sys.path.append(backend_dir)
        
        src_dir = os.path.join(backend_dir, "src")
        sys.path.append(src_dir)
        
        from yolo.detector import YOLODetector
        
        # 在Render上检查模型文件
        model_path = os.path.join(backend_dir, "models", "best.pt")
        if os.path.exists(model_path):
            print(f" 找到模型文件: {model_path}")
            yolo_detector = YOLODetector(model_path=model_path)
            yolo_available = yolo_detector.model is not None
            print(f" YOLO加载: {'成功' if yolo_available else '失败'}")
        else:
            print(f" 模型文件不存在: {model_path}")
            print(" 建议: 确保模型文件已提交到Git仓库")
            
    except Exception as e:
        print(f" YOLO初始化失败: {e}")
        yolo_available = False
else:
    # 本地环境
    try:
        backend_dir = os.path.join(current_dir, "backend", "python")
        sys.path.append(backend_dir)
        
        src_dir = os.path.join(backend_dir, "src")
        sys.path.append(src_dir)
        
        from yolo.detector import YOLODetector
        
        model_path = os.path.join(backend_dir, "models", "best.pt")
        yolo_detector = YOLODetector(model_path=model_path)
        yolo_available = yolo_detector.model is not None
        print(f" 本地YOLO加载: {'成功' if yolo_available else '失败'}")
        
    except Exception as e:
        print(f" 本地YOLO初始化失败: {e}")
        yolo_available = False

@app.route('/')
def home():
    return jsonify({
        "service": "CatHealth Full Stack",
        "status": "running",
        "yolo_available": yolo_available,
        "environment": "render" if is_render else "local"
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "yolo": "available" if yolo_available else "unavailable",
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None
    })

@app.route('/api/ai/analyze', methods=['POST'])
def analyze_stool():
    """智能分析端点 - 自动处理YOLO可用性"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({"success": False, "error": "没有图像数据"}), 400
        
        print(f" 收到分析请求 - YOLO状态: {'可用' if yolo_available else '不可用'}")
        
        if not yolo_available or yolo_detector is None:
            # YOLO不可用，返回模拟结果但标明状态
            return jsonify({
                "success": True,
                "detection": {
                    "color": "模拟", "texture": "模拟", "shape": "模拟",
                    "confidence": 0.85, "class_name": "normal"
                },
                "health_analysis": {
                    "risk_level": "normal", "message": "模拟分析",
                    "description": "AI服务准备中，当前使用模拟数据",
                    "confidence": 0.85,
                    "recommendation": "YOLOv8服务配置中，请稍后重试真实检测",
                    "detected_class": "normal"
                },
                "simulation": True,
                "yolo_available": False
            })
        
        # 使用真实YOLO检测
        image = yolo_detector.base64_to_image(data['image'])
        if image is None:
            return jsonify({"success": False, "error": "图像解码失败"}), 400
        
        result = yolo_detector.detect_stool_features(image)
        result["yolo_available"] = True
        result["simulation"] = False
        
        return jsonify({"success": True, **result})
        
    except Exception as e:
        print(f" 分析失败: {e}")
        return jsonify({
            "success": False, 
            "error": str(e),
            "yolo_available": yolo_available
        }), 500

@app.route('/api/debug/yolo-status')
def debug_yolo():
    """调试YOLO状态"""
    return jsonify({
        "yolo_available": yolo_available,
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None,
        "environment": "render" if is_render else "local",
        "current_dir": current_dir,
        "model_path": yolo_detector.model_path if yolo_detector else None,
        "model_exists": os.path.exists(yolo_detector.model_path) if yolo_detector else False
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f" 服务启动在端口 {port}")
    print(f" YOLO可用: {yolo_available}")
    print(f" 环境: {'Render' if is_render else '本地'}")
    
    app.run(host='0.0.0.0', port=port, debug=not is_render)
