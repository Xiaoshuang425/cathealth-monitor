const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const app = express();
const PORT = 3001;

// 确保上传目录存在
const uploadsDir = path.join(__dirname, "backend", "uploads", "stool_images");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, "stool-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 限制
    },
    fileFilter: function (req, file, cb) {
        // 只允许图片文件
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("只支持图片文件！"));
        }
    }
});

// 中间件
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, "backend", "public")));
app.use("/uploads", express.static(path.join(__dirname, "backend", "uploads")));

// API 路由
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "服务器运行正常" });
});

// 用户认证路由
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    res.json({ 
        success: true, 
        message: "登录成功",
        user: { 
            id: 1, 
            name: email.split("@")[0], 
            email: email 
        },
        token: "mock-jwt-token"
    });
});

app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    res.json({ 
        success: true, 
        message: "注册成功",
        user: { 
            id: 2, 
            name: name, 
            email: email 
        },
        token: "mock-jwt-token"
    });
});

// 健康分析路由 - 图片上传和分析
app.post("/api/analysis/upload", upload.single("stoolImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "没有上传文件"
            });
        }

        console.log("文件上传成功:", req.file.filename);
        
        // 模拟 YOLO 分析过程
        const analysisResult = await simulateYOLOAnalysis(req.file);
        
        res.json({
            success: true,
            message: "分析完成",
            imageUrl: "/uploads/stool_images/" + req.file.filename,
            analysis: analysisResult
        });

    } catch (error) {
        console.error("分析错误:", error);
        res.status(500).json({
            success: false,
            error: "分析失败: " + error.message
        });
    }
});

// 模拟 YOLO 分析函数
async function simulateYOLOAnalysis(file) {
    // 这里将来会集成真实的 YOLO 模型
    // 现在返回模拟数据
    
    const healthConditions = [
        { type: "normal", confidence: 0.92, description: "正常粪便" },
        { type: "diarrhea", confidence: 0.15, description: "轻微腹泻" },
        { type: "constipation", confidence: 0.08, description: "轻微便秘" },
        { type: "bloody", confidence: 0.03, description: "便血迹象" },
        { type: "mucus", confidence: 0.12, description: "粘液便" }
    ];

    // 选择置信度最高的结果
    const primaryResult = healthConditions.reduce((prev, current) => 
        (prev.confidence > current.confidence) ? prev : current
    );

    // 风险评估
    let riskLevel = "low";
    let recommendation = "继续保持良好的喂养习惯";
    
    if (primaryResult.type === "bloody") {
        riskLevel = "high";
        recommendation = "检测到便血迹象，建议立即就医检查";
    } else if (primaryResult.type === "diarrhea" && primaryResult.confidence > 0.5) {
        riskLevel = "medium";
        recommendation = "轻微腹泻，建议调整饮食并观察";
    } else if (primaryResult.type === "mucus") {
        riskLevel = "medium";
        recommendation = "粘液便，需要关注猫咪的消化健康";
    }

    return {
        detectedCondition: primaryResult.type,
        confidence: primaryResult.confidence,
        description: primaryResult.description,
        riskLevel: riskLevel,
        recommendation: recommendation,
        allDetections: healthConditions.filter(d => d.confidence > 0.1),
        analysisTime: "0.8秒",
        modelVersion: "YOLOv5 - 模拟模式"
    };
}

// 获取分析历史
app.get("/api/analysis/history", (req, res) => {
    // 模拟分析历史数据
    const history = [
        {
            id: 1,
            imageUrl: "/uploads/stool_images/sample-1.jpg",
            date: new Date().toISOString(),
            condition: "normal",
            confidence: 0.95,
            riskLevel: "low"
        },
        {
            id: 2,
            imageUrl: "/uploads/stool_images/sample-2.jpg", 
            date: new Date(Date.now() - 86400000).toISOString(),
            condition: "diarrhea",
            confidence: 0.67,
            riskLevel: "medium"
        }
    ];

    res.json({
        success: true,
        history: history
    });
});

// 主页
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "backend", "public", "index.html"));
});

app.listen(PORT, () => {
    console.log("服务器运行在 http://localhost:" + PORT);
    console.log("健康分析API已就绪");
});
// 添加健康分析路由
const healthRoutes = require('./routes/health');
app.use('/api/health', healthRoutes);

// 提供上传文件的静态访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));