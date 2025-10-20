console.log("🚀 开始启动 CatHealth 后端...");

// 检查环境变量
console.log("环境变量:");
console.log("PORT:", process.env.PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PWD:", process.env.PWD);

try {
    const express = require("express");
    const cors = require("cors");
    console.log("✅ Express 和 CORS 加载成功");
    
    const app = express();
    console.log(" Express 应用创建成功");
    
    // 中间件
    app.use(cors());
    app.use(express.json());
    console.log(" 中间件配置成功");
    
    // 健康检查
    app.get("/api/health", (req, res) => {
        console.log(" 健康检查被调用");
        res.json({ 
            status: "OK", 
            message: "CatHealth API 运行正常",
            timestamp: new Date().toISOString()
        });
    });
    
    // 根路径
    app.get("/", (req, res) => {
        res.json({
            message: "CatHealth 后端服务运行中",
            status: "success"
        });
    });
    
    // 启动服务器
    const PORT = process.env.PORT || 3001;
    console.log(\` 尝试在端口 \${PORT} 启动...\`);
    
    app.listen(PORT, "0.0.0.0", () => {
        console.log(\` 服务器成功启动在端口 \${PORT}\`);
        console.log(\` 服务地址: http://0.0.0.0:\${PORT}\`);
    }).on('error', (err) => {
        console.error(' 服务器启动失败:', err);
        process.exit(1);
    });
    
} catch (error) {
    console.error(' 初始化失败:', error);
    process.exit(1);
}
