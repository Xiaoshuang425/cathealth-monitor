console.log('App JavaScript loaded successfully!');

let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    checkLoginStatus();
    setupEventListeners();
});

function setupEventListeners() {
    // 表单切换
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('login-card').classList.add('hidden');
        document.getElementById('register-card').classList.remove('hidden');
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('register-card').classList.add('hidden');
        document.getElementById('login-card').classList.remove('hidden');
    });
    
    // 密码显示切换
    document.getElementById('login-toggle-password').addEventListener('click', function() {
        togglePassword('login-password', this);
    });
    
    document.getElementById('register-toggle-password').addEventListener('click', function() {
        togglePassword('register-password', this);
    });
    
    // 登录功能
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            alert('请填写邮箱和密码');
            return;
        }
        
        await handleLogin(email, password);
    });
    
    // 注册功能
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            alert('两次输入的密码不一致！');
            return;
        }
        
        if (password.length < 6) {
            alert('密码长度至少6位！');
            return;
        }
        
        await handleRegister(name, email, password);
    });
}

async function handleLogin(email, password) {
    try {
        console.log('Sending login request...');
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            alert('登录成功！');
            showDashboard(data.user);
        } else {
            alert('登录失败: ' + (data.error || '未知错误'));
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('网络错误，请稍后重试');
    }
}

async function handleRegister(name, email, password) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('注册成功！请登录您的账户');
            document.getElementById('register-card').classList.add('hidden');
            document.getElementById('login-card').classList.remove('hidden');
            document.getElementById('login-email').value = email;
        } else {
            alert('注册失败: ' + (data.error || '未知错误'));
        }
        
    } catch (error) {
        console.error('Register error:', error);
        alert('网络错误，请稍后重试');
    }
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    const iconElement = icon.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Checking login status...');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            console.log('User found:', user);
            currentUser = user;
            showDashboard(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}

function showDashboard(user) {
    console.log('Showing dashboard for user:', user);
    
    const dashboardHTML = \
    <div style="min-height: 100vh; background: #FDF8F0; font-family: 'Microsoft YaHei', sans-serif;">
        <!-- 顶部导航 -->
        <div style="background: white; padding: 15px 30px; border-bottom: 1px solid #E8D0B3; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-cat" style="font-size: 1.5rem; color: #D4A574;"></i>
                <h1 style="color: #5C4B37; margin: 0;">CatHealth Monitor</h1>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #5C4B37;">欢迎，\！</span>
                <button onclick="logout()" style="padding: 8px 16px; background: #A8C8B8; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-sign-out-alt"></i> 退出登录
                </button>
            </div>
        </div>
        
        <!-- 侧边栏和内容 -->
        <div style="display: flex; min-height: calc(100vh - 70px);">
            <!-- 侧边栏 -->
            <div style="width: 250px; background: #F8F4E9; padding: 20px; border-right: 1px solid #E8D0B3;">
                <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #E8D0B3; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-user-circle" style="font-size: 2rem; color: #D4A574;"></i>
                        <div>
                            <div style="font-weight: bold; color: #5C4B37;">\</div>
                            <div style="font-size: 0.8rem; color: #8A7E6F;">\</div>
                        </div>
                    </div>
                </div>
                
                <nav style="display: flex; flex-direction: column; gap: 5px;">
                    <a href="#" onclick="showSection('dashboard')" style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; background: #D4A574; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        <i class="fas fa-home"></i>
                        <span>仪表盘</span>
                    </a>
                    <a href="#" onclick="showSection('analysis')" style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; color: #5C4B37; text-decoration: none; border-radius: 8px; transition: background 0.2s;">
                        <i class="fas fa-camera"></i>
                        <span>健康分析</span>
                    </a>
                    <a href="#" onclick="showSection('cats')" style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; color: #5C4B37; text-decoration: none; border-radius: 8px; transition: background 0.2s;">
                        <i class="fas fa-paw"></i>
                        <span>猫咪管理</span>
                    </a>
                </nav>
            </div>
            
            <!-- 主内容区域 -->
            <div style="flex: 1; padding: 30px;">
                <div id="content-area">
                    <!-- 默认显示仪表盘 -->
                    <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid #E8D0B3;">
                        <h2 style="color: #5C4B37; margin-bottom: 20px;">欢迎回来，\！</h2>
                        <p style="color: #8A7E6F; margin-bottom: 30px;">开始使用 CatHealth Monitor 来关注您的猫咪健康</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 30px;">
                            <div onclick="showSection('analysis')" style="background: #F8F4E9; padding: 25px; border-radius: 12px; border: 1px solid #E8D0B3; cursor: pointer; text-align: center; transition: transform 0.2s;">
                                <div style="width: 60px; height: 60px; background: #D4A574; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-camera" style="font-size: 1.5rem; color: white;"></i>
                                </div>
                                <h4 style="color: #5C4B37; margin-bottom: 10px;">健康分析</h4>
                                <p style="color: #8A7E6F; font-size: 0.9rem;">上传排泄物照片进行AI分析</p>
                            </div>
                            
                            <div onclick="showSection('cats')" style="background: #F8F4E9; padding: 25px; border-radius: 12px; border: 1px solid #E8D0B3; cursor: pointer; text-align: center; transition: transform 0.2s;">
                                <div style="width: 60px; height: 60px; background: #D4A574; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                                    <i class="fas fa-paw" style="font-size: 1.5rem; color: white;"></i>
                                </div>
                                <h4 style="color: #5C4B37; margin-bottom: 10px;">猫咪管理</h4>
                                <p style="color: #8A7E6F; font-size: 0.9rem;">为您的爱宠创建健康档案</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    \;
    
    document.body.innerHTML = dashboardHTML;
}

