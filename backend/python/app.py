import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

print("🚀 CatHealth Monitor Cloud Service Starting...")

# 症状数据库
SYMPTOM_DATABASE = {
    "normal": {
        "name": "正常",
        "risk_level": 5,
        "cure_rate": 98,
        "color": "#28a745",
        "description": "排泄物特征正常，猫咪健康状况良好",
        "recommendation": "请保持当前的喂养习惯，继续观察猫咪的健康状况。"
    },
    "Lightweight and portable": {
        "name": "软便", 
        "risk_level": 25,
        "cure_rate": 90,
        "color": "#ffc107",
        "description": "检测到轻微消化不良症状，可能存在饮食问题",
        "recommendation": "建议调整饮食，暂时禁食12小时，喂食温和食物如白水煮鸡胸肉。"
    },
    "watery diarrhoea": {
        "name": "拉稀",
        "risk_level": 65, 
        "cure_rate": 85,
        "color": "#fd7e14",
        "description": "检测到水样腹泻，需要注意消化系统健康",
        "recommendation": "确保猫咪充足饮水，避免脱水，如症状持续请咨询兽医。"
    },
    "constipation": {
        "name": "便秘",
        "risk_level": 40,
        "cure_rate": 92,
        "color": "#17a2b8",
        "description": "检测到便秘特征，需要增加水分和纤维摄入",
        "recommendation": "增加膳食纤维，鼓励多喝水，喂食南瓜泥帮助通便。"
    },
    "parasitic infection": {
        "name": "寄生虫感染",
        "risk_level": 75,
        "cure_rate": 95, 
        "color": "#dc3545",
        "description": "检测到可能的寄生虫感染特征，建议立即检查",
        "recommendation": "立即联系兽医进行检查，需要进行粪便检查和驱虫治疗。"
    }
}

@app.route('/')
def home():
    return jsonify({
        "service": "CatHealth Monitor Cloud API",
        "status": "running", 
        "version": "2.0",
        "ai_service": "YOLOv8 Enhanced Simulation",
        "endpoints": ["/health", "/analyze/stool", "/test"]
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "CatHealth AI Service",
        "model_loaded": True,
        "symptoms_supported": list(SYMPTOM_DATABASE.keys()),
        "environment": "render-cloud"
    })

@app.route('/analyze/stool', methods=['POST'])
def analyze_stool():
    """AI排泄物分析端点"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "没有提供图像数据"
            }), 400
        
        print(f" AI分析请求 - {datetime.now().strftime('%H:%M:%S')}")
        
        # 模拟处理时间
        processing_time = random.uniform(1.5, 3.5)
        
        # 随机选择症状（但正常结果的概率更高）
        symptoms = list(SYMPTOM_DATABASE.keys())
        weights = [0.4, 0.2, 0.15, 0.15, 0.1]  # 正常概率40%，其他症状概率较低
        detected_symptom = random.choices(symptoms, weights=weights)[0]
        
        symptom_data = SYMPTOM_DATABASE[detected_symptom]
        confidence = random.uniform(0.75, 0.95)
        
        # 特征映射
        feature_mapping = {
            "normal": {"color": "棕色", "texture": "成形", "shape": "长条状"},
            "Lightweight and portable": {"color": "黄色", "texture": "软便", "shape": "糊状"},
            "watery diarrhoea": {"color": "黄色", "texture": "稀水", "shape": "不规则"},
            "constipation": {"color": "深棕色", "texture": "硬块", "shape": "颗粒状"},
            "parasitic infection": {"color": "异常色", "texture": "异常", "shape": "不规则"}
        }
        
        features = feature_mapping.get(detected_symptom, feature_mapping["normal"])
        
        result = {
            "success": True,
            "detection": {
                "color": features["color"],
                "texture": features["texture"],
                "shape": features["shape"], 
                "confidence": round(confidence, 3),
                "class_name": detected_symptom
            },
            "health_analysis": {
                "risk_level": "normal" if symptom_data["risk_level"] <= 30 else "warning" if symptom_data["risk_level"] <= 50 else "danger",
                "message": symptom_data["name"] + "症状",
                "description": symptom_data["description"],
                "confidence": round(confidence, 3),
                "recommendation": symptom_data["recommendation"],
                "detected_class": detected_symptom
            },
            "risk_metrics": {
                "risk_level": symptom_data["risk_level"],
                "cure_rate": symptom_data["cure_rate"], 
                "color": symptom_data["color"]
            },
            "processing_time": round(processing_time, 2),
            "analyzed_at": datetime.now().isoformat(),
            "service": "yolov8_cloud_enhanced"
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f" 分析失败: {e}")
        return jsonify({
            "success": False,
            "error": f"分析失败: {str(e)}"
        }), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """测试端点"""
    return jsonify({
        "message": "CatHealth AI Service is working!",
        "status": "success",
        "timestamp": datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f" CatHealth云服务启动在端口 {port}")
    print(f" 服务模式: 增强AI模拟")
    print(f" 支持5种症状检测")
    print(f" 环境: Render云端")
    app.run(host='0.0.0.0', port=port, debug=False)
