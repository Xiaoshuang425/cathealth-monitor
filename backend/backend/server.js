const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 模拟用户数据
let users = [
    {
        id: 1,
        name: '测试用户',
        email: 'test@example.com',
        password: '123456'
    }
];

// 认证路由
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    console.log('登录请求:', email, password);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
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

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    console.log('注册请求:', name, email);
    
    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: '该邮箱已被注册'
        });
    }
    
    // 创建新用户
    const newUser = {
        id: users.length + 1,
        name,
        email,
        password
    };
    users.push(newUser);
    
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

// 健康分析路由
app.post('/api/health/analyze', (req, res) => {
    console.log('收到健康分析请求');
    
    // 模拟分析结果
    const healthStatuses = ['healthy', 'warning', 'critical', 'unknown'];
    const detectionTypes = ['正常排泄物', '轻微异常', '明显异常', '无法识别'];
    
    const randomStatus = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];
    const randomType = detectionTypes[Math.floor(Math.random() * detectionTypes.length)];
    
    let healthScore;
    switch (randomStatus) {
        case 'healthy':
            healthScore = Math.floor(Math.random() * 20) + 80;
            break;
        case 'warning':
            healthScore = Math.floor(Math.random() * 20) + 60;
            break;
        case 'critical':
            healthScore = Math.floor(Math.random() * 30) + 30;
            break;
        default:
            healthScore = Math.floor(Math.random() * 40) + 40;
    }
    
    setTimeout(() => {
        res.json({
            success: true,
            result: {
                health_status: randomStatus,
                health_score: healthScore,
                detection_type: randomType,
                confidence: Math.floor(Math.random() * 20) + 80,
                timestamp: new Date().toISOString()
            },
            message: '分析完成'
        });
    }, 2000);
});

// 提供前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log('🐱 CatHealth Monitor 服务器启动成功！');
    console.log('📍 访问地址: http://localhost:' + PORT);
    console.log('⏰ 启动时间:', new Date().toLocaleString());
});
