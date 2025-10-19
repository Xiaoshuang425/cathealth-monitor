const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

console.log(' 启动猫咪健康监测服务器...');

// 配置多个静态文件目录
app.use('/css', express.static(path.join(__dirname, 'backend', 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'backend', 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'backend', 'public', 'images')));
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// 调试中间件 - 显示所有请求
app.use((req, res, next) => {
    console.log(' 请求:', req.method, req.url);
    next();
});

// 确保CSS目录存在
const cssDir = path.join(__dirname, 'backend', 'public', 'css');
if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
    console.log(' 创建CSS目录');
}

// 创建基础CSS文件
const cssPath = path.join(cssDir, 'style.css');
if (!fs.existsSync(cssPath)) {
    const basicCSS = 
/* 基础样式 */
body {
    font-family: 'Arial', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

.container {
    max-width: 400px;
    margin: 50px auto;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

h1 {
    color: #5C4B37;
    text-align: center;
    margin-bottom: 20px;
}

input, button {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
}

button {
    background: #D4A574;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background: #C19564;
}
    ;
    fs.writeFileSync(cssPath, basicCSS, 'utf8');
    console.log(' 创建基础CSS文件');
}

// 创建带CSS链接的HTML
const htmlPath = path.join(__dirname, 'backend', 'public', 'index.html');
if (!fs.existsSync(htmlPath)) {
    const htmlContent = 
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> CatHealth Monitor</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="container">
        <h1> 猫咪健康监测系统</h1>
        <p style="text-align: center; color: #666;">CSS加载成功！ </p>
        
        <input type="email" placeholder="邮箱地址">
        <input type="password" placeholder="密码">
        <button>登录</button>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #28a745;"> CSS样式已应用</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">圆角、阴影、渐变背景</p>
        </div>
    </div>
</body>
</html>
    ;
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(' 创建HTML文件');
}

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log(' 服务器启动成功！');
    console.log(' 本地访问: http://localhost:' + PORT);
    console.log(' 手机访问: http://192.168.31.199:' + PORT);
    console.log('===========================================');
    console.log(' 静态文件目录:');
    console.log('   HTML: /backend/public/index.html');
    console.log('   CSS:  /backend/public/css/style.css');
    console.log('===========================================');
});
