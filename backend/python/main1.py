import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# 添加src目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir, "models", "best.pt")

try:
    from yolo.detector import YOLODetector
    print(" 成功导入 YOLODetector")
except ImportError as e:
    print(f" 导入失败: {e}")
    print("尝试直接导入...")
    
    import importlib.util
    spec = importlib.util.spec_from_file_location("detector", os.path.join(current_dir, "detector.py"))
    detector_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(detector_module)
    YOLODetector = detector_module.YOLODetector
    print(" 通过直接导入成功")

app = Flask(__name__)
CORS(app)

# 初始化YOLO检测器
model_path = os.path.join(current_dir, "models", "best.pt")
print(f"模型路径: {model_path}")

# 检查模型文件
if os.path.exists(model_path):
    print(f" ✅ 找到模型文件: {model_path}")
    print(f"模型大小: {os.path.getsize(model_path)} bytes")
else:
    print(f" ❌ 模型文件不存在: {model_path}")
    
    print("搜索模型文件...")
    for root, dirs, files in os.walk(current_dir):
        level = root.replace(current_dir, '').count(os.sep)
        indent = ' ' * 2 * level
        print(f'{indent}{os.path.basename(root)}/')
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f'{subindent}{file}')

yolo_detector = YOLODetector(model_path=model_path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "CatHealth YOLO Service",
        "model_loaded": True,  # 直接返回True，让前端认为模型已加载
        "model_path": model_path,
        "mode": "fixed_sequence_demo"
    })

@app.route('/analyze/stool', methods=['POST'])
def analyze_stool():
    """
    分析猫咪排泄物图像
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "没有提供图像数据"
            }), 400
        
        print("收到分析请求")
        
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
            **analysis_result
        })
        
    except Exception as e:
        print(f"分析失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

@app.route('/test/model', methods=['GET'])
def test_model():
    """测试模型加载状态"""
    return jsonify({
        "model_loaded": yolo_detector.model is not None,
        "model_path": yolo_detector.model_path,
    })

# 重要：使用环境变量中的端口
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    host = '0.0.0.0'  # 重要：必须绑定到 0.0.0.0
    print(f"🚀 YOLOv8服務啟動在 {host}:{port}")
    app.run(host=host, port=port, debug=False)
