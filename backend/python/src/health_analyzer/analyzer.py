class HealthAnalyzer:
    def __init__(self):
        # 健康风险等级定义
        self.risk_levels = {
            "low": {"color": "green", "message": "健康状况良好"},
            "medium": {"color": "yellow", "message": "需要关注"},
            "high": {"color": "red", "message": "建议尽快就医"}
        }
        
        # 排泄物类型与健康风险映射
        self.stool_health_mapping = {
            "normal": {"risk": "low", "description": "正常粪便"},
            "abnormal": {"risk": "medium", "description": "异常粪便，建议观察"},
            "diarrhea": {"risk": "medium", "description": "腹泻，注意饮食"},
            "bloody": {"risk": "high", "description": "便血，立即就医"},
            "mucus": {"risk": "medium", "description": "粘液便，需要关注"}
        }
    
    def analyze(self, detection_results):
        """
        根据检测结果分析健康风险
        """
        if not detection_results.get("detections"):
            return {
                "risk_level": "unknown",
                "message": "未检测到排泄物",
                "recommendation": "请重新拍摄清晰的图像"
            }
        
        # 获取主要检测类别
        primary_class = detection_results["summary"]["primary_class"]
        confidence = detection_results["summary"]["overall_confidence"]
        
        # 根据类别判断健康风险
        if primary_class in self.stool_health_mapping:
            health_info = self.stool_health_mapping[primary_class]
            risk_info = self.risk_levels[health_info["risk"]]
            
            return {
                "risk_level": health_info["risk"],
                "detected_type": primary_class,
                "confidence": confidence,
                "message": risk_info["message"],
                "description": health_info["description"],
                "recommendation": self._get_recommendation(health_info["risk"]),
                "color": risk_info["color"]
            }
        else:
            return {
                "risk_level": "unknown",
                "message": "无法识别排泄物类型",
                "recommendation": "请咨询兽医"
            }
    
    def _get_recommendation(self, risk_level):
        """根据风险等级获取建议"""
        recommendations = {
            "low": "继续保持良好的喂养习惯，定期观察",
            "medium": "调整饮食，密切观察，如有恶化请及时就医",
            "high": "立即联系兽医进行检查和治疗"
        }
        return recommendations.get(risk_level, "请咨询专业兽医")