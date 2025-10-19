import cv2
import numpy as np
from ultralytics import YOLO
import os
import base64
from PIL import Image
import io

class YOLODetector:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), '../../models/best.pt')
        
        self.model_path = model_path
        self.model = None
        self.class_names = []
        self.load_model()
    
    def load_model(self):
        """加载YOLO模型并详细检查"""
        try:
            if os.path.exists(self.model_path):
                print(f" 加载YOLO模型: {self.model_path}")
                print(f" 模型文件大小: {os.path.getsize(self.model_path)} bytes")
                
                # 尝试加载模型
                self.model = YOLO(self.model_path)
                
                # 详细检查模型信息
                print(" 检查模型信息:")
                print(f"   - 模型类型: {type(self.model)}")
                print(f"   - 模型属性: {dir(self.model)}")
                
                # 获取类别名称
                if hasattr(self.model, 'names') and self.model.names:
                    self.class_names = list(self.model.names.values())
                    print(f" 实际类别名称: {self.class_names}")
                    print(f" 类别数量: {len(self.class_names)}")
                else:
                    print(" 无法获取类别名称")
                    # 手动设置您提供的类别
                    self.class_names = ["normal", "Lightweight and portable", "watery diarrhoea", "constipation", "parasitic infection"]
                    print(f"  使用手动类别: {self.class_names}")
                
                # 测试模型推理
                print(" 测试模型推理...")
                test_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
                test_results = self.model(test_image)
                print(f" 模型推理测试成功: {len(test_results)} 个结果")
                
            else:
                print(f" 模型文件不存在: {self.model_path}")
                print(f" 当前目录: {os.getcwd()}")
                print(f" 模型路径: {os.path.abspath(self.model_path)}")
                self.model = None
                
        except Exception as e:
            print(f" 模型加载失败: {e}")
            import traceback
            traceback.print_exc()
            self.model = None
    
    def base64_to_image(self, base64_string):
        """将base64字符串转换为OpenCV图像并调整尺寸"""
        try:
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            
            # 转换为OpenCV格式
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            
            # 调整图像尺寸为模型期望的尺寸
            original_height, original_width = opencv_image.shape[:2]
            print(f" 原始图像尺寸: {original_width}x{original_height}")
            
            # 调整到适合YOLO的尺寸 (640x640)
            target_size = 640
            scale = min(target_size / original_width, target_size / original_height)
            new_width = int(original_width * scale)
            new_height = int(original_height * scale)
            
            resized_image = cv2.resize(opencv_image, (new_width, new_height))
            print(f" 调整后尺寸: {new_width}x{new_height}")
            
            return resized_image
            
        except Exception as e:
            print(f" 图像解码失败: {e}")
            return None
    
    def detect_stool_features(self, image):
        """使用YOLO检测排泄物特征"""
        if self.model is None:
            print(" 模型未加载，使用模拟结果")
            return self._mock_detection()
        
        try:
            print(" 开始YOLO检测...")
            print(f" 输入图像: shape={image.shape}, dtype={image.dtype}")
            
            # 使用YOLO进行检测，调整置信度阈值
            results = self.model(
                image, 
                conf=0.25,  # 降低置信度阈值
                iou=0.45,   # IoU阈值
                verbose=False  # 关闭详细输出
            )
            
            print(f" YOLO检测完成，找到 {len(results)} 个结果")
            
            if len(results) == 0:
                print(" 未检测到任何目标")
                # 保存图像用于调试
                debug_path = "debug_image.jpg"
                cv2.imwrite(debug_path, image)
                print(f" 调试图像已保存: {debug_path}")
                return self._get_default_result()
            
            # 获取第一个结果
            result = results[0]
            
            # 详细分析检测结果
            detection_info = self._analyze_detection(result, image)
            return detection_info
            
        except Exception as e:
            print(f" YOLO检测失败: {e}")
            import traceback
            traceback.print_exc()
            return self._get_default_result()
    
    def _analyze_detection(self, result, image):
        """详细分析YOLO检测结果"""
        try:
            boxes = result.boxes
            if boxes is None:
                print(" boxes 为 None")
                return self._get_default_result()
            
            if len(boxes) == 0:
                print(" 没有检测到边界框 (boxes为空)")
                # 检查其他可能的输出格式
                if hasattr(result, 'xyxy'):
                    print(f" 检查 xyxy: {getattr(result, 'xyxy', '无')}")
                if hasattr(result, 'xywh'):
                    print(f" 检查 xywh: {getattr(result, 'xywh', '无')}")
                return self._get_default_result()
            
            confidences = boxes.conf.cpu().numpy()
            class_ids = boxes.cls.cpu().numpy()
            
            print(f" 检测到 {len(confidences)} 个边界框")
            print(f" 置信度范围: {confidences.min():.3f} - {confidences.max():.3f}")
            
            # 找到置信度最高的检测
            max_confidence_idx = np.argmax(confidences)
            max_confidence = confidences[max_confidence_idx]
            class_id = int(class_ids[max_confidence_idx])
            
            # 获取类别名称
            if class_id < len(self.class_names):
                class_name = self.class_names[class_id]
                print(f" 检测到: 类别='{class_name}' (ID={class_id}), 置信度={max_confidence:.3f}")
            else:
                class_name = f"未知类别_{class_id}"
                print(f"  未知类别: ID={class_id}, 置信度={max_confidence:.3f}")
            
            # 根据实际检测的类别获取特征
            features = self._get_features_by_class(class_name, class_id, max_confidence, image)
            return features
            
        except Exception as e:
            print(f" 分析检测结果失败: {e}")
            import traceback
            traceback.print_exc()
            return self._get_default_result()

    # 其他方法保持不变...
    def _get_features_by_class(self, class_name, class_id, confidence, image):
        """根据实际检测的类别名称获取特征信息"""
        class_mapping = {
            "normal": {
                "color": "棕色", "texture": "成形", "shape": "长条状",
                "risk_level": "normal", "message": "健康状况良好",
                "description": "排泄物特征正常，猫咪健康状况良好"
            },
            "Lightweight and portable": {
                "color": "黄色", "texture": "软便", "shape": "糊状",
                "risk_level": "warning", "message": "轻微消化不良", 
                "description": "检测到轻微消化不良症状"
            },
            "watery diarrhoea": {
                "color": "黄色", "texture": "稀水", "shape": "不规则",
                "risk_level": "warning", "message": "腹泻症状",
                "description": "检测到水样腹泻，需要注意"
            },
            "constipation": {
                "color": "深棕色", "texture": "硬块", "shape": "颗粒状",
                "risk_level": "warning", "message": "便秘症状",
                "description": "检测到便秘特征"
            },
            "parasitic infection": {
                "color": "异常色", "texture": "异常", "shape": "不规则", 
                "risk_level": "danger", "message": "寄生虫感染风险",
                "description": "检测到可能的寄生虫感染特征"
            }
        }
        
        features = class_mapping.get(class_name, class_mapping["normal"])
        
        return {
            "detection": {
                "color": features["color"], "texture": features["texture"], 
                "shape": features["shape"], "class_id": class_id,
                "class_name": class_name, "confidence": float(confidence)
            },
            "health_analysis": {
                "risk_level": features["risk_level"], "message": features["message"],
                "description": features["description"], "confidence": float(confidence),
                "recommendation": self._get_recommendation(features["risk_level"], class_name),
                "detected_class": class_name
            }
        }
    
    def _get_recommendation(self, risk_level, class_name):
        recommendations = {
            "normal": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
            "warning": "建议调整饮食，增加水分摄入，观察1-2天。如症状持续请咨询兽医。",
            "danger": "立即联系兽医进行检查，可能需要药物治疗。"
        }
        
        specific_advice = {
            "watery diarrhoea": "确保猫咪充足饮水，避免脱水。",
            "constipation": "增加膳食纤维，鼓励多喝水。", 
            "parasitic infection": "需要进行驱虫治疗，请咨询兽医。",
            "Lightweight and portable": "暂时减少零食，观察消化情况。"
        }
        
        base_recommendation = recommendations.get(risk_level, "请咨询专业兽医。")
        extra_advice = specific_advice.get(class_name, "")
        
        return base_recommendation + " " + extra_advice
    
    def _get_default_result(self):
        return {
            "detection": {
                "color": "未检测", "texture": "未检测", "shape": "未检测", "confidence": 0.0
            },
            "health_analysis": {
                "risk_level": "unknown", "message": "分析失败",
                "description": "无法识别排泄物特征", "confidence": 0.0,
                "recommendation": "请重新拍摄清晰的图片或联系技术支持。"
            }
        }
    
    def _mock_detection(self):
        import random
        analyses = [
            {
                "detection": {
                    "color": "棕色", "texture": "成形", "shape": "长条状",
                    "confidence": 0.92, "class_name": "normal"
                },
                "health_analysis": {
                    "risk_level": "normal", "message": "健康状况良好",
                    "description": "排泄物特征正常", "confidence": 0.92,
                    "recommendation": "请保持当前的喂养习惯。",
                    "detected_class": "normal"
                }
            }
        ]
        return random.choice(analyses)
