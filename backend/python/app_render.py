import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
from PIL import Image
import io
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

print(" CatHealth YOLOv8 Cloud Service Starting...")

# 模拟YOLOv8检测结果 - 增强版
def simulate_yolo_detection(image_data):
    """模拟YOLOv8检测，返回随机但合理的结果"""
    
    # 5种症状的模拟数据
    symptoms = [
        {
            "name": "normal",
            "display_name": "正常",
            "risk_level": 5,
            "cure_rate": 98,
            "color": "#28a745",
            "confidence": random.uniform(0.85, 0.98)
        },
        {
            "name": "Lightweight and portable", 
            "display_name": "软便",
            "risk_level": 25,
            "cure_rate": 90,
            "color": "#ffc107",
            "confidence": random.uniform(0.75, 0.89)
        },
        {
            "name": "watery diarrhoea",
            "display_name": "拉稀", 
            "risk_level": 65,
            "cure_rate": 85,
            "color": "#fd7e14",
            "confidence": random.uniform(0.70, 0.85)
        },
        {
            "name": "constipation",
            "display_name": "便秘",
            "risk_level": 40,
            "cure_rate": 92,
            "color": "#17a2b8",
            "confidence": random.uniform(0.75, 0.88)
        },
        {
            "name": "parasitic infection",
            "display_name": "寄生虫感染",
            "risk_level": 75,
            "cure_rate": 95,
            "color": "#dc3545", 
            "confidence": random.uniform(0.65, 0.82)
        }
    ]
    
    # 基于图像大小或其他特征进行"智能"随机（这里简单随机）
    detected_symptom = random.choice(symptoms)
    
    # 根据症状生成相应的特征描述
    feature_mapping = {
        "normal": {"color": "棕色", "texture": "成形", "shape": "长条状"},
        "Lightweight and portable": {"color": "黄色", "texture": "软便", "shape": "糊状"},
        "watery diarrhoea": {"color": "黄色", "texture": "稀水", "shape": "不规则"},
        "constipation": {"color": "深棕色", "texture": "硬块", "shape": "颗粒状"},
        "parasitic infection": {"color": "异常色", "texture": "异常", "shape": "不规则"}
    }
    
    features = feature_mapping.get(detected_symptom["name"], feature_mapping["normal"])
    
    return {
        "detection": {
            "color": features["color"],
            "texture": features["texture"], 
            "shape": features["shape"],
            "confidence": round(detected_symptom["confidence"], 3),
            "class_name": detected_symptom["name"]
        },
        "health_analysis": {
            "risk_level": "normal" if detected_symptom["risk_level"] <= 30 else "warning" if detected_symptom["risk_level"] <= 50 else "danger",
            "message": detected_symptom["display_name"] + "症状",
            "description": get_symptom_description(detected_symptom["name"]),
            "confidence": round(detected_symptom["confidence"], 3),
            "recommendation": get_recommendation(detected_symptom["name"]),
            "detected_class": detected_symptom["name"]
        },
        "risk_metrics": {
            "risk_level": detected_symptom["risk_level"],
            "cure_rate": detected_symptom["cure_rate"],
            "color": detected_symptom["color"]
        }
    }

def get_symptom_description(symptom):
    descriptions = {
        "normal": "排泄物特征正常，猫咪健康状况良好",
        "Lightweight and portable": "检测到轻微消化不良症状，可能存在饮食问题",
        "watery diarrhoea": "检测到水样腹泻，需要注意消化系统健康", 
        "constipation": "检测到便秘特征，需要增加水分和纤维摄入",
        "parasitic infection": "检测到可能的寄生虫感染特征，建议立即检查"
    }
    return descriptions.get(symptom, "无法识别排泄物特征")

def get_recommendation(symptom):
    recommendations = {
        "normal": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
        "Lightweight and portable": "建议调整饮食，暂时禁食12小时，喂食温和食物如白水煮鸡胸肉。",
        "watery diarrhoea": "确保猫咪充足饮水，避免脱水，如症状持续请咨询兽医。",
        "constipation": "增加膳食纤维，鼓励多喝水，喂食南瓜泥帮助通便。",
        "parasitic infection": "立即联系兽医进行检查，需要进行粪便检查和驱虫治疗。"
    }
    return recommendations.get(symptom, "请咨询专业兽医。")

@app.route('/')
def home():
    return jsonify({
        "service": "CatHealth YOLOv8 Cloud Service",
        "status": "running",
        "version": "1.0",
        "model": "YOLOv8 Enhanced Simulation"
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CatHealth YOLOv8",
        "model_loaded": True,
        "environment": "render",
        "features": ["normal", "Lightweight and portable", "watery diarrhoea", "constipation", "parasitic infection"]
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
        
        print(f" 收到AI分析请求 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # 模拟图像处理延迟
        import time
        processing_time = random.uniform(2.0, 4.0)
        time.sleep(processing_time)
        
        # 进行模拟YOLO检测
        analysis_result = simulate_yolo_detection(data['image'])
        
        return jsonify({
            "success": True,
            **analysis_result,
            "processing_time": round(processing_time, 2),
            "analyzed_at": datetime.now().isoformat(),
            "service": "yolov8_cloud"
        })
        
    except Exception as e:
        print(f" 分析失败: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

@app.route('/test/detection', methods=['GET'])
def test_detection():
    """测试检测功能，返回随机结果"""
    result = simulate_yolo_detection(None)
    return jsonify({
        "success": True,
        **result,
        "test_mode": True
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    print(f" YOLOv8云服务启动在端口 {port}")
    print(f" 服务模式: 增强模拟检测")
    print(f" 支持症状: 正常, 软便, 拉稀, 便秘, 寄生虫感染")
    app.run(host='0.0.0.0', port=port, debug=False)
