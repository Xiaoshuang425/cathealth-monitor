const express = require("express");
const cors = require("cors");
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 模拟用户数据
const users = [
    { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王", id: 1 },
    { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户", id: 2 },
    { email: "test@test.com", password: "123456", name: "测试用户2", id: 3 }
];

// 健康检查
app.get("/api/health", (req, res) => {
    res.json({ 
        status: "OK", 
        message: "CatHealth API 运行正常",
        timestamp: new Date().toISOString()
    });
});

// 登录 API
app.post("/api/auth/login", (req, res) => {
    console.log("登录请求:", req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "邮箱和密码不能为空"
        });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({
            success: true,
            message: "登录成功",
            token: "jwt-token-" + Date.now(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: "邮箱或密码错误"
        });
    }
});

// 根路径
app.get("/", (req, res) => {
    res.json({
        message: "CatHealth 后端服务运行中",
        endpoints: {
            health: "/api/health",
            login: "/api/auth/login",
            debug: "/api/debug/users"
        }
    });
});

// 调试接口
app.get("/api/debug/users", (req, res) => {
    res.json({
        success: true,
        users: users.map(u => ({ ...u, password: "***" }))
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error("服务器错误:", err);
    res.status(500).json({
        success: false,
        error: "内部服务器错误"
    });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(\` 后端服务运行在端口 \${PORT}\`);
    console.log(\` 本地访问: http://localhost:\${PORT}\`);
    console.log(\` 健康检查: http://localhost:\${PORT}/api/health\`);
}).on('error', (err) => {
    console.error('服务器启动失败:', err);
    process.exit(1);
});

module.exports = app;
