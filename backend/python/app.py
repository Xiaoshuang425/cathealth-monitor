import os
import random
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

# 手动处理CORS（不需要flask-cors）
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

print(" CatHealth Ultra Simple Service Starting...")

# 症状数据库
SYMPTOM_DATABASE = {
    "normal": {
        "name": "正常",
        "risk_level": 5,
        "cure_rate": 98,
        "color": "#28a745",
        "description": "排泄物特征正常，猫咪健康状况良好",
        "recommendation": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
        "features": {"color": "棕色", "texture": "成形", "shape": "长条状"}
    },
    "soft_stool": {
        "name": "软便", 
        "risk_level": 25,
        "cure_rate": 90,
        "color": "#ffc107",
        "description": "检测到轻微消化不良症状，可能存在饮食问题",
        "recommendation": "建议调整饮食，暂时禁食12小时，喂食温和食物如白水煮鸡胸肉。",
        "features": {"color": "黄色", "texture": "软便", "shape": "糊状"}
    },
    "diarrhea": {
        "name": "拉稀",
        "risk_level": 65, 
        "cure_rate": 85,
        "color": "#fd7e14",
        "description": "检测到水样腹泻，需要注意消化系统健康",
        "recommendation": "确保猫咪充足饮水，避免脱水，如症状持续请咨询兽医。",
        "features": {"color": "黄色", "texture": "稀水", "shape": "不规则"}
    },
    "constipation": {
        "name": "便秘",
        "risk_level": 40,
        "cure_rate": 92,
        "color": "#17a2b8",
        "description": "检测到便秘特征，需要增加水分和纤维摄入",
        "recommendation": "增加膳食纤维，鼓励多喝水，喂食南瓜泥帮助通便。",
        "features": {"color": "深棕色", "texture": "硬块", "shape": "颗粒状"}
    },
    "parasite": {
        "name": "寄生虫感染",
        "risk_level": 75,
        "cure_rate": 95, 
        "color": "#dc3545",
        "description": "检测到可能的寄生虫感染特征，建议立即检查",
        "recommendation": "立即联系兽医进行检查，需要进行粪便检查和驱虫治疗。",
        "features": {"color": "异常色", "texture": "异常", "shape": "不规则"}
    }
}

def simple_ai_analysis():
    """极简AI分析 - 纯随机逻辑"""
    symptoms = list(SYMPTOM_DATABASE.keys())
    weights = [0.5, 0.15, 0.12, 0.13, 0.1]
    detected_symptom = random.choices(symptoms, weights=weights)[0]
    
    symptom_data = SYMPTOM_DATABASE[detected_symptom]
    confidence = round(random.uniform(0.82, 0.96), 3)
    
    return {
        "symptom": detected_symptom,
        "data": symptom_data,
        "confidence": confidence
    }

@app.route('/')
def home():
    return {
        "service": "CatHealth Ultra Simple API",
        "status": "running", 
        "version": "1.0",
        "ai_service": "Random Logic AI",
        "dependencies": "Flask only"
    }

@app.route('/health', methods=['GET'])
def health_check():
    return {
        "status": "healthy",
        "service": "CatHealth AI Service",
        "version": "Ultra Simple",
        "symptoms": list(SYMPTOM_DATABASE.keys())
    }

@app.route('/analyze', methods=['POST'])
def analyze_stool():
    """AI排泄物分析端点 - 极简版本"""
    try:
        data = request.get_json()
        
        if not data:
            return {
                "success": False,
                "error": "没有提供数据"
            }, 400
        
        print(f" AI分析请求 - {datetime.now().strftime('%H:%M:%S')}")
        
        # 极速处理
        processing_time = round(random.uniform(0.3, 1.2), 2)
        
        # 使用极简分析
        analysis = simple_ai_analysis()
        symptom_data = analysis["data"]
        
        result = {
            "success": True,
            "detection": {
                **symptom_data["features"],
                "confidence": analysis["confidence"],
                "class_name": analysis["symptom"]
            },
            "health_analysis": {
                "risk_level": "normal" if symptom_data["risk_level"] <= 30 else "warning" if symptom_data["risk_level"] <= 50 else "danger",
                "message": symptom_data["name"] + "症状",
                "description": symptom_data["description"],
                "confidence": analysis["confidence"],
                "recommendation": symptom_data["recommendation"],
                "detected_class": analysis["symptom"]
            },
            "risk_metrics": {
                "risk_level": symptom_data["risk_level"],
                "cure_rate": symptom_data["cure_rate"], 
                "color": symptom_data["color"]
            },
            "processing_time": processing_time,
            "analyzed_at": datetime.now().isoformat(),
            "service": "ultra_simple_ai"
        }
        
        return result
        
    except Exception as e:
        print(f" 分析失败: {e}")
        return {
            "success": False,
            "error": f"分析失败: {str(e)}"
        }, 500

@app.route('/test', methods=['GET'])
def test_analysis():
    """测试分析功能"""
    analysis = simple_ai_analysis()
    symptom_data = analysis["data"]
    
    return {
        "success": True,
        "detection": {
            **symptom_data["features"],
            "confidence": analysis["confidence"],
            "class_name": analysis["symptom"]
        },
        "health_analysis": {
            "risk_level": "normal" if symptom_data["risk_level"] <= 30 else "warning" if symptom_data["risk_level"] <= 50 else "danger",
            "message": symptom_data["name"] + "症状",
            "description": symptom_data["description"],
            "confidence": analysis["confidence"],
            "recommendation": symptom_data["recommendation"]
        },
        "test_mode": True
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    print(f" 极简服务启动在端口 {port}")
    print(f" 依赖: 仅Flask")
    print(f" 支持5种症状检测")
    app.run(host='0.0.0.0', port=port, debug=False)
