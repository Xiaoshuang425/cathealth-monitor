from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import os
import cv2

app = Flask(__name__)
CORS(app)

print("=" * 60)
print("🚀 CatHealth 修复版YOLOv8模型分析后端")
print(" http://127.0.0.1:10000")
print(" 使用训练好的best.pt模型")
print("=" * 60)

# 检查模型文件
model_path = r"C:\Users\user\cathealth-app\backend\python\models\best.pt"
print(f" 模型路径: {model_path}")
print(f"� 模型文件存在: {os.path.exists(model_path)}")

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

# 根据你的模型输出修正类别映射
SYMPTOM_CLASSES = {
    0: {"name": "正常", "risk": 5, "color": "#28a745", "advice": "猫咪排泄物形态正常，建议保持当前饮食"},
    1: {"name": "软便", "risk": 25, "color": "#ffc107", "advice": "建议观察饮食，避免过多零食"},
    2: {"name": "拉稀", "risk": 65, "color": "#fd7e14", "advice": "建议及时就医检查"},
    3: {"name": "便秘", "risk": 40, "color": "#17a2b8", "advice": "建议增加水分摄入"},
    4: {"name": "寄生虫感染", "risk": 75, "color": "#dc3545", "advice": "建议立即就医进行专业检查"}
}

# 模型实际输出类别映射（根据你的模型输出）
MODEL_CLASS_NAMES = {
    0: "normal",
    1: "Lightweight and portable", 
    2: "watery diarrhoea",
    3: "constipation", 
    4: "parasitic infection"
}

print(" 模型类别映射:")
for class_id, class_name in MODEL_CLASS_NAMES.items():
    print(f"   类别 {class_id}: {class_name}")

def get_risk_level(risk):
    """根据风险等级返回级别"""
    if risk <= 30:
        return "normal"
    elif risk <= 50:
        return "warning"
    else:
        return "danger"

def map_model_class_to_symptom(model_class_id, model_class_name):
    """将模型输出的类别映射到症状类别"""
    print(f" 映射模型类别: {model_class_id} -> {model_class_name}")
    
    # 根据模型输出的英文名称映射到中文症状
    mapping_rules = {
        "normal": 0,  # 正常
        "Lightweight and portable": 1,  # 软便
        "watery diarrhoea": 2,  # 拉稀
        "constipation": 3,  # 便秘
        "parasitic infection": 4  # 寄生虫感染
    }
    
    # 优先使用类别名称映射
    if model_class_name in mapping_rules:
        mapped_id = mapping_rules[model_class_name]
        print(f" 通过名称映射: {model_class_name} -> 症状{mapped_id}")
        return mapped_id
    
    # 备用：直接使用模型类别ID（如果训练时ID对应）
    if model_class_id in SYMPTOM_CLASSES:
        print(f" 直接使用模型ID: {model_class_id}")
        return model_class_id
    
    # 默认返回正常
    print(f" 无法映射，使用默认类别0")
    return 0

@app.route('/')
def home():
    model_info = {}
    if model is not None:
        model_info = {
            "model_loaded": True,
            "classes_count": len(model.names) if hasattr(model, 'names') else len(SYMPTOM_CLASSES),
            "class_names": model.names if hasattr(model, 'names') else "未知",
            "model_class_mapping": MODEL_CLASS_NAMES
        }
    else:
        model_info = {"model_loaded": False}
    
    return jsonify({
        "service": "CatHealth YOLOv8 API - 修复版", 
        "status": "running",
        "model_path": model_path,
        **model_info
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CatHealth YOLO Service - 修复版", 
        "model_loaded": model is not None,
        "analysis_mode": "修复版YOLO模型分析",
        "model_path": model_path,
        "file_exists": os.path.exists(model_path),
        "class_mapping": MODEL_CLASS_NAMES
    })

