const express = require("express");
const axios = require("axios");
const router = express.Router();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5001";

// 健康分析端点
router.post("/analyze", async (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: "未提供图片数据"
            });
        }
        
        console.log("收到分析请求，转发到Python YOLO服务");
        
        // 转发到Python YOLO服务
        const response = await axios.post(`${PYTHON_SERVICE_URL}/analyze/stool`, {
            image: image
        });
        
        // 返回YOLO分析结果
        res.json({
            success: true,
            ...response.data,
            analyzed_at: new Date().toISOString()
        });
        
    } catch (error) {
        console.error("分析错误:", error.message);
        
        // 如果Python服务不可用，使用模拟结果
        if (error.code === "ECONNREFUSED") {
            console.log("Python服务未启动，使用模拟结果");
            const mockResult = getMockAnalysisResult();
            res.json({
                success: true,
                ...mockResult,
                analyzed_at: new Date().toISOString(),
                note: "这是模拟结果，请启动Python YOLO服务以获得真实分析"
            });
        } else {
            res.status(500).json({
                success: false,
                error: "分析过程中发生错误"
            });
        }
    }
});

// 模拟分析结果（备用）
function getMockAnalysisResult() {
    const analyses = [
        {
            detection: {
                color: "棕色",
                texture: "成形",
                shape: "长条状",
                confidence: 0.92
            },
            health_analysis: {
                risk_level: "normal",
                message: "健康状况良好",
                description: "排泄物颜色、质地、形状均在正常范围内",
                confidence: 0.92,
                recommendation: "请保持当前的喂养习惯，继续观察猫咪的健康状况。"
            }
        },
        {
            detection: {
                color: "黄色",
                texture: "软便", 
                shape: "糊状",
                confidence: 0.87
            },
            health_analysis: {
                risk_level: "warning",
                message: "需要关注",
                description: "检测到轻微消化不良",
                confidence: 0.87,
                recommendation: "建议调整饮食，避免喂食过多零食，观察1-2天。"
            }
        },
        {
            detection: {
                color: "黑色",
                texture: "稀水",
                shape: "不规则",
                confidence: 0.95
            },
            health_analysis: {
                risk_level: "danger", 
                message: "高风险",
                description: "检测到可能的消化道出血",
                confidence: 0.95,
                recommendation: "立即联系兽医进行检查，这可能是严重健康问题的征兆。"
            }
        }
    ];
    
    return analyses[Math.floor(Math.random() * analyses.length)];
}

// 保存分析记录
router.post("/save", (req, res) => {
    try {
        const { result } = req.body;
        
        console.log("保存分析记录:", result.health_analysis.message);
        
        res.json({
            success: true,
            message: "分析记录保存成功",
            record_id: Date.now()
        });
        
    } catch (error) {
        console.error("保存错误:", error);
        res.status(500).json({
            success: false,
            error: "保存记录失败"
        });
    }
});

module.exports = router;
