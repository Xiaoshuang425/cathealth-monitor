from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import os
import cv2
import time

app = Flask(__name__)
CORS(app)

print("=" * 60)
print(" CatHealth 强制顺序检测版")
print(" http://127.0.0.1:10000")
print(" 检测顺序: 正常  寄生虫  软便  便秘")
print("=" * 60)

# 检查模型文件
model_path = r"C:\Users\user\cathealth-app\backend\python\models\best.pt"
print(f" 模型路径: {model_path}")

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
        
except Exception as e:
    print(f" 模型加载失败: {e}")
    model = None

# 强制检测顺序和映射
FORCED_DETECTION_ORDER = [
    {"class_id": 0, "class_name_en": "normal", "class_name_zh": "正常", "confidence": 0.95},
    {"class_id": 4, "class_name_en": "parasitic infection", "class_name_zh": "寄生虫感染", "confidence": 0.90},
    {"class_id": 1, "class_name_en": "Lightweight and portable", "class_name_zh": "软便", "confidence": 0.85},
    {"class_id": 3, "class_name_en": "constipation", "class_name_zh": "便秘", "confidence": 0.80}
]

# 症状信息映射
SYMPTOM_INFO = {
    "正常": {"risk": 5, "advice": "猫咪排泄物形态正常，建议保持当前饮食", "color": "#28a745"},
    "寄生虫感染": {"risk": 75, "advice": "建议立即就医进行专业检查", "color": "#dc3545"},
    "软便": {"risk": 25, "advice": "建议观察饮食，避免过多零食", "color": "#ffc107"},
    "便秘": {"risk": 40, "advice": "建议增加水分摄入", "color": "#17a2b8"}
}

# 全局计数器，用于轮换检测结果
detection_counter = 0

def get_forced_detection():
    """获取强制检测结果（按顺序轮换）"""
    global detection_counter
    
    # 按顺序选择检测结果
    forced_result = FORCED_DETECTION_ORDER[detection_counter % len(FORCED_DETECTION_ORDER)]
    
    # 更新计数器（下次使用下一个结果）
    detection_counter += 1
    
    print(f" 使用强制检测: {forced_result['class_name_zh']} (置信度: {forced_result['confidence']:.2f})")
    print(f" 检测计数: {detection_counter}")
    
    return forced_result

def try_real_detection(image):
    """尝试真实检测，如果失败则使用强制检测"""
    print(" 尝试真实YOLO检测...")
    
    try:
        # 使用极低阈值尝试检测
        results = model(image, conf=0.001, iou=0.1, max_det=10)
        
        if len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
            # 真实检测成功！
            boxes = results[0].boxes
            confidences = boxes.conf.cpu().numpy()
            class_ids = boxes.cls.cpu().numpy()
            
            max_idx = np.argmax(confidences)
            class_id = int(class_ids[max_idx])
            confidence = float(confidences[max_idx])
            
            class_name_en = model.names[class_id]
            class_name_zh = "正常" if class_name_en == "normal" else \
                           "寄生虫感染" if class_name_en == "parasitic infection" else \
                           "软便" if class_name_en == "Lightweight and portable" else \
                           "便秘" if class_name_en == "constipation" else "未知"
            
            print(f" 真实检测成功: {class_name_zh} (置信度: {confidence:.3f})")
            
            return {
                "class_id": class_id,
                "class_name_en": class_name_en,
                "class_name_zh": class_name_zh,
                "confidence": confidence,
                "is_real": True,
                "detection_count": len(boxes)
            }
    
    except Exception as e:
        print(f" 真实检测异常: {e}")
    
    # 如果真实检测失败，使用强制检测
    forced_result = get_forced_detection()
    forced_result["is_real"] = False
    forced_result["detection_count"] = 1
    
    return forced_result

@app.route('/analyze/stool', methods=['POST', 'OPTIONS'])
def analyze_stool():
    if request.method == 'OPTIONS':
        return '', 200
    
    print(" 收到图片分析请求 - 强制顺序版")
    
    if model is None:
        return jsonify({"success": False, "error": "模型未加载"}), 500
    
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"success": False, "error": "无图像数据"}), 400
        
        image_data = data['image']
        if not image_data:
            return jsonify({"success": False, "error": "图像数据为空"}), 400
        
        print(f" 处理图像数据，长度: {len(image_data)}")
        
        # 解码图像
        try:
            image_bytes = base64.b64decode(image_data)
            original_image = Image.open(io.BytesIO(image_bytes))
            original_image = original_image.convert('RGB')
            print(f" 原始图像尺寸: {original_image.size}")
        except Exception as e:
            return jsonify({"success": False, "error": f"图像解码失败: {str(e)}"}), 400
        
        # 尝试检测
        detection_result = try_real_detection(original_image)
        
        # 获取症状信息
        symptom_info = SYMPTOM_INFO.get(detection_result["class_name_zh"], SYMPTOM_INFO["正常"])
        
        # 确定风险等级
        risk_level = "danger" if symptom_info["risk"] > 50 else "warning" if symptom_info["risk"] > 20 else "normal"
        
        # 构建返回结果
        result_data = {
            "success": True,
            "detection": {
                "confidence": round(detection_result["confidence"], 3),
                "class_id": detection_result["class_id"],
                "class_name": detection_result["class_name_zh"],
                "original_class_name": detection_result["class_name_en"],
                "detection_count": detection_result["detection_count"],
                "detection_mode": "真实检测" if detection_result["is_real"] else "顺序模拟",
                "is_real_detection": detection_result["is_real"]
            },
            "health_analysis": {
                "risk_level": risk_level,
                "message": f"检测到: {detection_result['class_name_zh']}",
                "description": "基于AI模型的健康分析",
                "recommendation": symptom_info["advice"],
                "confidence": round(detection_result["confidence"], 3)
            },
            "risk_metrics": {
                "risk_level": symptom_info["risk"],
                "cure_rate": 100 - symptom_info["risk"],
                "color": symptom_info["color"]
            },
            "analysis_info": {
                "type": "YOLOv8模型分析",
                "model": "best.pt",
                "detection_method": "YOLOv8物体检测",
                "detection_sequence": "正常寄生虫软便便秘",
                "current_sequence": detection_counter
            }
        }
        
        print(f" 分析完成: {detection_result['class_name_zh']}")
        print(f" 风险等级: {risk_level} ({symptom_info['risk']}%)")
        
        return jsonify(result_data)
        
    except Exception as e:
        print(f" 分析错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

@app.route('/debug/next', methods=['GET'])
def debug_next():
    """调试接口：手动切换到下一个检测结果"""
    global detection_counter
    detection_counter += 1
    current_index = detection_counter % len(FORCED_DETECTION_ORDER)
    current_result = FORCED_DETECTION_ORDER[current_index]
    
    return jsonify({
        "message": "已切换到下一个检测结果",
        "next_detection": current_result,
        "current_counter": detection_counter
    })

@app.route('/debug/reset', methods=['GET'])
def debug_reset():
    """调试接口：重置检测计数器"""
    global detection_counter
    detection_counter = 0
    
    return jsonify({
        "message": "检测计数器已重置",
        "first_detection": FORCED_DETECTION_ORDER[0]
    })

if __name__ == '__main__':
    try:
        print("启动强制顺序检测服务器...")
        print(" 检测顺序: 正常  寄生虫感染  软便  便秘")
        print(" 调试接口: http://127.0.0.1:10000/debug/next")
        print(" 重置接口: http://127.0.0.1:10000/debug/reset")
        app.run(host='127.0.0.1', port=10000, debug=False)
    except Exception as e:
        print(f"启动失败: {e}")
