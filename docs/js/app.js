// CatHealth Monitor - 详细调试版本
console.log('=== 前端应用启动 ===');

const CONFIG = {
    backendUrl: 'https://cathealth-backend1.onrender.com'
};

// 登录函数
async function loginUser(email, password) {
    console.log('📧 登录请求:', email);
    
    try {
        console.log('🔗 尝试连接后端...');
        const response = await fetch(\\/api/auth/login\, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log(' 响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log(' 登录成功:', result);
            return result;
        } else {
            const errorData = await response.json();
            console.log(' 登录失败:', errorData);
            throw new Error(errorData.error || '登录失败');
        }
    } catch (error) {
        console.log(' 网络错误，使用模拟登录:', error);
        return await mockLogin(email, password);
    }
}

// 模拟登录
async function mockLogin(email, password) {
    console.log(' 使用模拟登录...');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = [
                { email: 'jiaminpan4@gmail.com', password: '091103ka', name: '凌霜大王' },
                { email: 'jiaminpan@gmail.com', password: '123456', name: '测试用户' }
            ];
            
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                console.log(' 模拟登录成功:', user.name);
                try {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    console.log(' 用户数据已保存到 localStorage');
                } catch (e) {
                    console.log(' localStorage 不可用:', e);
                }
                
                resolve({ 
                    success: true, 
                    message: '登录成功！',
                    user: { name: user.name, email: user.email }
                });
            } else {
                console.log(' 模拟登录失败: 账号密码错误');
                reject(new Error('邮箱或密码错误'));
            }
        }, 800);
    });
}

// 跳转函数 - 多种方式尝试
function redirectToDashboard() {
    console.log(' 开始跳转到仪表板...');
    
    // 方法1: 直接跳转
    console.log('尝试方法1: window.location.href');
    try {
        window.location.href = 'dashboard.html';
        console.log(' 跳转指令已发送');
    } catch (error) {
        console.log(' 方法1失败:', error);
    }
    
    // 方法2: 延迟跳转（备用）
    setTimeout(() => {
        console.log('尝试方法2: setTimeout 跳转');
        window.location.href = 'dashboard.html';
    }, 100);
    
    // 方法3: 替换当前页面
    setTimeout(() => {
        console.log('尝试方法3: location.replace');
        window.location.replace('dashboard.html');
    }, 200);
    
    // 方法4: 显示手动跳转链接
    setTimeout(() => {
        console.log('尝试方法4: 显示手动跳转按钮');
        showManualRedirect();
    }, 1000);
}

// 显示手动跳转按钮
function showManualRedirect() {
    const existingBtn = document.getElementById('manual-redirect-btn');
    if (existingBtn) return;
    
    const btn = document.createElement('button');
    btn.id = 'manual-redirect-btn';
    btn.innerHTML = ' 点击这里跳转到仪表板';
    btn.style.cssText = \
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        border: none;
        padding: 15px 20px;
        border-radius: 10px;
        font-size: 16px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    \;
    
    btn.onclick = function() {
        console.log(' 手动点击跳转');
        window.location.href = 'dashboard.html';
    };
    
    document.body.appendChild(btn);
    console.log(' 手动跳转按钮已显示');
}

// 初始化应用
function initializeApp() {
    console.log(' 初始化应用...');
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    console.log(' 表单元素:', {
        loginForm: !!loginForm,
        emailInput: !!emailInput,
        passwordInput: !!passwordInput
    });
    
    if (loginForm && emailInput && passwordInput) {
        // 自动填充测试账号
        emailInput.value = 'jiaminpan4@gmail.com';
        passwordInput.value = '091103ka';
        console.log(' 测试账号已自动填充');
        
        // 表单提交
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log(' 表单提交事件触发');
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // 显示加载状态
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = ' 登录中...';
            submitBtn.disabled = true;
            
            try {
                console.log(' 开始登录流程...');
                const result = await loginUser(email, password);
                console.log(' 登录完成:', result);
                
                // 显示成功消息
                alert(result.message);
                
                if (result.success) {
                    console.log(' 登录成功，准备跳转...');
                    
                    // 等待用户看到成功消息
                    setTimeout(() => {
                        console.log(' 延迟跳转开始');
                        redirectToDashboard();
                    }, 800);
                }
            } catch (error) {
                console.error(' 登录错误:', error);
                alert('登录失败: ' + error.message);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                console.log(' 按钮状态已恢复');
            }
        });
        
        console.log(' 表单事件监听器已设置');
    } else {
        console.error(' 找不到必要的表单元素');
    }
}

// 页面加载完成后初始化
console.log(' 页面加载状态:', document.readyState);
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log(' DOMContentLoaded 事件触发');
        initializeApp();
    });
} else {
    console.log(' 文档已就绪，直接初始化');
    initializeApp();
}

// 窗口加载完成
window.addEventListener('load', function() {
    console.log(' 窗口加载完成');
});
