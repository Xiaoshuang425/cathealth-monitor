const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 修复配置
app.use('/docs', express.static(path.join(__dirname, 'docs')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// 根路径重定向到dashboard
app.get('/', (req, res) => {
    res.redirect('/docs/dashboard.html');
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'CatHealth Main Backend',
        timestamp: new Date().toISOString(),
        endpoints: ['/health', '/docs/dashboard.html', '/docs/index.html']
    });
});

// API路由
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// ==================== AI排泄物分析功能 ====================
const SYMPTOM_DATABASE = {
    "normal": {
        "name": "正常",
        "risk_level": 5,
        "cure_rate": 98,
        "color": "#28a745",
        "description": "排泄物特征正常，猫咪健康状况良好",
        "recommendation": "请保持当前的喂养习惯，继续观察猫咪的健康状况。",
        "features": {"color": "棕色", "texture": "成形", "shape": "长条状"}
    },
    "Lightweight and portable": {
        "name": "软便", 
        "risk_level": 25,
        "cure_rate": 90,
        "color": "#ffc107",
        "description": "检测到轻微消化不良症状，可能存在饮食问题",
        "recommendation": "建议调整饮食，暂时禁食12小时，喂食温和食物如白水煮鸡胸肉。",
        "features": {"color": "黄色", "texture": "软便", "shape": "糊状"}
    },
    "watery diarrhoea": {
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
    "parasitic infection": {
        "name": "寄生虫感染",
        "risk_level": 75,
        "cure_rate": 95, 
        "color": "#dc3545",
        "description": "检测到可能的寄生虫感染特征，建议立即检查",
        "recommendation": "立即联系兽医进行检查，需要进行粪便检查和驱虫治疗。",
        "features": {"color": "异常色", "texture": "异常", "shape": "不规则"}
    }
};

function simulateAIAnalysis() {
    const symptoms = Object.keys(SYMPTOM_DATABASE);
    const weights = [0.5, 0.15, 0.12, 0.13, 0.1];
    
    let randomValue = Math.random();
    let selectedIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
        randomValue -= weights[i];
        if (randomValue <= 0) {
            selectedIndex = i;
            break;
        }
    }
    
    const symptomName = symptoms[selectedIndex];
    return SYMPTOM_DATABASE[symptomName];
}

// AI分析端点
app.post("/api/ai/analyze", (req, res) => {
    try {
        console.log(" AI分析请求");
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: "没有提供图像数据"
            });
        }

        // 模拟AI分析
        const symptom = simulateAIAnalysis();
        const confidence = (Math.random() * 0.14 + 0.82).toFixed(3);
        const processingTime = (Math.random() * 1.0 + 0.5).toFixed(2);
        
        const result = {
            success: true,
            detection: {
                ...symptom.features,
                confidence: parseFloat(confidence),
                class_name: symptom.name
            },
            health_analysis: {
                risk_level: symptom.risk_level <= 30 ? "normal" : symptom.risk_level <= 50 ? "warning" : "danger",
                message: symptom.name + "症状",
                description: symptom.description,
                confidence: parseFloat(confidence),
                recommendation: symptom.recommendation,
                detected_class: symptom.name
            },
            risk_metrics: {
                risk_level: symptom.risk_level,
                cure_rate: symptom.cure_rate,
                color: symptom.color
            },
            processing_time: parseFloat(processingTime),
            analyzed_at: new Date().toISOString(),
            service: "local_ai_service"
        };
        
        res.json(result);
        
    } catch (error) {
        console.error("AI分析错误:", error);
        res.status(500).json({
            success: false,
            error: "分析失败: " + error.message
        });
    }
});

// AI健康检查端点
app.get("/api/ai/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "Local AI Service",
        version: "1.0",
        symptoms_supported: Object.keys(SYMPTOM_DATABASE)
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(` CatHealth 后端服务运行在端口 ${port}`);
    console.log(` 静态文件服务: /docs, /css, /js`);
    console.log(` 主面板: http://localhost:${port}/docs/dashboard.html`);
    console.log(` 健康检查: http://localhost:${port}/health`);
});
