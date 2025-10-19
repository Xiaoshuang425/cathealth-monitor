const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, 'backend', 'public');

console.log('🐱 启动服务器...');

const server = http.createServer((req, res) => {
    console.log('请求:', req.method, req.url);
    
    let filePath = req.url;
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    const fullPath = path.join(PUBLIC_DIR, filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.log('404:', filePath);
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - 页面未找到</h1>');
        } else {
            console.log('200:', filePath);
            
            // 根据文件扩展名设置正确的Content-Type
            const ext = path.extname(filePath).toLowerCase();
            const contentTypes = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.ico': 'image/x-icon'
            };
            
            const contentType = contentTypes[ext] || 'text/plain; charset=utf-8';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('✅ 服务器运行在: http://localhost:' + PORT);
    console.log('📱 手机访问: http://192.168.31.199:' + PORT);
});
