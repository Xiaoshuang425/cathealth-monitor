const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// 获取本机IP
const os = require('os');
const interfaces = os.networkInterfaces();
let ipAddress = 'localhost';

for (let name of Object.keys(interfaces)) {
    for (let interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
            ipAddress = interface.address;
            break;
        }
    }
}

console.log("📁 当前目录:", __dirname);

// 配置静态文件路径
const publicPath = path.join(__dirname, '../public');
console.log("📁 公共文件目录:", publicPath);

// 主静态目录
app.use(express.static(publicPath));

// 配置子目录
const staticDirs = ['css', 'js', 'assets', 'images', 'styles'];
staticDirs.forEach(dir => {
    const dirPath = path.join(publicPath, dir);
    if (fs.existsSync(dirPath)) {
        app.use('/' + dir, express.static(dirPath));
        console.log("✅ 配置目录: /" + dir + " -> " + dirPath);
    }
});

// 资源请求日志
app.use((req, res, next) => {
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        const filePath = path.join(publicPath, req.url);
        const exists = fs.existsSync(filePath);
        console.log(`📄 ${exists ? '✅' : '❌'} ${req.url}`);
    }
    next();
});

// 所有路由
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log("===========================================");
    console.log("🐱 猫咪健康监测系统启动成功！");
    console.log("📍 本地访问: http://localhost:" + PORT);
    console.log("📱 手机访问: http://" + ipAddress + ":" + PORT);
    console.log("📁 文件目录: " + publicPath);
    console.log("===========================================");
});
