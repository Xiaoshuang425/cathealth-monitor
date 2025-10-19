const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

console.log(' 启动静态文件服务器...');

// 配置静态文件目录 - 修复路径问题
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/css', express.static(path.join(__dirname, 'backend', 'public', 'css')));
app.use(express.static('.')); // 根目录
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// 路由处理
app.get('/', (req, res) => {
    const possiblePaths = [
        'index.html',
        'backend/public/index.html', 
        './index.html'
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(' 使用:', filePath);
            return res.sendFile(path.resolve(filePath));
        }
    }
    res.send('找不到index.html');
});

app.get('*.css', (req, res) => {
    console.log(' CSS请求:', req.url);
    const cssPath = req.url.startsWith('/') ? req.url.substring(1) : req.url;
    const possiblePaths = [
        cssPath,
        path.join('backend', 'public', cssPath),
        path.join('css', path.basename(cssPath))
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(' 找到CSS:', filePath);
            return res.sendFile(path.resolve(filePath));
        }
    }
    console.log(' CSS未找到:', req.url);
    res.status(404).send('CSS not found');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log(' 静态服务器启动成功！');
    console.log(' 本地: http://localhost:' + PORT);
    console.log(' 手机: http://192.168.31.199:' + PORT);
    console.log('===========================================');
});
