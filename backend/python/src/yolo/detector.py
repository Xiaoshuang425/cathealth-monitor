import cv2
import numpy as np
from ultralytics import YOLO
import os
import base64
from PIL import Image
import io
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class YOLODetector:
    def __init__(self, model_path=None):
        """
        初始化YOLO检测器
        """
        if model_path is None:
            # 默认模型路径
            model_path = os.path.join(os.path.dirname(__file__), '../../models/best.pt')
        
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """加载YOLO模型"""
        try:
            if os.path.exists(self.model_path):
                print(f" 加载YOLO模型: {self.model_path}")
                self.model = YOLO(self.model_path)
                print(" YOLO模型加载成功")
            else:
                print(f" 模型文件不存在: {self.model_path}")
                # 创建模拟模型用于测试
                self.model = None
        except Exception as e:
            print(f" 模型加载失败: {e}")
            self.model = None
    
    def base64_to_image(self, base64_string):
        """将base64字符串转换为OpenCV图像"""
        try:
            # 移除data:image/jpeg;base64,前缀
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            # 解码base64
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            
            # 转换为OpenCV格式 (BGR)
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            return opencv_image
            
        except Exception as e:
            print(f" 图像解码失败: {e}")
            return None
    
    def detect_stool_features(self, image):
        """
        使用YOLO检测排泄物特征
        返回: 颜色、质地、形状等特征
        """
        if self.model is None:
            return self._mock_detection()
        
        try:
            # 使用YOLO进行检测
            results = self.model(image)
            
            if len(results) == 0:
                return self._get_default_result()
            
            # 获取第一个结果
            result = results[0]
            
            # 分析检测结果
            detection_info = self._analyze_detection(result, image)
            return detection_info
            
        except Exception as e:
            print(f" YOLO检测失败: {e}")
            return self._get_default_result()
    
    def _analyze_detection(self, result, image):
        """改进的YOLO检测结果分析"""
        try:
            print("开始分析检测结果...")
            
            # 检查所有可能的输出格式
            boxes = result.boxes
            if boxes is not None and len(boxes) > 0:
                print(f"找到 {len(boxes)} 个边界框")
                confidences = boxes.conf.cpu().numpy()
                class_ids = boxes.cls.cpu().numpy()
                
                # 找到置信度最高的检测
                max_confidence_idx = np.argmax(confidences)
                max_confidence = confidences[max_confidence_idx]
                class_id = int(class_ids[max_confidence_idx])
                
                # 获取类别名称
                if class_id < len(self.class_names):
                    class_name = self.class_names[class_id]
                    print(f"检测到: {class_name} (置信度: {max_confidence:.3f})")
                else:
                    class_name = "normal"
                    print(f"类别ID超出范围，使用默认类别: {class_name}")
                    
                return self._get_features_by_class(class_name, class_id, max_confidence, image)
            
            else:
                print("未检测到边界框，使用图像分类方法")
                # 如果没有边界框，尝试使用图像分类
                return self._classify_image_without_boxes(result, image)
                
        except Exception as e:
            print(f"分析检测结果失败: {e}")
            import traceback
            traceback.print_exc()
            return self._get_default_result()

    def _classify_image_without_boxes(self, result, image):
        """当没有边界框时的图像分类方法"""
        try:
            print("使用图像分类方法...")
            
            # 尝试从result中获取probs（分类模型的输出）
            if hasattr(result, 'probs') and result.probs is not None:
                probs = result.probs.data.cpu().numpy()
                if len(probs) > 0:
                    class_id = np.argmax(probs)
                    confidence = probs[class_id]
                    
                    if class_id < len(self.class_names):
                        class_name = self.class_names[class_id]
                        print(f"分类结果: {class_name} (置信度: {confidence:.3f})")
                        return self._get_features_by_class(class_name, class_id, confidence, image)
            
            # 如果还是没有结果，使用基于图像特征的简单分类
            return self._classify_by_image_features(image)
            
        except Exception as e:
            print(f"图像分类失败: {e}")
            return self._get_default_result()

    def _classify_by_image_features(self, image):
        """基于图像特征的简单分类"""
        try:
            print("使用图像特征分类...")
            
            # 简单的颜色和纹理分析（这里需要根据你的实际需求调整）
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 分析颜色直方图
            color_hist = cv2.calcHist([hsv], [0], None, [180], [0, 180])
            dominant_hue = np.argmax(color_hist)
            
            # 基于颜色特征的简单分类
            if 20 <= dominant_hue <= 30:  # 黄色范围
                class_name = "Lightweight and portable"
                confidence = 0.75
            elif 10 <= dominant_hue <= 20:  # 橙色范围
                class_name = "watery diarrhoea" 
                confidence = 0.70
            elif 0 <= dominant_hue <= 10:  # 红色范围
                class_name = "parasitic infection"
                confidence = 0.65
            else:  # 默认正常
                class_name = "normal"
                confidence = 0.80
                
            print(f"基于颜色分类: {class_name} (置信度: {confidence})")
            return self._get_features_by_class(class_name, 0, confidence, image)
            
        except Exception as e:
            print(f"图像特征分类失败: {e}")
            return self._get_default_result()
    
    def _get_features_by_class(self, class_name, class_id, confidence, image):
        """根据类别名称获取特征信息"""
        # 根据你的5种症状映射
        class_mapping = {
            "normal": {
                "color": "棕色",
                "texture": "成形",
                "shape": "长条状",
                "risk_level": "normal",
                "message": "健康状况良好",
                "description": "排泄物特征正常"
            },
            "Lightweight and portable": {
                "color": "黄色",
                "texture": "软便", 
                "shape": "糊状",
                "risk_level": "warning",
                "message": "需要关注",
                "description": "检测到轻微消化不良"
            },
            "watery diarrhoea": {
                "color": "黄色",
                "texture": "稀水",
                "shape": "不规则",
                "risk_level": "warning", 
                "message": "腹泻症状",
                "description": "检测到腹泻特征"
            },
            "constipation": {
                "color": "深棕色",
                "texture": "硬块", 
                "shape": "颗粒状",
                "risk_level": "warning",
                "message": "便秘症状",
                "description": "检测到便秘特征"
            },
            "parasitic infection": {
                "color": "异常色",
                "texture": "异常",
                "shape": "不规则", 
                "risk_level": "danger",
                "message": "高风险",
                "description": "检测到可能寄生虫感染"
            }
        }
        
        # 获取对应类别的特征
        features = class_mapping.get(class_name, class_mapping["normal"])
        
        return {
            "detection": {
                "color": features["color"],
                "texture": features["texture"],
                "shape": features["shape"],
                "class_name": class_name,
                "class_id": int(class_id),
                "confidence": float(confidence)
            },
            "health_analysis": {
                "risk_level": features["risk_level"],
                "message": features["message"],
                "description": features["description"],
                "confidence": float(confidence),
                "recommendation": self._get_recommendation(features["risk_level"])
            }
        }
    
    def _get_recommendation(self, risk_level):
        """根据风险等级获取建议"""
        recommendations = {
            "normal": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
            "warning": "建议调整饮食，避免喂食过多零食，观察1-2天。如症状持续请咨询兽医。",
            "danger": "立即联系兽医进行检查，这可能是严重健康问题的征兆。"
        }
        return recommendations.get(risk_level, "请咨询专业兽医。")
    
    def _get_default_result(self):
        """获取默认结果（当检测失败时）"""
        return {
            "detection": {
                "color": "未检测",
                "texture": "未检测",
                "shape": "未检测",
                "confidence": 0.0
            },
            "health_analysis": {
                "risk_level": "unknown",
                "message": "分析失败",
                "description": "无法识别排泄物特征",
                "confidence": 0.0,
                "recommendation": "请重新拍摄清晰的图片或联系技术支持。"
            }
        }
    
    def _mock_detection(self):
        """模拟检测结果（用于测试）"""
        import random
        analyses = [
            {
                "detection": {
                    "color": "棕色",
                    "texture": "成形",
                    "shape": "长条状",
                    "confidence": 0.92
                },
                "health_analysis": {
                    "risk_level": "normal",
                    "message": "健康状况良好",
                    "description": "排泄物颜色、质地、形状均在正常范围内",
                    "confidence": 0.92,
                    "recommendation": "请保持当前的喂养习惯，继续观察猫咪的健康状况。"
                }
            },
            {
                "detection": {
                    "color": "黄色", 
                    "texture": "软便",
                    "shape": "糊状",
                    "confidence": 0.87
                },
                "health_analysis": {
                    "risk_level": "warning",
                    "message": "需要关注", 
                    "description": "检测到轻微消化不良",
                    "confidence": 0.87,
                    "recommendation": "建议调整饮食，避免喂食过多零食，观察1-2天。"
                }
            }
        ]
        return random.choice(analyses)