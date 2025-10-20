// 最简单的 Express 服务器
console.log(" 启动最简单的服务器...");

const express = require("express");
const app = express();

// 允许所有 CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.json());

// 健康检查
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// 登录端点
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "jiaminpan4@gmail.com" && password === "091103ka") {
        res.json({ success: true, message: "登录成功", user: { name: "凌霜大王", email: email } });
    } else {
        res.status(401).json({ success: false, error: "登录失败" });
    }
});

// 根路径
app.get("/", (req, res) => {
    res.json({ message: "CatHealth Backend API" });
});

// 启动服务器
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(\` 服务器运行在端口 \${port}\`);
});
