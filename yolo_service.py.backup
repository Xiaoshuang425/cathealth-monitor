import cv2
import numpy as np
import sys
import json
import os
from ultralytics import YOLO

class YOLOHealthAnalyzer:
    def __init__(self, model_path='best.pt'):
        self.model_path = model_path
        self.model = None
        self.class_names = ["normal", "Lightweight and portable", "watery diarrhoea", "constipation", "parasitic infection"]
        self.load_model()
    
    def load_model(self):
        """加载YOLO模型"""
        try:
            print(f"正在加载YOLO模型: {self.model_path}")
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                print("✅ YOLO模型加载成功")
                print(f"类别数量: {len(self.class_names)}")
                print(f"类别名称: {self.class_names}")
            else:
                print(f"❌ 模型文件不存在: {self.model_path}")
                print("将使用模拟模式")
                self.model = None
        except Exception as e:
            print(f"❌ 模型加载失败: {e}")
            self.model = None
    
    def analyze_image(self, image_path):
        """分析图片并返回健康结果"""
        try:
            if self.model is None:
                print("使用模拟分析模式")
                return self.mock_analysis()
            
            # 读取图片
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("无法读取图片文件")
            
            print(f"图片尺寸: {image.shape}")
            
            # YOLO推理
            results = self.model(image, conf=0.25, iou=0.45, verbose=False)
            
            if len(results) == 0:
                print("未检测到任何目标")
                return self.get_default_result()
            
            result = results[0]
            boxes = result.boxes
            
            if boxes is None or len(boxes) == 0:
                print("未检测到边界框")
                return self.get_default_result()
            
            # 获取置信度最高的检测结果
            confidences = boxes.conf.cpu().numpy()
            class_ids = boxes.cls.cpu().numpy()
            
            max_confidence_idx = np.argmax(confidences)
            max_confidence = confidences[max_confidence_idx]
            class_id = int(class_ids[max_confidence_idx])
            
            if class_id < len(self.class_names):
                detected_class = self.class_names[class_id]
            else:
                detected_class = "unknown"
            
            print(f"检测结果: {detected_class}, 置信度: {max_confidence:.3f}")
            
            # 根据检测结果生成健康分析
            return self.generate_health_analysis(detected_class, max_confidence)
            
        except Exception as e:
            print(f"分析过程中出错: {e}")
            return self.get_default_result()
    
    def generate_health_analysis(self, detected_class, confidence):
        """根据检测类别生成健康分析结果"""
        analysis_map = {
            "normal": {
                "risk_level": "healthy",
                "health_score": 85 + int(confidence * 15),
                "message": "健康状况良好",
                "description": "排泄物特征正常，猫咪健康状况良好",
                "features": {
                    "color": "棕色",
                    "texture": "成形",
                    "shape": "长条状"
                }
            },
            "Lightweight and portable": {
                "risk_level": "warning", 
                "health_score": 60 + int(confidence * 20),
                "message": "轻微消化不良",
                "description": "检测到轻微消化不良症状",
                "features": {
                    "color": "黄色",
                    "texture": "软便", 
                    "shape": "糊状"
                }
            },
            "watery diarrhoea": {
                "risk_level": "warning",
                "health_score": 50 + int(confidence * 20),
                "message": "腹泻症状", 
                "description": "检测到水样腹泻，需要注意",
                "features": {
                    "color": "黄色",
                    "texture": "稀水",
                    "shape": "不规则"
                }
            },
            "constipation": {
                "risk_level": "warning",
                "health_score": 65 + int(confidence * 15),
                "message": "便秘症状",
                "description": "检测到便秘特征",
                "features": {
                    "color": "深棕色",
                    "texture": "硬块",
                    "shape": "颗粒状"
                }
            },
            "parasitic infection": {
                "risk_level": "critical",
                "health_score": 40 + int(confidence * 20),
                "message": "寄生虫感染风险",
                "description": "检测到可能的寄生虫感染特征",
                "features": {
                    "color": "异常色",
                    "texture": "异常",
                    "shape": "不规则"
                }
            }
        }
        
        default_analysis = {
            "risk_level": "unknown",
            "health_score": 50,
            "message": "无法识别",
            "description": "无法识别排泄物特征",
            "features": {
                "color": "未检测",
                "texture": "未检测", 
                "shape": "未检测"
            }
        }
        
        analysis = analysis_map.get(detected_class, default_analysis)
        
        return {
            "detection": {
                "class_name": detected_class,
                "confidence": float(confidence),
                "features": analysis["features"]
            },
            "health_analysis": {
                "risk_level": analysis["risk_level"],
                "health_score": analysis["health_score"],
                "message": analysis["message"],
                "description": analysis["description"],
                "confidence": float(confidence),
                "recommendation": self.get_recommendation(analysis["risk_level"], detected_class),
                "detected_class": detected_class
            }
        }
    
    def get_recommendation(self, risk_level, detected_class):
        """根据风险等级和检测类别生成建议"""
        base_recommendations = {
            "healthy": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
            "warning": "建议调整饮食，增加水分摄入，观察1-2天。如症状持续请咨询兽医。",
            "critical": "立即联系兽医进行检查，可能需要药物治疗。",
            "unknown": "请重新拍摄清晰的图片或联系技术支持。"
        }
        
        specific_advice = {
            "watery diarrhoea": "确保猫咪充足饮水，避免脱水，暂时停止零食。",
            "constipation": "增加膳食纤维，鼓励多喝水，适当增加运动。",
            "parasitic infection": "需要进行驱虫治疗，请立即咨询兽医。",
            "Lightweight and portable": "暂时减少零食，观察消化情况，可考虑更换易消化猫粮。"
        }
        
        base_rec = base_recommendations.get(risk_level, "请咨询专业兽医。")
        extra_advice = specific_advice.get(detected_class, "")
        
        return base_rec + " " + extra_advice
    
    def mock_analysis(self):
        """模拟分析结果（用于测试）"""
        import random
        classes = ["normal", "Lightweight and portable", "watery diarrhoea", "constipation", "parasitic infection"]
        detected_class = random.choice(classes)
        confidence = random.uniform(0.7, 0.95)
        
        print(f"模拟检测: {detected_class}, 置信度: {confidence:.3f}")
        return self.generate_health_analysis(detected_class, confidence)
    
    def get_default_result(self):
        """获取默认结果"""
        return {
            "detection": {
                "class_name": "unknown",
                "confidence": 0.0,
                "features": {
                    "color": "未检测",
                    "texture": "未检测",
                    "shape": "未检测"
                }
            },
            "health_analysis": {
                "risk_level": "unknown",
                "health_score": 50,
                "message": "分析失败",
                "description": "无法识别排泄物特征",
                "confidence": 0.0,
                "recommendation": "请重新拍摄清晰的图片或联系技术支持。",
                "detected_class": "unknown"
            }
        }

def main():
    if len(sys.argv) < 2:
        print("Usage: python yolo_service.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    print(f"分析图片: {image_path}")
    
    analyzer = YOLOHealthAnalyzer()
    result = analyzer.analyze_image(image_path)
    
    # 输出JSON格式结果
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
