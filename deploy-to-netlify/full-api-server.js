const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

console.log(' 启动完整API服务器...');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use(express.static('.'));

// 模拟用户数据库
const users = [
    { 
        email: 'jiaminpan4@gmail.com', 
        password: '091103ka', 
        name: '凌霜大王',
        id: 1
    },
    { 
        email: 'test@test.com', 
        password: '123456', 
        name: '测试用户',
        id: 2
    },
    { 
        email: 'jiaminpan@gmail.com', 
        password: '123456', 
        name: '测试用户2',
        id: 3
    }
];

// 登录API
app.post('/api/auth/login', (req, res) => {
    console.log(' 登录请求:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: '邮箱和密码不能为空'
        });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log(' 登录成功:', email);
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
        console.log(' 登录失败:', email);
        res.status(401).json({
            success: false,
            error: '邮箱或密码错误'
        });
    }
});

// 注册API
app.post('/api/auth/register', (req, res) => {
    console.log(' 注册请求:', req.body);
    
    const { email, password, name } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: '邮箱和密码不能为空'
        });
    }
    
    // 检查用户是否已存在
    if (users.find(u => u.email === email)) {
        return res.status(409).json({
            success: false,
            error: '邮箱已存在'
        });
    }
    
    const newUser = {
        id: users.length + 1,
        email,
        password,
        name: name || '新用户'
    };
    
    users.push(newUser);
    
    console.log(' 注册成功:', email);
    res.json({
        success: true,
        message: '注册成功',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// 调试API - 获取所有用户
app.get('/api/debug/users', (req, res) => {
    res.json({
        success: true,
        users: users.map(u => ({ ...u, password: '***' }))
    });
});

// 页面路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/health-analysis.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'health-analysis.html'));
});

// 404处理 - 对于API请求返回JSON
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API端点不存在'
    });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log(' 完整API服务器启动成功！');
    console.log(' 本地访问: http://localhost:' + PORT);
    console.log(' 手机访问: http://192.168.31.199:' + PORT);
    console.log('===========================================');
    console.log(' 测试账号:');
    console.log('   jiaminpan4@gmail.com / 091103ka');
    console.log('   jiaminpan@gmail.com / 123456');
    console.log('   test@test.com / 123456');
    console.log('===========================================');
    console.log(' 调试接口: http://localhost:' + PORT + '/api/debug/users');
    console.log('===========================================');
});
