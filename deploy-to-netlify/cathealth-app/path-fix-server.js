const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

console.log('🐱 启动路径修复服务器...');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 多个可能的位置
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(express.static('.'));
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// 模拟用户数据库
const users = [
    { 
        email: 'jiaminpan4@gmail.com', 
        password: '091103ka', 
        name: '凌霜大王',
        id: 1
    },
    { 
        email: 'jiaminpan@gmail.com', 
        password: '123456', 
        name: '测试用户2',
        id: 2
    }
];

// 登录API
app.post('/api/auth/login', (req, res) => {
    console.log('🔐 登录请求:', req.body);
    
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('✅ 登录成功:', email);
        res.json({
            success: true,
            message: '登录成功',
            token: 'mock-jwt-token-' + Date.now(),
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: '邮箱或密码错误'
        });
    }
});

// 智能页面路由 - 支持多个可能的位置
app.get('/dashboard.html', (req, res) => {
    console.log('📊 请求dashboard页面');
    
    const possiblePaths = [
        'dashboard.html',
        'backend/public/dashboard.html',
        './dashboard.html',
        path.join(__dirname, 'dashboard.html'),
        path.join(__dirname, 'backend', 'public', 'dashboard.html')
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log('✅ 找到dashboard:', filePath);
            return res.sendFile(path.resolve(filePath));
        }
    }
    
    console.log('❌ dashboard.html未找到，尝试路径:', possiblePaths);
    res.status(404).send('Dashboard页面未找到');
});

app.get('/health-analysis.html', (req, res) => {
    console.log('📈 请求health-analysis页面');
    
    const possiblePaths = [
        'health-analysis.html',
        'backend/public/health-analysis.html',
        './health-analysis.html'
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log('✅ 找到health-analysis:', filePath);
            return res.sendFile(path.resolve(filePath));
        }
    }
    
    res.status(404).send('Health Analysis页面未找到');
});

app.get('/', (req, res) => {
    const possiblePaths = [
        'index.html',
        'backend/public/index.html',
        './index.html'
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            return res.sendFile(path.resolve(filePath));
        }
    }
    res.send('首页未找到');
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log('🎉 路径修复服务器启动成功！');
    console.log('📍 本地访问: http://localhost:' + PORT);
    console.log('📱 手机访问: http://192.168.31.199:' + PORT);
    console.log('===========================================');
});
