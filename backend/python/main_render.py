import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

# Render环境配置
is_render = 'RENDER' in os.environ
print(f"🚀 运行在 {'Render' if is_render else '本地'} 环境")

# 添加路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if is_render:
    # Render环境
    src_dir = os.path.join(current_dir, "src")
else:
    # 本地环境
    src_dir = os.path.join(current_dir, "src")

sys.path.append(src_dir)

app = Flask(__name__)
CORS(app)

# 动态导入YOLO检测器
yolo_detector = None
try:
    from yolo.detector import YOLODetector
    print(" 导入YOLODetector成功")
    
    # 在Render上，模型可能需要从其他地方加载
    if is_render:
        model_path = os.path.join(current_dir, "models", "best.pt")
        # 如果模型不存在，尝试其他方式
        if not os.path.exists(model_path):
            print(" 在Render上未找到本地模型文件")
            print(" 建议: 将模型上传到云存储或使用较小的模型")
    else:
        model_path = os.path.join(current_dir, "models", "best.pt")
    
    yolo_detector = YOLODetector(model_path=model_path)
    print(f" 模型加载状态: {yolo_detector.model is not None}")
    
except Exception as e:
    print(f" YOLO初始化失败: {e}")
    yolo_detector = None

@app.route('/')
def home():
    return jsonify({
        "service": "CatHealth YOLOv8 API",
        "status": "running",
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None,
        "environment": "render" if is_render else "local"
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CatHealth YOLO Service",
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None,
        "environment": "render" if is_render else "local"
    })

@app.route('/analyze/stool', methods=['POST'])
def analyze_stool():
    """分析猫咪排泄物图像"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "没有提供图像数据"
            }), 400
        
        print(" 收到分析请求")
        
        # 检查YOLO服务状态
        if yolo_detector is None or yolo_detector.model is None:
            return jsonify({
                "success": True,
                "detection": {
                    "color": "模拟", "texture": "模拟", "shape": "模拟",
                    "confidence": 0.90, "class_name": "normal"
                },
                "health_analysis": {
                    "risk_level": "normal", "message": "模拟分析完成",
                    "description": "YOLO服务暂不可用，使用模拟数据",
                    "confidence": 0.90,
                    "recommendation": "服务配置中，请稍后重试",
                    "detected_class": "normal"
                },
                "simulation": True
            })
        
        # 使用YOLO进行分析
        image = yolo_detector.base64_to_image(data['image'])
        if image is None:
            return jsonify({
                "success": False,
                "error": "无法解码图像"
            }), 400
        
        # 进行YOLO检测
        analysis_result = yolo_detector.detect_stool_features(image)
        
        return jsonify({
            "success": True,
            **analysis_result,
            "environment": "render" if is_render else "local"
        })
        
    except Exception as e:
        print(f" 分析失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """测试端点"""
    return jsonify({
        "message": "YOLOv8 API 工作正常",
        "model_loaded": yolo_detector is not None and yolo_detector.model is not None,
        "environment": "render" if is_render else "local"
    })

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 10000))
    print(f" YOLOv8服务启动在端口 {port}")
    print(f" 工作目录: {current_dir}")
    print(f" 模型状态: {'已加载' if yolo_detector and yolo_detector.model else '未加载'}")
    print(f" 环境: {'Render' if is_render else '本地'}")
    
    app.run(host='0.0.0.0', port=port, debug=not is_render)
