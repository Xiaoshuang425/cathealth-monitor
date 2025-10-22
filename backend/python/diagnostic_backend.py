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
print("🚀 CatHealth YOLO诊断版")
print("📍 http://127.0.0.1:10000")
print(" 诊断检测问题")
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
        print(f" 模型信息: 类别数={len(model.names)}")
    else:
        print(" 模型文件不存在")
        model = None
        
except ImportError as e:
    print(f" 无法导入ultralytics: {e}")
    model = None
except Exception as e:
    print(f" 模型加载失败: {e}")
    model = None

# 类别映射
CLASS_MAPPING = {
    "normal": "正常",
    "Lightweight and portable": "软便", 
    "watery diarrhoea": "拉稀",
    "constipation": "便秘",
    "parasitic infection": "寄生虫感染"
}

def improve_detection(image):
    """图像预处理提高检测率"""
    # 转换为numpy数组
    img_np = np.array(image)
    
    # 调整图像尺寸到模型训练尺寸
    target_size = (640, 640)  # YOLO常用尺寸
    img_resized = cv2.resize(img_np, target_size)
    
    # 可选：图像增强
    # 对比度增强
    lab = cv2.cvtColor(img_resized, cv2.COLOR_RGB2LAB)
    lab[:,:,0] = cv2.createCLAHE(clipLimit=2.0).apply(lab[:,:,0])
    img_enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    
    return Image.fromarray(img_enhanced)

@app.route('/analyze/stool', methods=['POST', 'OPTIONS'])
def analyze_stool():
    if request.method == 'OPTIONS':
        return '', 200
    
    print(" 收到图片分析请求 - 诊断模式")
    
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
        
        # 方法1: 直接使用原始图像
        print(" 方法1: 使用原始图像检测...")
        results1 = model(original_image, conf=0.25)  # 降低置信度阈值
        
        # 方法2: 使用预处理后的图像
        print(" 方法2: 使用预处理图像检测...")
        enhanced_image = improve_detection(original_image)
        results2 = model(enhanced_image, conf=0.25)
        
        # 方法3: 使用更低的置信度阈值
        print(" 方法3: 低置信度阈值检测...")
        results3 = model(original_image, conf=0.15)
        
        # 分析所有结果
        all_detections = []
        
        for i, (results, method) in enumerate([
            (results1, "原始图像"),
            (results2, "预处理图像"), 
            (results3, "低阈值")
        ]):
            if len(results) > 0:
                result = results[0]
                boxes = result.boxes
                
                if boxes is not None and len(boxes) > 0:
                    confidences = boxes.conf.cpu().numpy()
                    class_ids = boxes.cls.cpu().numpy()
                    
                    for j, (class_id, confidence) in enumerate(zip(class_ids, confidences)):
                        class_id_int = int(class_id)
                        class_name_en = model.names[class_id_int]
                        class_name_zh = CLASS_MAPPING.get(class_name_en, class_name_en)
                        
                        detection = {
                            "method": method,
                            "class_id": class_id_int,
                            "class_name_en": class_name_en,
                            "class_name_zh": class_name_zh,
                            "confidence": float(confidence),
                            "box_count": len(boxes)
                        }
                        all_detections.append(detection)
                        
                        print(f" {method} 检测到: {class_name_zh}({class_name_en}), 置信度: {confidence:.3f}")
        
        # 如果没有检测到任何目标，尝试其他方法
        if not all_detections:
            print(" 所有方法都未检测到目标，尝试备用方案...")
            
            # 方法4: 使用不同的推理尺寸
            print(" 方法4: 调整推理尺寸...")
            results4 = model(original_image, imgsz=640, conf=0.1)
            
            if len(results4) > 0:
                result = results4[0]
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    confidences = boxes.conf.cpu().numpy()
                    class_ids = boxes.cls.cpu().numpy()
                    
                    for j, (class_id, confidence) in enumerate(zip(class_ids, confidences)):
                        class_id_int = int(class_id)
                        class_name_en = model.names[class_id_int]
                        class_name_zh = CLASS_MAPPING.get(class_name_en, class_name_en)
                        
                        detection = {
                            "method": "调整尺寸",
                            "class_id": class_id_int,
                            "class_name_en": class_name_en,
                            "class_name_zh": class_name_zh,
                            "confidence": float(confidence),
                            "box_count": len(boxes)
                        }
                        all_detections.append(detection)
                        print(f" 调整尺寸检测到: {class_name_zh}, 置信度: {confidence:.3f}")
        
        # 选择最佳检测结果
        if all_detections:
            # 按置信度排序
            all_detections.sort(key=lambda x: x['confidence'], reverse=True)
            best_detection = all_detections[0]
            
            # 映射到症状
            symptom_mapping = {
                "正常": {"risk": 5, "advice": "猫咪排泄物形态正常"},
                "软便": {"risk": 25, "advice": "建议观察饮食"},
                "拉稀": {"risk": 65, "advice": "建议及时就医"},
                "便秘": {"risk": 40, "advice": "建议增加水分"},
                "寄生虫感染": {"risk": 75, "advice": "建议立即就医"}
            }
            
            symptom_info = symptom_mapping.get(best_detection['class_name_zh'], 
                                             symptom_mapping["正常"])
            
            result_data = {
                "success": True,
                "detection": {
                    "confidence": round(best_detection['confidence'], 3),
                    "class_id": best_detection['class_id'],
                    "class_name": best_detection['class_name_zh'],
                    "original_class_name": best_detection['class_name_en'],
                    "detection_method": best_detection['method'],
                    "detection_count": len(all_detections)
                },
                "health_analysis": {
                    "risk_level": "danger" if symptom_info["risk"] > 50 else "warning",
                    "message": f"检测到: {best_detection['class_name_zh']}",
                    "recommendation": symptom_info["advice"],
                },
                "debug_info": {
                    "all_detections": all_detections,
                    "methods_tried": ["原始图像", "预处理", "低阈值", "调整尺寸"],
                    "detection_success": True
                }
            }
            
            print(f" 最终结果: {best_detection['class_name_zh']} (置信度: {best_detection['confidence']:.3f})")
            
        else:
            # 完全没有检测到任何目标
            print(" 所有检测方法都失败了")
            result_data = {
                "success": False,
                "error": "无法检测到目标，请尝试：1.更清晰的图片 2.调整拍摄角度 3.确保图片包含排泄物",
                "debug_info": {
                    "all_detections": [],
                    "methods_tried": ["原始图像", "预处理", "低阈值", "调整尺寸"],
                    "detection_success": False,
                    "advice": "模型未检测到任何目标，可能是图片质量或模型训练数据问题"
                }
            }
        
        return jsonify(result_data)
        
    except Exception as e:
        print(f" 分析错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

if __name__ == '__main__':
    try:
        print("启动YOLO诊断服务器...")
        app.run(host='127.0.0.1', port=10000, debug=False)
    except Exception as e:
        print(f"启动失败: {e}")
