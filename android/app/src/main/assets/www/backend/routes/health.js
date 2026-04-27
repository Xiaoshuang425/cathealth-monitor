const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'health-analysis-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB限制
    },
    fileFilter: function (req, file, cb) {
        // 检查文件类型
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件！'), false);
        }
    }
});

// 健康分析API
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        console.log('收到健康分析请求');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '请上传图片文件'
            });
        }

        // 模拟AI分析过程
        // 在实际应用中，这里会调用YOLO模型或其他AI服务
        const analysisResult = await simulateHealthAnalysis(req.file);

        // 返回分析结果
        res.json({
            success: true,
            result: analysisResult,
            message: '分析完成'
        });

    } catch (error) {
        console.error('健康分析错误:', error);
        res.status(500).json({
            success: false,
            error: error.message || '分析过程中发生错误'
        });
    }
});

// 模拟健康分析函数
async function simulateHealthAnalysis(imageFile) {
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 基于文件名或随机生成分析结果
    const healthStatuses = ['healthy', 'warning', 'critical', 'unknown'];
    const detectionTypes = ['正常排泄物', '轻微异常', '明显异常', '无法识别'];
    
    const randomStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
    const randomType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    
    // 根据状态生成相应的分数
    let healthScore;
    switch (randomStatus) {
        case 'healthy':
            healthScore = Math.floor(Math.random() * 20) + 80; // 80-100
            break;
        case 'warning':
            healthScore = Math.floor(Math.random() * 20) + 60; // 60-79
            break;
        case 'critical':
            healthScore = Math.floor(Math.random() * 30) + 30; // 30-59
            break;
        default:
            healthScore = Math.floor(Math.random() * 40) + 40; // 40-79
    }

    return {
        health_status: randomStatus,
        health_score: healthScore,
        detection_type: randomType,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
        analysis_details: getAnalysisDetails(randomStatus),
        timestamp: new Date().toISOString()
    };
}

// 根据健康状态生成详细分析
function getAnalysisDetails(status) {
    const details = {
        healthy: {
            summary: '排泄物形态正常，颜色健康',
            indicators: ['形态规则', '颜色正常', '无异味异常']
        },
        warning: {
            summary: '排泄物存在轻微异常，建议观察',
            indicators: ['形态稍有不规则', '颜色略有变化', '轻微异味']
        },
        critical: {
            summary: '排泄物明显异常，建议立即就医',
            indicators: ['形态异常', '颜色异常', '明显异味', '可能带血']
        },
        unknown: {
            summary: '无法准确分析，建议重新拍摄',
            indicators: ['图片模糊', '光线不足', '无法识别特征']
        }
    };

    return details[status] || details.unknown;
}

// 获取分析历史
router.get('/history', (req, res) => {
    try {
        // 这里可以从数据库获取用户的健康分析历史
        // 目前返回空数组，实际开发中需要连接数据库
        res.json({
            success: true,
            history: []
        });
    } catch (error) {
        console.error('获取历史记录错误:', error);
        res.status(500).json({
            success: false,
            error: '获取历史记录失败'
        });
    }
});

// 保存分析结果
router.post('/save', (req, res) => {
    try {
        const { result, notes } = req.body;
        
        // 这里可以将结果保存到数据库
        console.log('保存分析结果:', { result, notes });
        
        res.json({
            success: true,
            message: '分析结果已保存'
        });
    } catch (error) {
        console.error('保存结果错误:', error);
        res.status(500).json({
            success: false,
            error: '保存结果失败'
        });
    }
});

module.exports = router;
