
console.log("App JavaScript loaded successfully!");

// 全局变量
let currentUser = null;

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    // 首先检查登录状态
    checkLoginStatus();
    
    // 然后设置事件监听器
    setupEventListeners();
});

function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // 表单切换功能
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    
    if (showRegister) {
        showRegister.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Switching to register form");
            document.getElementById("login-card").classList.add("hidden");
            document.getElementById("register-card").classList.remove("hidden");
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("Switching to login form");
            document.getElementById("register-card").classList.add("hidden");
            document.getElementById("login-card").classList.remove("hidden");
        });
    }
    
    // 密码显示切换
    const loginToggle = document.getElementById("login-toggle-password");
    const registerToggle = document.getElementById("register-toggle-password");
    
    if (loginToggle) {
        loginToggle.addEventListener("click", function() {
            togglePassword("login-password", this);
        });
    }
    
    if (registerToggle) {
        registerToggle.addEventListener("click", function() {
            togglePassword("register-password", this);
        });
    }
    
    // 登录功能
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            
            console.log("Login attempt:", email);
            
            if (!email || !password) {
                alert("请填写邮箱和密码");
                return;
            }
            
            await handleLogin(email, password);
        });
    }
    
    // 注册功能
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("register-confirm-password").value;
            
            console.log("Register attempt:", name, email);
            
            if (password !== confirmPassword) {
                alert("两次输入的密码不一致！");
                return;
            }
            
            if (password.length < 6) {
                alert("密码长度至少6位！");
                return;
            }
            
            await handleRegister(name, email, password);
        });
    }
}

// 处理登录
async function handleLogin(email, password) {
    try {
        console.log("Sending login request...");
        
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Login response:", data);
        
        if (data.success) {
            console.log("Login successful, storing user data...");
            // 保存用户信息
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            currentUser = data.user;
            
            // 显示成功消息并跳转
            alert("登录成功！正在跳转到主页...");
            showDashboard(data.user);
            
        } else {
            alert("登录失败: " + (data.error || "未知错误"));
        }
        
    } catch (error) {
        console.error("Login error:", error);
        alert("网络错误，请稍后重试");
    }
}

// 处理注册
async function handleRegister(name, email, password) {
    try {
        console.log("Sending register request...");
        
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Register response:", data);
        
        if (data.success) {
            alert("注册成功！请登录您的账户");
            // 切换到登录表单
            document.getElementById("register-card").classList.add("hidden");
            document.getElementById("login-card").classList.remove("hidden");
            document.getElementById("login-email").value = email;
        } else {
            alert("注册失败: " + (data.error || "未知错误"));
        }
        
    } catch (error) {
        console.error("Register error:", error);
        alert("网络错误，请稍后重试");
    }
}