function showSection(sectionId) {
    const contentArea = document.getElementById('content-area');
    
    if (sectionId === 'analysis') {
        contentArea.innerHTML = \
        <div style="max-width: 1000px;">
            <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid #E8D0B3; margin-bottom: 20px;">
                <h2 style="color: #5C4B37; margin-bottom: 10px;">健康分析</h2>
                <p style="color: #8A7E6F; margin-bottom: 25px;">上传猫咪排泄物照片，获取AI健康分析报告</p>
                
                <div style="border: 2px dashed #D4A574; border-radius: 12px; padding: 50px 20px; text-align: center; cursor: pointer; background: rgba(212, 165, 116, 0.05);" onclick="document.getElementById('file-input').click()">
                    <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: #D4A574; margin-bottom: 15px;"></i>
                    <p style="font-size: 1.1rem; color: #5C4B37; margin-bottom: 10px;">点击或拖拽图片到这里</p>
                    <span style="font-size: 0.9rem; color: #8A7E6F;">支持 JPG、PNG 格式，最大 5MB</span>
                </div>
                <input type="file" id="file-input" accept="image/*" style="display: none;" onchange="handleFileSelect(event)">
                
                <div id="analyze-section" style="text-align: center; margin-top: 25px; display: none;">
                    <button onclick="analyzeImage()" style="padding: 12px 30px; background: #D4A574; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-search"></i> 开始分析
                    </button>
                </div>
            </div>
            
            <div id="result-section" style="display: none;">
                <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid #E8D0B3;">
                    <h3 style="color: #5C4B37; margin-bottom: 20px;">分析报告</h3>
                    <div id="result-content"></div>
                </div>
            </div>
        </div>
        \;
    } else if (sectionId === 'cats') {
        contentArea.innerHTML = \
        <div style="background: white; padding: 30px; border-radius: 15px; border: 1px solid #E8D0B3; text-align: center;">
            <i class="fas fa-paw" style="font-size: 4rem; color: #E8D0B3; margin-bottom: 20px;"></i>
            <h2 style="color: #5C4B37; margin-bottom: 15px;">猫咪管理</h2>
            <p style="color: #8A7E6F;">功能开发中...</p>
        </div>
        \;
    } else {
        // 默认显示仪表盘
        showDashboard(currentUser);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB！');
            return;
        }
        
        document.getElementById('analyze-section').style.display = 'block';
        alert('已选择文件: ' + file.name);
    }
}

