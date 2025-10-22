
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("."));

// 用户数据
const users = [
  { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
  { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" }
];

// 登录 API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      token: "vercel-token-" + Date.now(),
      user: { name: user.name, email: user.email }
    });
  } else {
    res.status(401).json({ success: false, error: "登录失败" });
  }
});

// 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

module.exports = app;
