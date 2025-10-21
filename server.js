const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 基础中间件
app.use(express.json());
app.use(express.static('.')); // 服务整个项目根目录

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 所有其他路由都返回index.html (SPA支持)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs/dashboard.html'));
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📁 Serving from: ${__dirname}`);
});
