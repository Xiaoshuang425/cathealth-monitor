const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, 'backend', 'public');

// 模拟用户数据库
const users = [
    { email: 'jiaminpan4@gmail.com', password: '091103ka', name: '凌霜大王' },
    { email: 'test@test.com', password: '123456', name: '测试用户' }
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    console.log('请求:', req.method, req.url);
    
    // 设置CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API路由
    if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.log('登录请求:', data);
                
                const user = users.find(u => u.email === data.email && u.password === data.password);
                
                if (user) {
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        success: true,
                        token: 'mock-token-' + Date.now(),
                        user: { name: user.name, email: user.email }
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        success: false,
                        error: '邮箱或密码错误'
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: false,
                    error: '请求格式错误'
                }));
            }
        });
        return;
    }
    
    // 静态文件服务 - 处理路径编码
    let filePath = decodeURIComponent(parsedUrl.pathname);
    if (filePath === '/') {
        filePath = '/index.html';
    }
    
    const fullPath = path.join(PUBLIC_DIR, filePath);
    
    // 安全检查
    if (!fullPath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('禁止访问');
        return;
    }
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            console.log('文件未找到:', fullPath, err.message);
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('文件未找到: ' + filePath);
        } else {
            const ext = path.extname(fullPath).toLowerCase();
            const contentTypes = {
                '.html': 'text/html; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.json': 'application/json; charset=utf-8',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.ico': 'image/x-icon'
            };
            
            res.writeHead(200, {
                'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8'
            });
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(' 服务器运行在: http://localhost:' + PORT);
    console.log(' 手机访问: http://192.168.31.199:' + PORT);
    console.log(' 测试账号: jiaminpan4@gmail.com / 091103ka');
});
