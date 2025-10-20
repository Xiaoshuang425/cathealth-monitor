// CatHealth Monitor - 连接后端版本
console.log('前端加载成功，后端地址: https://cathealth-backend1.onrender.com');

const CONFIG = {
    backendUrl: 'https://cathealth-backend1.onrender.com'
};

// 登录函数
async function loginUser(email, password) {
    console.log('发送登录请求到后端...');
    
    try {
        const response = await fetch(\\/api/auth/login\, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('登录成功:', result);
            return result;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || '登录失败');
        }
    } catch (error) {
        console.log('后端连接失败，使用模拟登录:', error);
        // 备用模拟登录
        return await mockLogin(email, password);
    }
}

// 模拟登录备用
async function mockLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = [
                { email: 'jiaminpan4@gmail.com', password: '091103ka', name: '凌霜大王' },
                { email: 'jiaminpan@gmail.com', password: '123456', name: '测试用户' }
            ];
            
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                try {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                } catch (e) {
                    console.log('localStorage 不可用');
                }
                
                resolve({ 
                    success: true, 
                    message: '登录成功（模拟模式）',
                    user: { name: user.name, email: user.email }
                });
            } else {
                reject(new Error('邮箱或密码错误'));
            }
        }, 800);
    });
}

// 检查后端状态
async function checkBackendStatus() {
    try {
        const response = await fetch(\\/api/health\);
        const data = await response.json();
        console.log(' 后端状态正常:', data);
        return { ok: true, data: data };
    } catch (error) {
        console.log(' 后端连接失败:', error);
        return { ok: false, error: error.message };
    }
}

// 初始化应用
function initializeApp() {
    console.log('初始化 CatHealth 应用...');
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (loginForm && emailInput && passwordInput) {
        // 自动填充测试账号
        emailInput.value = 'jiaminpan4@gmail.com';
        passwordInput.value = '091103ka';
        
        // 表单提交
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // 显示加载状态
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '登录中...';
            submitBtn.disabled = true;
            
            try {
                const result = await loginUser(email, password);
                alert(result.message);
                
                if (result.success) {
                    // 登录成功，跳转到仪表板
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                alert('登录失败: ' + error.message);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // 检查后端状态
    checkBackendStatus();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
