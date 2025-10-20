// 自动检测 API 地址 - Vercel 版本
const getAPIBaseURL = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return "http://localhost:3001/api";
    } else {
        // Vercel 部署时使用相对路径
        return "/api";
    }
};

const API_BASE_URL = getAPIBaseURL();

// 登录函数
async function loginUser(email, password) {
    try {
        console.log("发送登录请求到:", \`\${API_BASE_URL}/auth/login\`);
        const response = await fetch(\`\${API_BASE_URL}/auth/login\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            throw new Error(\`网络请求失败: \${response.status}\`);
        }
        
        const result = await response.json();
        console.log("登录响应:", result);
        return result;
    } catch (error) {
        console.error("API 连接失败:", error);
        // 备用模拟登录
        return await mockLogin(email, password);
    }
}

// 模拟登录作为备用
async function mockLogin(email, password) {
    console.log("使用模拟登录作为备用");
    await new Promise(resolve => setTimeout(resolve, 800));
    const users = [
        { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
        { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        return { 
            success: true, 
            message: "登录成功（模拟模式）",
            user: { name: user.name, email: user.email }
        };
    }
    throw new Error("邮箱或密码错误");
}

// 检查 API 状态
async function checkAPIStatus() {
    try {
        const response = await fetch(\`\${API_BASE_URL}/health\`);
        return response.ok;
    } catch (error) {
        console.log("API 不可用:", error.message);
        return false;
    }
}

// 页面加载时检查 API 状态
window.addEventListener('load', async () => {
    const isAPIAlive = await checkAPIStatus();
    const statusElement = document.getElementById('api-status');
    
    if (statusElement) {
        if (isAPIAlive) {
            statusElement.textContent = " 后端 API 连接正常";
            statusElement.style.color = "green";
        } else {
            statusElement.textContent = " 后端 API 未连接，使用模拟模式";
            statusElement.style.color = "orange";
        }
    }
    
    if (!isAPIAlive) {
        console.log(" API 服务器未运行，使用模拟模式");
    } else {
        console.log(" API 服务器连接正常");
    }
});