@app.route('/analyze/stool', methods=['POST', 'OPTIONS'])
def analyze_stool():
    if request.method == 'OPTIONS':
        return '', 200
    
    print(" 收到图片分析请求 - 修复版映射")
    
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
            print(f" 图像解码成功: {image.size}")
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"图像解码失败: {str(e)}"
            }), 400
        
        # 使用YOLO模型进行检测
        print(" 使用YOLO模型进行分析...")
        results = model(image)
        
        # 调试信息
        print(f" 模型输出调试信息:")
        print(f"   结果数量: {len(results)}")
        
        detection_info = {
            "detected": False,
            "class_id": 0,
            "class_name": "normal",
            "confidence": 0.5,
            "detection_count": 0,
            "all_detections": []
        }
        
        if len(results) > 0:
            result = results[0]
            boxes = result.boxes
            
            print(f"   检测框数量: {len(boxes) if boxes is not None else 0}")
            print(f"   模型原始类别:")
            for i, name in MODEL_CLASS_NAMES.items():
                print(f"     {i}: {name}")
            
            if boxes is not None and len(boxes) > 0:
                # 获取所有检测结果
                confidences = boxes.conf.cpu().numpy()
                class_ids = boxes.cls.cpu().numpy()
                
                # 记录所有检测
                for i, (class_id, confidence) in enumerate(zip(class_ids, confidences)):
                    class_id_int = int(class_id)
                    class_name = MODEL_CLASS_NAMES.get(class_id_int, f"未知{class_id_int}")
                    detection_info["all_detections"].append({
                        "class_id": class_id_int,
                        "class_name": class_name,
                        "confidence": float(confidence)
                    })
                    print(f"   检测{i}: 类别{class_id_int}({class_name}), 置信度{confidence:.3f}")
                
                # 获取置信度最高的检测结果
                max_confidence_idx = np.argmax(confidences)
                detected_class_id = int(class_ids[max_confidence_idx])
                detected_class_name = MODEL_CLASS_NAMES.get(detected_class_id, "未知")
                confidence = float(confidences[max_confidence_idx])
                
                # 映射到症状类别
                symptom_class_id = map_model_class_to_symptom(detected_class_id, detected_class_name)
                
                detection_info = {
                    "detected": True,
                    "class_id": symptom_class_id,
                    "class_name": detected_class_name,
                    "confidence": confidence,
                    "detection_count": len(boxes),
                    "all_detections": detection_info["all_detections"],
                    "original_class_id": detected_class_id
                }
                
                print(f" 最高置信度检测: 原始类别{detected_class_id}({detected_class_name}) -> 症状类别{symptom_class_id}")
                
            else:
                print(" 未检测到特定目标，使用默认类别")
        else:
            print(" 无检测结果，使用默认类别")
        
        # 获取症状信息
        symptom_info = SYMPTOM_CLASSES.get(detection_info["class_id"], SYMPTOM_CLASSES[0])
        
        # 构建分析结果
        result_data = {
            "success": True,
            "detection": {
                "confidence": round(detection_info["confidence"], 3),
                "class_id": detection_info["class_id"],
                "class_name": symptom_info["name"],
                "original_class_id": detection_info.get("original_class_id", detection_info["class_id"]),
                "original_class_name": detection_info["class_name"],
                "features": f"YOLOv8模型检测 - {detection_info['class_name']}",
                "detection_count": detection_info["detection_count"],
                "detected": detection_info["detected"],
                "all_detections": detection_info["all_detections"]
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
                "type": "修复版YOLO模型分析",
                "model": "best.pt",
                "image_size": f"{image.size[0]}x{image.size[1]}",
                "detection_method": "YOLOv8物体检测",
                "model_loaded": True,
                "class_mapping_used": True
            }
        }
        
        print(f" 分析完成: {symptom_info['name']} (置信度: {detection_info['confidence']:.3f})")
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
        print("启动修复版YOLO模型分析服务器...")
        app.run(
            host='127.0.0.1',
            port=10000,
            debug=False
        )
    except Exception as e:
        print(f"启动失败: {e}")