// 密码显示/隐藏功能
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// 显示用户仪表盘（主页）
function showDashboard(user) {
    console.log("Showing dashboard for user:", user);
    
    // 创建主页HTML - 侧边栏布局
    const dashboardHTML = '<div class="app-layout">' +
        '<!-- 侧边栏 -->' +
        '<aside class="sidebar">' +
            '<div class="sidebar-header">' +
                '<div class="sidebar-logo">' +
                    '<i class="fas fa-cat"></i>' +
                    '<span>CatHealth</span>' +
                '</div>' +
            '</div>' +
            '' +
            '<div class="sidebar-content">' +
                '<div class="user-profile">' +
                    '<div class="user-avatar">' +
                        '<i class="fas fa-user-circle"></i>' +
                    '</div>' +
                    '<div class="user-info">' +
                        '<div class="user-name">' + user.name + '</div>' +
                        '<div class="user-email">' + user.email + '</div>' +
                    '</div>' +
                '</div>' +
                '' +
                '<div class="sidebar-stats">' +
                    '<div class="stat-item">' +
                        '<div class="stat-icon">' +
                            '<i class="fas fa-cat"></i>' +
                        '</div>' +
                        '<div class="stat-details">' +
                            '<div class="stat-number" id="cat-count">0</div>' +
                            '<div class="stat-label">我的猫咪</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '' +
                '<nav class="sidebar-nav">' +
                    '<a href="#" class="nav-item active" onclick="showSection(\'dashboard\')">' +
                        '<i class="fas fa-home"></i>' +
                        '<span>仪表盘</span>' +
                    '</a>' +
                    '<a href="#" class="nav-item" onclick="showSection(\'analysis\')">' +
                        '<i class="fas fa-camera"></i>' +
                        '<span>健康分析</span>' +
                    '</a>' +
                    '<a href="#" class="nav-item" onclick="showSection(\'cats\')">' +
                        '<i class="fas fa-paw"></i>' +
                        '<span>猫咪管理</span>' +
                    '</a>' +
                    '<a href="#" class="nav-item" onclick="showSection(\'gps\')">' +
                        '<i class="fas fa-map-marker-alt"></i>' +
                        '<span>定位追踪</span>' +
                    '</a>' +
                    '<a href="#" class="nav-item" onclick="showSection(\'history\')">' +
                        '<i class="fas fa-history"></i>' +
                        '<span>健康历史</span>' +
                    '</a>' +
                '</nav>' +
            '</div>' +
            '' +
            '<div class="sidebar-footer">' +
                '<button class="btn-logout" onclick="logout()">' +
                    '<i class="fas fa-sign-out-alt"></i>' +
                    '<span>退出登录</span>' +
                '</button>' +
            '</div>' +
        '</aside>' +
        '' +
        '<!-- 主内容区域 -->' +
        '<main class="main-content">' +
            '<div class="content-header">' +
                '<h1>猫咪健康管理中心</h1>' +
                '<p>全方位守护您的爱宠健康</p>' +
            '</div>' +
            '' +
            '<!-- 仪表盘内容 -->' +
            '<div class="content-section active" id="dashboard-section">' +
                '<div class="welcome-card">' +
                    '<div class="welcome-content">' +
                        '<h2>欢迎回来，' + user.name + '！</h2>' +
                        '<p>开始使用 CatHealth Monitor 来关注您的猫咪健康</p>' +
                    '</div>' +
                    '<div class="welcome-image">' +
                        '<i class="fas fa-cat"></i>' +
                    '</div>' +
                '</div>' +
                '' +
                '<div class="quick-actions">' +
                    '<h3>快速开始</h3>' +
                    '<div class="actions-grid">' +
                        '<div class="action-card" onclick="showSection(\'analysis\')">' +
                            '<div class="action-icon">' +
                                '<i class="fas fa-camera"></i>' +
                            '</div>' +
                            '<h4>健康分析</h4>' +
                            '<p>上传排泄物照片进行AI分析</p>' +
                        '</div>' +
                        '' +
                        '<div class="action-card" onclick="showSection(\'cats\')">' +
                            '<div class="action-icon">' +
                                '<i class="fas fa-paw"></i>' +
                            '</div>' +
                            '<h4>添加猫咪</h4>' +
                            '<p>为您的爱宠创建健康档案</p>' +
                        '</div>' +
                        '' +
                        '<div class="action-card" onclick="showSection(\'gps\')">' +
                            '<div class="action-icon">' +
                                '<i class="fas fa-map-marker-alt"></i>' +
                            '</div>' +
                            '<h4>定位设置</h4>' +
                            '<p>设置猫咪的安全活动区域</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '' +
                '<div class="recent-activity">' +
                    '<h3>最近活动</h3>' +
                    '<div class="activity-list">' +
                        '<div class="activity-item">' +
                            '<div class="activity-icon">' +
                                '<i class="fas fa-plus-circle"></i>' +
                            '</div>' +
                            '<div class="activity-content">' +
                                '<p>欢迎使用 CatHealth Monitor</p>' +
                                '<span class="activity-time">刚刚</span>' +
                            '</div>' +
                        '</div>' +
                        '<div class="activity-empty">' +
                            '<i class="fas fa-clipboard-list"></i>' +
                            '<p>暂无其他活动记录</p>' +
                            '<p class="activity-hint">开始使用功能后，这里会显示您的活动记录</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '' +
            '<!-- 其他内容区域（默认隐藏） -->' +
            '<div class="content-section" id="analysis-section">' +
                '<div class="section-placeholder">' +
                    '<i class="fas fa-camera"></i>' +
                    '<h2>健康分析</h2>' +
                    '<p>功能开发中...</p>' +
                '</div>' +
            '</div>' +
            '' +
            '<div class="content-section" id="cats-section">' +
                '<div class="section-placeholder">' +
                    '<i class="fas fa-paw"></i>' +
                    '<h2>猫咪管理</h2>' +
                    '<p>功能开发中...</p>' +
                '</div>' +
            '</div>' +
            '' +
            '<div class="content-section" id="gps-section">' +
                '<div class="section-placeholder">' +
                    '<i class="fas fa-map-marker-alt"></i>' +
                    '<h2>定位追踪</h2>' +
                    '<p>功能开发中...</p>' +
                '</div>' +
            '</div>' +
            '' +
            '<div class="content-section" id="history-section">' +
                '<div class="section-placeholder">' +
                    '<i class="fas fa-history"></i>' +
                    '<h2>健康历史</h2>' +
                    '<p>功能开发中...</p>' +
                '</div>' +
            '</div>' +
        '</main>' +
    '</div>' +
    '' +
    '<style>' +
        ':root {' +
            '--primary: #D4A574;' +
            '--primary-light: #E8D0B3;' +
            '--secondary: #A8C8B8;' +
            '--light: #F8F4E9;' +
            '--light-bg: #FDF8F0;' +
            '--dark: #5C4B37;' +
            '--gray: #8A7E6F;' +
            '--sidebar-width: 280px;' +
        '}' +
        '' +
        '* {' +
            'margin: 0;' +
            'padding: 0;' +
            'box-sizing: border-box;' +
        '}' +
        '' +
        'body {' +
            'font-family: "Microsoft YaHei", "Segoe UI", sans-serif;' +
            'background: var(--light-bg);' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.app-layout {' +
            'display: flex;' +
            'min-height: 100vh;' +
        '}' +
        '' +
        '/* 侧边栏样式 */' +
        '.sidebar {' +
            'width: var(--sidebar-width);' +
            'background: var(--light);' +
            'border-right: 1px solid var(--primary-light);' +
            'display: flex;' +
            'flex-direction: column;' +
        '}' +
        '' +
        '.sidebar-header {' +
            'padding: 25px 20px;' +
            'border-bottom: 1px solid var(--primary-light);' +
        '}' +
        '' +
        '.sidebar-logo {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
            'font-size: 1.4rem;' +
            'font-weight: 700;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.sidebar-logo i {' +
            'font-size: 1.6rem;' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.sidebar-content {' +
            'flex: 1;' +
            'padding: 20px;' +
        '}' +
        '' +
        '.user-profile {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 12px;' +
            'padding: 15px;' +
            'background: white;' +
            'border-radius: 10px;' +
            'border: 1px solid var(--primary-light);' +
            'margin-bottom: 25px;' +
        '}' +
        '' +
        '.user-avatar i {' +
            'font-size: 2.5rem;' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.user-name {' +
            'font-weight: 600;' +
            'font-size: 1rem;' +
        '}' +
        '' +
        '.user-email {' +
            'font-size: 0.85rem;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.sidebar-stats {' +
            'margin-bottom: 25px;' +
        '}' +
        '' +
        '.stat-item {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 15px;' +
            'padding: 15px;' +
            'background: white;' +
            'border-radius: 10px;' +
            'border: 1px solid var(--primary-light);' +
        '}' +
        '' +
        '.stat-icon {' +
            'width: 45px;' +
            'height: 45px;' +
            'border-radius: 50%;' +
            'background: var(--primary-light);' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
        '}' +
        '' +
        '.stat-icon i {' +
            'font-size: 1.3rem;' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.stat-number {' +
            'font-size: 1.5rem;' +
            'font-weight: 700;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.stat-label {' +
            'font-size: 0.9rem;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.sidebar-nav {' +
            'display: flex;' +
            'flex-direction: column;' +
            'gap: 5px;' +
        '}' +
        '' +
        '.nav-item {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 12px;' +
            'padding: 15px;' +
            'text-decoration: none;' +
            'color: var(--dark);' +
            'border-radius: 8px;' +
            'transition: all 0.2s;' +
        '}' +
        '' +
        '.nav-item:hover {' +
            'background: var(--primary-light);' +
        '}' +
        '' +
        '.nav-item.active {' +
            'background: var(--primary);' +
            'color: var(--dark);' +
            'font-weight: 600;' +
        '}' +
        '' +
        '.nav-item i {' +
            'width: 20px;' +
            'text-align: center;' +
        '}' +
        '' +
        '.sidebar-footer {' +
            'padding: 20px;' +
            'border-top: 1px solid var(--primary-light);' +
        '}' +
        '' +
        '.btn-logout {' +
            'width: 100%;' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
            'padding: 12px;' +
            'background: var(--secondary);' +
            'color: white;' +
            'border: none;' +
            'border-radius: 6px;' +
            'cursor: pointer;' +
            'font-size: 0.95rem;' +
            'transition: background 0.2s;' +
        '}' +
        '' +
        '.btn-logout:hover {' +
            'background: #8DB596;' +
        '}' +
        '' +
        '/* 主内容区域样式 */' +
        '.main-content {' +
            'flex: 1;' +
            'padding: 30px;' +
            'overflow-y: auto;' +
        '}' +
        '' +
        '.content-header {' +
            'margin-bottom: 30px;' +
        '}' +
        '' +
        '.content-header h1 {' +
            'font-size: 2rem;' +
            'margin-bottom: 8px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.content-header p {' +
            'color: var(--gray);' +
            'font-size: 1.1rem;' +
        '}' +
        '' +
        '.content-section {' +
            'display: none;' +
        '}' +
        '' +
        '.content-section.active {' +
            'display: block;' +
        '}' +
        '' +
        '.welcome-card {' +
            'background: var(--light);' +
            'border: 1px solid var(--primary-light);' +
            'border-radius: 15px;' +
            'padding: 30px;' +
            'display: flex;' +
            'justify-content: space-between;' +
            'align-items: center;' +
            'margin-bottom: 30px;' +
        '}' +
        '' +
        '.welcome-content h2 {' +
            'font-size: 1.5rem;' +
            'margin-bottom: 10px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.welcome-content p {' +
            'color: var(--gray);' +
            'font-size: 1rem;' +
        '}' +
        '' +
        '.welcome-image i {' +
            'font-size: 4rem;' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.quick-actions {' +
            'margin-bottom: 30px;' +
        '}' +
        '' +
        '.quick-actions h3 {' +
            'font-size: 1.3rem;' +
            'margin-bottom: 20px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.actions-grid {' +
            'display: grid;' +
            'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));' +
            'gap: 20px;' +
        '}' +
        '' +
        '.action-card {' +
            'background: var(--light);' +
            'border: 1px solid var(--primary-light);' +
            'border-radius: 12px;' +
            'padding: 25px;' +
            'text-align: center;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
        '}' +
        '' +
        '.action-card:hover {' +
            'transform: translateY(-3px);' +
            'box-shadow: 0 5px 15px rgba(0,0,0,0.1);' +
        '}' +
        '' +
        '.action-icon {' +
            'width: 60px;' +
            'height: 60px;' +
            'border-radius: 50%;' +
            'background: var(--primary);' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
            'margin: 0 auto 15px;' +
        '}' +
        '' +
        '.action-icon i {' +
            'font-size: 1.5rem;' +
            'color: white;' +
        '}' +
        '' +
        '.action-card h4 {' +
            'color: var(--dark);' +
            'margin-bottom: 10px;' +
            'font-size: 1.1rem;' +
        '}' +
        '' +
        '.action-card p {' +
            'color: var(--gray);' +
            'font-size: 0.9rem;' +
            'line-height: 1.4;' +
        '}' +
        '' +
        '.recent-activity {' +
            'margin-bottom: 30px;' +
        '}' +
        '' +
        '.recent-activity h3 {' +
            'font-size: 1.3rem;' +
            'margin-bottom: 20px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.activity-list {' +
            'background: var(--light);' +
            'border: 1px solid var(--primary-light);' +
            'border-radius: 12px;' +
            'padding: 20px;' +
        '}' +
        '' +
        '.activity-item {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 15px;' +
            'padding: 15px;' +
            'background: white;' +
            'border-radius: 8px;' +
            'border: 1px solid var(--primary-light);' +
            'margin-bottom: 10px;' +
        '}' +
        '' +
        '.activity-icon {' +
            'width: 40px;' +
            'height: 40px;' +
            'border-radius: 50%;' +
            'background: var(--primary-light);' +
            'display: flex;' +
            'align-items: center;' +
            'justify-content: center;' +
        '}' +
        '' +
        '.activity-icon i {' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.activity-content {' +
            'flex: 1;' +
        '}' +
        '' +
        '.activity-content p {' +
            'color: var(--dark);' +
            'margin-bottom: 5px;' +
        '}' +
        '' +
        '.activity-time {' +
            'font-size: 0.85rem;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.activity-empty {' +
            'text-align: center;' +
            'padding: 40px 20px;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.activity-empty i {' +
            'font-size: 3rem;' +
            'margin-bottom: 15px;' +
            'color: var(--primary-light);' +
        '}' +
        '' +
        '.activity-hint {' +
            'font-size: 0.9rem;' +
            'margin-top: 10px;' +
        '}' +
        '' +
        '.section-placeholder {' +
            'text-align: center;' +
            'padding: 60px 20px;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.section-placeholder i {' +
            'font-size: 4rem;' +
            'margin-bottom: 20px;' +
            'color: var(--primary-light);' +
        '}' +
        '' +
        '.section-placeholder h2 {' +
            'font-size: 1.8rem;' +
            'margin-bottom: 15px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '/* 响应式设计 */' +
        '@media (max-width: 768px) {' +
            '.app-layout {' +
                'flex-direction: column;' +
            '}' +
            '' +
            '.sidebar {' +
                'width: 100%;' +
                'height: auto;' +
            '}' +
            '' +
            '.sidebar-content {' +
                'display: flex;' +
                'flex-wrap: wrap;' +
                'gap: 15px;' +
            '}' +
            '' +
            '.user-profile {' +
                'flex: 1;' +
                'min-width: 200px;' +
            '}' +
            '' +
            '.sidebar-stats {' +
                'flex: 1;' +
                'min-width: 200px;' +
                'margin-bottom: 0;' +
            '}' +
            '' +
            '.sidebar-nav {' +
                'flex-direction: row;' +
                'flex-wrap: wrap;' +
                'width: 100%;' +
            '}' +
            '' +
            '.nav-item {' +
                'flex: 1;' +
                'min-width: 120px;' +
                'justify-content: center;' +
                'text-align: center;' +
            '}' +
            '' +
            '.actions-grid {' +
                'grid-template-columns: 1fr;' +
            '}' +
        '}' +
    '</style>';
    
    // 替换整个页面内容
    document.body.innerHTML = dashboardHTML;
    console.log("Dashboard displayed successfully");
}

// 显示不同内容区域
function showSection(sectionId) {
    // 隐藏所有内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示选中的内容区域
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        // 如果是健康分析，显示自定义页面
        if (sectionId === 'analysis') {
            showHealthAnalysis();
        }
    }
    
    // 更新导航激活状态
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

// 退出登录
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    currentUser = null;
    location.reload();
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    console.log("Checking login status...");
    console.log("Token exists:", !!token);
    console.log("User data exists:", !!userData);
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            console.log("User found:", user);
            currentUser = user;
            showDashboard(user);
        } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    } else {
        console.log("No user logged in, showing login form");
    }
}

// 健康分析页面显示函数
function showHealthAnalysis() {
    const mainContent = document.querySelector('.main-content');
    
    mainContent.innerHTML = '<div class="content-header">' +
        '<h1>健康分析</h1>' +
        '<p>上传猫咪排泄物照片，获取AI健康分析报告</p>' +
    '</div>' +
    '' +
    '<div class="health-analysis-container">' +
        '<!-- 上传区域 -->' +
        '<div class="upload-section">' +
            '<div class="upload-card">' +
                '<h3>上传图片</h3>' +
                '<p class="section-description">请上传清晰的猫咪排泄物照片进行分析</p>' +
                '' +
                '<div class="upload-area" id="upload-area">' +
                    '<div class="upload-content" id="upload-content">' +
                        '<i class="fas fa-cloud-upload-alt"></i>' +
                        '<p>点击或拖拽图片到这里</p>' +
                        '<span class="upload-hint">支持 JPG、PNG 格式，最大 5MB</span>' +
                    '</div>' +
                    '<input type="file" id="file-input" accept="image/*" style="display: none;">' +
                '</div>' +
                '' +
                '<div class="analyze-section hidden" id="analyze-section">' +
                    '<button class="btn-primary analyze-btn" id="analyze-btn">' +
                        '<i class="fas fa-search"></i> 开始分析' +
                    '</button>' +
                    '<button class="btn-secondary" onclick="healthAnalysis.resetUpload()">' +
                        '<i class="fas fa-redo"></i> 重新选择' +
                    '</button>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '' +
        '<!-- 分析结果区域 -->' +
        '<div class="result-section hidden" id="result-section">' +
            '<div class="result-card">' +
                '<h3>分析报告</h3>' +
                '<div id="result-content"></div>' +
            '</div>' +
        '</div>' +
        '' +
        '<!-- 历史记录区域 -->' +
        '<div class="history-section">' +
            '<div class="history-card">' +
                '<div class="section-header">' +
                    '<h3>分析历史</h3>' +
                    '<button class="btn-text" onclick="healthAnalysis.loadAnalysisHistory()">' +
                        '<i class="fas fa-sync-alt"></i> 刷新' +
                    '</button>' +
                '</div>' +
                '<div class="history-list" id="history-list"></div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '' +
    '<style>' +
        '.health-analysis-container {' +
            'max-width: 1000px;' +
            'margin: 0 auto;' +
        '}' +
        '' +
        '.upload-card, .result-card, .history-card {' +
            'background: var(--light);' +
            'border: 1px solid var(--primary-light);' +
            'border-radius: 15px;' +
            'padding: 30px;' +
            'margin-bottom: 30px;' +
        '}' +
        '' +
        '.section-description {' +
            'color: var(--gray);' +
            'margin-bottom: 25px;' +
            'font-size: 0.95rem;' +
        '}' +
        '' +
        '.upload-area {' +
            'border: 2px dashed var(--primary);' +
            'border-radius: 12px;' +
            'padding: 50px 20px;' +
            'text-align: center;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
            'background: rgba(212, 165, 116, 0.05);' +
        '}' +
        '' +
        '.upload-area:hover {' +
            'background: rgba(212, 165, 116, 0.1);' +
        '}' +
        '' +
        '.upload-area.drag-over {' +
            'background: rgba(212, 165, 116, 0.2);' +
            'border-color: var(--secondary);' +
        '}' +
        '' +
        '.upload-area.has-image {' +
            'padding: 20px;' +
            'border-style: solid;' +
        '}' +
        '' +
        '.upload-area i {' +
            'font-size: 3rem;' +
            'color: var(--primary);' +
            'margin-bottom: 15px;' +
        '}' +
        '' +
        '.upload-area p {' +
            'font-size: 1.1rem;' +
            'color: var(--dark);' +
            'margin-bottom: 10px;' +
        '}' +
        '' +
        '.upload-hint {' +
            'font-size: 0.9rem;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.selected-image {' +
            'text-align: center;' +
        '}' +
        '' +
        '.selected-image img {' +
            'max-width: 300px;' +
            'max-height: 200px;' +
            'border-radius: 8px;' +
            'margin-bottom: 15px;' +
        '}' +
        '' +
        '.image-info p {' +
            'margin: 5px 0;' +
            'font-size: 0.9rem;' +
        '}' +
        '' +
        '.analyze-section {' +
            'text-align: center;' +
            'margin-top: 25px;' +
            'display: flex;' +
            'gap: 15px;' +
            'justify-content: center;' +
        '}' +
        '' +
        '.analyze-btn {' +
            'padding: 12px 30px;' +
            'font-size: 1.1rem;' +
        '}' +
        '' +
        '/* 分析结果样式 */' +
        '.result-card.status-healthy {' +
            'border-left: 4px solid #4CAF50;' +
        '}' +
        '' +
        '.result-card.status-warning {' +
            'border-left: 4px solid #FF9800;' +
        '}' +
        '' +
        '.result-card.status-critical {' +
            'border-left: 4px solid #F44336;' +
        '}' +
        '' +
        '.result-card.status-unknown {' +
            'border-left: 4px solid #9E9E9E;' +
        '}' +
        '' +
        '.result-header {' +
            'display: flex;' +
            'justify-content: space-between;' +
            'align-items: center;' +
            'margin-bottom: 25px;' +
            'padding-bottom: 15px;' +
            'border-bottom: 1px solid var(--primary-light);' +
        '}' +
        '' +
        '.status-indicator {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 10px;' +
        '}' +
        '' +
        '.status-indicator i {' +
            'font-size: 1.5rem;' +
        '}' +
        '' +
        '.status-healthy .status-indicator i { color: #4CAF50; }' +
        '.status-warning .status-indicator i { color: #FF9800; }' +
        '.status-critical .status-indicator i { color: #F44336; }' +
        '.status-unknown .status-indicator i { color: #9E9E9E; }' +
        '' +
        '.health-status {' +
            'padding: 8px 16px;' +
            'border-radius: 20px;' +
            'font-weight: 600;' +
            'font-size: 0.9rem;' +
        '}' +
        '' +
        '.status-healthy .health-status { background: #E8F5E8; color: #2E7D32; }' +
        '.status-warning .health-status { background: #FFF3E0; color: #EF6C00; }' +
        '.status-critical .health-status { background: #FFEBEE; color: #C62828; }' +
        '.status-unknown .health-status { background: #F5F5F5; color: #616161; }' +
        '' +
        '.result-details {' +
            'margin-bottom: 25px;' +
        '}' +
        '' +
        '.detail-item {' +
            'display: flex;' +
            'justify-content: space-between;' +
            'align-items: center;' +
            'padding: 12px 0;' +
            'border-bottom: 1px solid rgba(0,0,0,0.05);' +
        '}' +
        '' +
        '.detail-item label {' +
            'font-weight: 600;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.score {' +
            'font-size: 1.2rem;' +
            'font-weight: 700;' +
            'color: var(--primary);' +
        '}' +
        '' +
        '.confidence-level {' +
            'margin-bottom: 25px;' +
        '}' +
        '' +
        '.confidence-bar {' +
            'width: 100%;' +
            'height: 8px;' +
            'background: #E0E0E0;' +
            'border-radius: 4px;' +
            'margin: 8px 0;' +
            'overflow: hidden;' +
        '}' +
        '' +
        '.confidence-fill {' +
            'height: 100%;' +
            'background: linear-gradient(90deg, var(--primary), var(--secondary));' +
            'border-radius: 4px;' +
            'transition: width 0.3s ease;' +
        '}' +
        '' +
        '.confidence-value {' +
            'font-weight: 600;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.recommendations h4 {' +
            'margin-bottom: 15px;' +
            'color: var(--dark);' +
        '}' +
        '' +
        '.recommendations ul {' +
            'list-style: none;' +
            'padding: 0;' +
        '}' +
        '' +
        '.recommendations li {' +
            'padding: 8px 0;' +
            'padding-left: 25px;' +
            'position: relative;' +
        '}' +
        '' +
        '.recommendations li:before {' +
            'content: "•";' +
            'color: var(--primary);' +
            'font-size: 1.2rem;' +
            'position: absolute;' +
            'left: 0;' +
            'top: 5px;' +
        '}' +
        '' +
        '.result-actions {' +
            'display: flex;' +
            'gap: 15px;' +
            'margin-top: 25px;' +
        '}' +
        '' +
        '/* 历史记录样式 */' +
        '.section-header {' +
            'display: flex;' +
            'justify-content: space-between;' +
            'align-items: center;' +
            'margin-bottom: 20px;' +
        '}' +
        '' +
        '.history-list {' +
            'display: grid;' +
            'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));' +
            'gap: 15px;' +
        '}' +
        '' +
        '.history-item {' +
            'background: white;' +
            'border: 1px solid var(--primary-light);' +
            'border-radius: 10px;' +
            'padding: 15px;' +
            'cursor: pointer;' +
            'transition: all 0.3s ease;' +
        '}' +
        '' +
        '.history-item:hover {' +
            'transform: translateY(-2px);' +
            'box-shadow: 0 4px 12px rgba(0,0,0,0.1);' +
        '}' +
        '' +
        '.history-image img {' +
            'width: 100%;' +
            'height: 120px;' +
            'object-fit: cover;' +
            'border-radius: 6px;' +
            'margin-bottom: 10px;' +
        '}' +
        '' +
        '.history-status {' +
            'display: flex;' +
            'align-items: center;' +
            'gap: 5px;' +
            'font-size: 0.8rem;' +
            'margin-bottom: 5px;' +
        '}' +
        '' +
        '.history-score {' +
            'font-size: 0.9rem;' +
            'color: var(--gray);' +
            'margin-bottom: 5px;' +
        '}' +
        '' +
        '.history-time {' +
            'font-size: 0.75rem;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.empty-history {' +
            'text-align: center;' +
            'padding: 40px 20px;' +
            'color: var(--gray);' +
        '}' +
        '' +
        '.empty-history i {' +
            'font-size: 3rem;' +
            'margin-bottom: 15px;' +
            'color: var(--primary-light);' +
        '}' +
        '' +
        '.hint {' +
            'font-size: 0.9rem;' +
            'margin-top: 10px;' +
        '}' +
        '' +
        '.btn-text {' +
            'background: none;' +
            'border: none;' +
            'color: var(--primary);' +
            'cursor: pointer;' +
            'padding: 8px 12px;' +
            'border-radius: 6px;' +
            'transition: background 0.2s;' +
        '}' +
        '' +
        '.btn-text:hover {' +
            'background: rgba(212, 165, 116, 0.1);' +
        '}' +
        '' +
        '.hidden {' +
            'display: none !important;' +
        '}' +
        '' +
        '/* 响应式设计 */' +
        '@media (max-width: 768px) {' +
            '.health-analysis-container {' +
                'padding: 0 10px;' +
            '}' +
            '' +
            '.upload-card, .result-card, .history-card {' +
                'padding: 20px;' +
            '}' +
            '' +
            '.upload-area {' +
                'padding: 30px 15px;' +
            '}' +
            '' +
            '.analyze-section {' +
                'flex-direction: column;' +
            '}' +
            '' +
            '.result-actions {' +
                'flex-direction: column;' +
            '}' +
            '' +
            '.history-list {' +
                'grid-template-columns: 1fr;' +
            '}' +
        '}' +
    '</style>';

    // 加载健康分析脚本
    const script = document.createElement('script');
    script.src = '/js/health-analysis.js';
    document.head.appendChild(script);
}

// 全局函数
window.showDashboard = showDashboard;
window.logout = logout;
window.togglePassword = togglePassword;
window.showSection = showSection;
window.showHealthAnalysis = showHealthAnalysis;
