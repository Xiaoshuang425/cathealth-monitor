const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3001;
const PUBLIC_DIR = path.join(__dirname, 'backend', 'public');

// 用户数据
const users = [
    { email: 'jiaminpan4@gmail.com', password: '091103ka', name: '凌霜大王' },
    { email: 'test@test.com', password: '123456', name: '测试用户' }
];

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    console.log('请求:', req.method, req.url);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
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
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        token: 'mock-token',
                        user: { name: user.name, email: user.email }
                    }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: '邮箱或密码错误'
                    }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: '请求格式错误' }));
            }
        });
        return;
    }
    
    // 静态文件服务
    let filePath = parsedUrl.pathname;
    if (filePath === '/') filePath = '/index.html';
    
    const fullPath = path.join(PUBLIC_DIR, filePath);
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('文件未找到');
        } else {
            res.writeHead(200);
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(' 服务器运行在: http://localhost:' + PORT);
    console.log(' 手机访问: http://192.168.31.199:' + PORT);
});
