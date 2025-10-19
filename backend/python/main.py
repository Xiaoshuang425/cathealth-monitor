import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

from yolo.detector import YOLODetector

app = Flask(__name__)
CORS(app)

# 初始化YOLO检测器
yolo_detector = YOLODetector()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "CatHealth YOLO Service",
        "model_loaded": yolo_detector.model is not None
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
            **analysis_result,
            "analyzed_at": "2024-01-01T00:00:00Z"  # 实际应该用当前时间
        })
        
    except Exception as e:
        print(f"分析失败: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 3001))
    print(f" YOLO分析服务启动在端口 {port}")
    print(f" 模型路径: {yolo_detector.model_path}")
    print(f" 模型加载状态: {yolo_detector.model is not None}")
    app.run(host='0.0.0.0', port=port, debug=True)