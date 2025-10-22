from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import os

app = Flask(__name__)
CORS(app)

print("=" * 60)
print(" CatHealth 真实YOLOv8模型分析后端")
print(" http://127.0.0.1:10000")
print(" 使用训练好的best.pt模型")
print("=" * 60)

# 检查模型文件
model_path = r"C:\Users\user\cathealth-app\backend\python\models\best.pt"
print(f"📁 模型路径: {model_path}")
print(f"🔍 模型文件存在: {os.path.exists(model_path)}")

# 尝试导入YOLO
try:
    from ultralytics import YOLO
    print(" 成功导入YOLO")
    
    if os.path.exists(model_path):
        print(" 加载YOLO模型...")
        model = YOLO(model_path)
        print(" YOLO模型加载成功")
        print(f" 模型类别: {model.names}")
    else:
        print(" 模型文件不存在")
        model = None
        
except ImportError as e:
    print(f" 无法导入ultralytics: {e}")
    print(" 请安装: pip install ultralytics")
    model = None
except Exception as e:
    print(f" 模型加载失败: {e}")
    model = None

# 症状类别映射（根据你的YOLO模型类别）
# 这里需要根据你的模型实际类别来调整
SYMPTOM_CLASSES = {
    0: {"name": "正常", "risk": 5, "color": "#28a745", "advice": "猫咪排泄物形态正常，建议保持当前饮食"},
    1: {"name": "软便", "risk": 25, "color": "#ffc107", "advice": "建议观察饮食，避免过多零食"},
    2: {"name": "拉稀", "risk": 65, "color": "#fd7e14", "advice": "建议及时就医检查"},
    3: {"name": "便秘", "risk": 40, "color": "#17a2b8", "advice": "建议增加水分摄入"},
    4: {"name": "寄生虫感染", "risk": 75, "color": "#dc3545", "advice": "建议立即就医进行专业检查"}
}

def get_risk_level(risk):
    """根据风险等级返回级别"""
    if risk <= 30:
        return "normal"
    elif risk <= 50:
        return "warning"
    else:
        return "danger"

@app.route('/')
def home():
    model_info = {}
    if model is not None:
        model_info = {
            "model_loaded": True,
            "classes_count": len(model.names) if hasattr(model, 'names') else len(SYMPTOM_CLASSES),
            "class_names": model.names if hasattr(model, 'names') else list(SYMPTOM_CLASSES.values())[0]["name"]
        }
    else:
        model_info = {"model_loaded": False}
    
    return jsonify({
        "service": "CatHealth YOLOv8 API", 
        "status": "running",
        "model_path": model_path,
        **model_info
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CatHealth YOLO Service", 
        "model_loaded": model is not None,
        "analysis_mode": "真实YOLO模型分析",
        "model_path": model_path,
        "file_exists": os.path.exists(model_path)
    })

@app.route('/analyze/stool', methods=['POST', 'OPTIONS'])
def analyze_stool():
    if request.method == 'OPTIONS':
        return '', 200
    
    print(" 收到图片分析请求 - 使用YOLO模型")
    
    # 检查模型是否加载
    if model is None:
        return jsonify({
            "success": False,
            "error": "YOLO模型未加载",
            "model_path": model_path,
            "file_exists": os.path.exists(model_path)
        }), 500
    
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False, 
                "error": "请提供有效的图像数据"
            }), 400
        
        image_data = data['image']
        
        if not image_data:
            return jsonify({
                "success": False,
                "error": "图像数据为空"
            }), 400
        
        print(f" 处理图像数据，长度: {len(image_data)}")
        
        # 解码base64图像
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert('RGB')
            print(f" 图像解码成功，尺寸: {image.size}")
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"图像解码失败: {str(e)}"
            }), 400
        
        # 使用YOLO模型进行检测
        print(" 使用YOLO模型进行分析...")
        results = model(image)
        
        # 处理检测结果
        detection_info = {
            "detected": False,
            "class_id": 0,
            "confidence": 0.7,
            "detection_count": 0
        }
        
        if len(results) > 0:
            result = results[0]
            boxes = result.boxes
            
            if boxes is not None and len(boxes) > 0:
                # 获取置信度最高的检测结果
                confidences = boxes.conf.cpu().numpy()
                class_ids = boxes.cls.cpu().numpy()
                
                max_confidence_idx = np.argmax(confidences)
                detected_class = int(class_ids[max_confidence_idx])
                confidence = float(confidences[max_confidence_idx])
                
                detection_info = {
                    "detected": True,
                    "class_id": detected_class,
                    "confidence": confidence,
                    "detection_count": len(boxes)
                }
                
                print(f" YOLO检测结果: 类别 {detected_class}, 置信度 {confidence:.3f}")
                
            else:
                print(" 未检测到特定目标")
        else:
            print(" 无检测结果")
        
        # 获取症状信息
        symptom_info = SYMPTOM_CLASSES.get(detection_info["class_id"], SYMPTOM_CLASSES[0])
        
        # 构建分析结果
        result_data = {
            "success": True,
            "detection": {
                "confidence": round(detection_info["confidence"], 3),
                "class_id": detection_info["class_id"],
                "class_name": symptom_info["name"],
                "features": f"YOLOv8模型检测 - 类别 {detection_info['class_id']}",
                "detection_count": detection_info["detection_count"],
                "detected": detection_info["detected"]
            },
            "health_analysis": {
                "risk_level": get_risk_level(symptom_info["risk"]),
                "message": symptom_info["name"] + "症状",
                "description": "基于YOLOv8模型的AI分析完成",
                "confidence": round(detection_info["confidence"], 3),
                "recommendation": symptom_info["advice"],
                "detected_class": detection_info["class_id"]
            },
            "risk_metrics": {
                "risk_level": symptom_info["risk"],
                "cure_rate": 100 - symptom_info["risk"],
                "color": symptom_info["color"]
            },
            "analysis_info": {
                "type": "真实YOLO模型分析",
                "model": "best.pt",
                "image_size": f"{image.size[0]}x{image.size[1]}",
                "detection_method": "YOLOv8物体检测",
                "model_loaded": True
            }
        }
        
        print(f" YOLO分析完成: {symptom_info['name']} (置信度: {detection_info['confidence']:.3f})")
        return jsonify(result_data)
        
    except Exception as e:
        print(f" YOLO分析错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"YOLO分析失败: {str(e)}",
            "model_path": model_path
        }), 500

if __name__ == '__main__':
    try:
        print("启动YOLO模型分析服务器...")
        app.run(
            host='127.0.0.1',
            port=10000,
            debug=False
        )
    except Exception as e:
        print(f"启动失败: {e}")
