const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 用于 Vercel
app.use(express.static(path.join(__dirname, "..", "..", "docs")));

// 模拟用户数据
const users = [
    { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王", id: 1 },
    { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户", id: 2 },
    { email: "test@test.com", password: "123456", name: "测试用户2", id: 3 }
];

// 健康检查
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "CatHealth API 运行正常" });
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

// 注册 API
app.post("/api/auth/register", (req, res) => {
    console.log("注册请求:", req.body);
    const { email, password, name } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "邮箱和密码不能为空"
        });
    }
    
    if (users.find(u => u.email === email)) {
        return res.status(409).json({
            success: false,
            error: "邮箱已存在"
        });
    }
    
    const newUser = {
        id: users.length + 1,
        email,
        password,
        name: name || "新用户"
    };
    
    users.push(newUser);
    
    res.json({
        success: true,
        message: "注册成功",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
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

// Vercel 需要导出 app
module.exports = app;
