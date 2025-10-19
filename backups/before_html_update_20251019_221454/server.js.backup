const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const PORT = 3003;

// YOLO服务配置
const YOLO_SERVICE_URL = 'http://localhost:5000';

// 模拟用户数据库
const users = [
    {
        id: 1,
        email: 'user@example.com',
        password: 'password123',
        username: 'catlover',
        name: '猫咪爱好者'
    },
    {
        id: 3,
        email: 'jiaminpan4@gmail.com',
        password: '091103ka',
        username: '凌霜大王',
        name: '凌霜大王'
    }
];

// 中间件 - 必须放在路由之前
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'backend', 'public')));

// ========== API 路由 ==========

// 登录路由
app.post('/api/auth/login', (req, res) => {
    console.log(' 收到登录请求:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: '请输入邮箱和密码' 
        });
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const { password, ...userWithoutPassword } = user;
        console.log(' 登录成功:', user.email);
        res.json({ 
            success: true, 
            token: 'mock-jwt-token-' + user.id,
            user: userWithoutPassword
        });
    } else {
        console.log(' 登录失败: 邮箱或密码错误');
        res.status(401).json({ 
            success: false, 
            error: '邮箱或密码错误' 
        });
    }
});

// 注册路由
app.post('/api/auth/register', (req, res) => {
    console.log(' 收到注册请求:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            error: '请填写所有必填字段' 
        });
    }
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ 
            success: false, 
            error: '该邮箱已被注册' 
        });
    }
    
    const newUser = {
        id: users.length + 1,
        email: email,
        password: password,
        username: name.toLowerCase().replace(/\s+/g, ''),
        name: name
    };
    
    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    console.log(' 注册成功:', email);
    res.json({ 
        success: true, 
        message: '注册成功！现在可以登录了',
        user: userWithoutPassword
    });
});

// 健康分析路由
app.post('/api/analysis/analyze', async (req, res) => {
    console.log(' 收到健康分析请求');
    
    try {
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({
                success: false,
                error: "未提供图片数据"
            });
        }
        
        // 模拟分析结果
        const mockResults = [
            { 
                condition: "健康", 
                confidence: 0.95, 
                advice: "猫咪看起来很健康！继续保持良好的护理习惯。",
                risk_level: "normal"
            },
            { 
                condition: "轻微消化不良", 
                confidence: 0.87, 
                advice: "建议调整饮食，避免喂食过多零食。",
                risk_level: "warning"
            }
        ];
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
        
        res.json({
            success: true,
            analysis: {
                ...randomResult,
                timestamp: new Date().toISOString(),
                using_real_ai: false
            }
        });
        
    } catch (error) {
        console.error('分析错误:', error);
        res.status(500).json({
            success: false,
            error: "分析过程中发生错误"
        });
    }
});

// 其他API路由
app.get('/api/cats/count', (req, res) => {
    res.json({ count: 0 });
});

app.get('/api/cats', (req, res) => {
    res.json([]);
});

app.post('/api/cats', (req, res) => {
    res.json({ success: true, id: Date.now() });
});

app.get('/api/health-records', (req, res) => {
    res.json([]);
});

// ========== 页面路由 ==========

// 根路径
app.get('/', (req, res) => {
    console.log(' 访问根路径');
    res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));
});

// 登录页面
app.get('/login', (req, res) => {
    console.log(' 访问登录页面');
    res.sendFile(path.join(__dirname, 'backend', 'public', 'login.html'));
});

// 仪表盘页面
app.get('/dashboard.html', (req, res) => {
    console.log(' 访问仪表盘');
    res.sendFile(path.join(__dirname, 'backend', 'public', 'dashboard.html'));
});

// 404处理 - 必须在最后
app.use((req, res) => {
    console.log(' 404 - 未找到路径:', req.method, req.url);
    if (req.url.startsWith('/api/')) {
        res.status(404).json({ 
            success: false, 
            error: `API路径不存在: ${req.method} ${req.url}` 
        });
    } else {
        res.status(404).send(`
            <html>
                <body>
                    <h1>404 - 页面未找到</h1>
                    <p>请求的URL: ${req.url}</p>
                    <p><a href="/">返回首页</a></p>
                </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(` 猫咪健康监测系统运行在: http://localhost:${PORT}`);
    console.log(` 手机访问: http://您的IP地址:${PORT}`);
    console.log(` 测试账号: jiaminpan4@gmail.com / 091103ka`);
    console.log(` 服务器已启动，等待请求...`);
});
