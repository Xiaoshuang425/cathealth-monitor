const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // 使用3001端口

// 静态文件配置
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));
app.use('/css', express.static(path.join(publicPath, 'css')));
app.use('/js', express.static(path.join(publicPath, 'js')));

// 资源请求日志
app.use((req, res, next) => {
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        console.log(` ${req.url}`);
    }
    next();
});

app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

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

app.listen(PORT, '0.0.0.0', () => {
    console.log("===========================================");
    console.log(" 猫咪健康监测系统启动成功！");
    console.log(" 本地访问: http://localhost:" + PORT);
    console.log(" 手机访问: http://" + ipAddress + ":" + PORT);
    console.log(" 使用端口: " + PORT);
    console.log("===========================================");
});