async function analyzeImage() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files[0]) {
        alert('请先选择图片！');
        return;
    }
    
    const analyzeBtn = document.querySelector('#analyze-section button');
    const originalText = analyzeBtn.innerHTML;
    
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
    analyzeBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('image', fileInput.files[0]);
        
        const response = await fetch('/api/health/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAnalysisResult(data.result);
        } else {
            throw new Error(data.error || '分析失败');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        alert('分析失败: ' + error.message);
    } finally {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

function displayAnalysisResult(result) {
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');
    
    const statusText = {
        'healthy': '健康',
        'warning': '需要注意', 
        'critical': '需要就医',
        'unknown': '无法确定'
    }[result.health_status] || '未知状态';
    
    const statusColor = {
        'healthy': '#4CAF50',
        'warning': '#FF9800',
        'critical': '#F44336', 
        'unknown': '#9E9E9E'
    }[result.health_status] || '#9E9E9E';
    
    resultContent.innerHTML = \
    <div style="border-left: 4px solid \; padding-left: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #E8D0B3;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle" style="font-size: 1.5rem; color: \;"></i>
                <h3 style="color: #5C4B37; margin: 0;">分析结果</h3>
            </div>
            <span style="padding: 8px 16px; background: \; color: \; border-radius: 20px; font-weight: 600; font-size: 0.9rem;">
                \
            </span>
        </div>
        
        <div style="margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <label style="font-weight: 600; color: #5C4B37;">健康评分:</label>
                <span style="font-size: 1.2rem; font-weight: 700; color: #D4A574;">\/100</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <label style="font-weight: 600; color: #5C4B37;">检测类型:</label>
                <span>\</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <label style="font-weight: 600; color: #5C4B37;">分析时间:</label>
                <span>\</span>
            </div>
        </div>
        
        <div style="margin-bottom: 25px;">
            <label style="font-weight: 600; color: #5C4B37; display: block; margin-bottom: 8px;">分析置信度:</label>
            <div style="width: 100%; height: 8px; background: #E0E0E0; border-radius: 4px; margin: 8px 0; overflow: hidden;">
                <div style="height: 100%; background: linear-gradient(90deg, #D4A574, #A8C8B8); border-radius: 4px; width: \%;"></div>
            </div>
            <span style="font-weight: 600; color: #5C4B37;">\%</span>
        </div>
        
        <div>
            <h4 style="color: #5C4B37; margin-bottom: 15px;">建议措施</h4>
            <ul style="list-style: none; padding: 0;">
                <li style="padding: 8px 0; padding-left: 25px; position: relative; color: #5C4B37;">
                    <span style="position: absolute; left: 0; top: 5px; color: #D4A574; font-size: 1.2rem;">•</span>
                    继续保持良好的饮食习惯
                </li>
                <li style="padding: 8px 0; padding-left: 25px; position: relative; color: #5C4B37;">
                    <span style="position: absolute; left: 0; top: 5px; color: #D4A574; font-size: 1.2rem;">•</span>
                    确保充足的饮水
                </li>
                <li style="padding: 8px 0; padding-left: 25px; position: relative; color: #5C4B37;">
                    <span style="position: absolute; left: 0; top: 5px; color: #D4A574; font-size: 1.2rem;">•</span>
                    定期进行健康检查
                </li>
            </ul>
        </div>
    </div>
    \;
    
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    location.reload();
}

// 全局函数
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.togglePassword = togglePassword;
window.showSection = showSection;
window.handleFileSelect = handleFileSelect;
window.analyzeImage = analyzeImage;
window.logout = logout;
