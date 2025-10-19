// CatHealth Monitor 前端JavaScript
console.log("CatHealth Monitor 前端加载完成");

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM 加载完成，初始化事件监听器");
    
    // 检查所有必要的DOM元素
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    
    console.log("登录表单:", !!loginForm);
    console.log("注册表单:", !!registerForm);
    console.log("切换链接:", !!showRegister, !!showLogin);
    
    // 表单切换功能
    if (showRegister) {
        showRegister.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("切换到注册表单");
            document.getElementById("login-card").classList.add("hidden");
            document.getElementById("register-card").classList.remove("hidden");
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("切换到登录表单");
            document.getElementById("register-card").classList.add("hidden");
            document.getElementById("login-card").classList.remove("hidden");
        });
    }
    
    // 登录功能
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("登录表单提交");
            
            const email = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            
            if (!email || !password) {
                alert("请填写邮箱和密码");
                return;
            }
            
            await loginUser(email, password);
        });
    }
    
    // 注册功能
    if (registerForm) {
        registerForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("注册表单提交");
            
            const name = document.getElementById("register-username").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            const confirmPassword = document.getElementById("register-confirm-password").value;
            
            if (password !== confirmPassword) {
                alert("两次输入的密码不一致！");
                return;
            }
            
            if (password.length < 6) {
                alert("密码长度至少6位！");
                return;
            }
            
            await registerUser(name, email, password);
        });
    }
    
    // 检查登录状态
    checkLoginStatus();
});

// 登录用户
async function loginUser(email, password) {
    try {
        console.log("发送登录请求:", email);
        
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
        
        console.log("响应状态:", response.status);
        const data = await response.json();
        console.log("登录响应:", data);
        
        if (data.success) {
            console.log("登录成功，存储用户数据");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            alert("登录成功！");
            window.location.href = "/dashboard.html";
        } else {
            alert("登录失败: " + (data.error || "未知错误"));
        }
        
    } catch (error) {
        console.error("登录错误:", error);
        alert("网络错误，请稍后重试");
    }
}

// 注册用户
async function registerUser(name, email, password) {
    try {
        console.log("发送注册请求:", name, email);
        
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
        
        console.log("响应状态:", response.status);
        const data = await response.json();
        console.log("注册响应:", data);
        
        if (data.success) {
            alert("注册成功！请登录");
            // 切换到登录表单
            document.getElementById("register-card").classList.add("hidden");
            document.getElementById("login-card").classList.remove("hidden");
            // 填充邮箱
            document.getElementById("username").value = email;
        } else {
            alert("注册失败: " + (data.error || "未知错误"));
        }
        
    } catch (error) {
        console.error("注册错误:", error);
        alert("网络错误，请稍后重试");
    }
}

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    console.log("检查登录状态...");
    console.log("Token存在:", !!token);
    console.log("用户数据存在:", !!userData);
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            console.log("用户已登录:", user);
            // 如果已经在登录页面，自动跳转到仪表盘
            if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
                window.location.href = "/dashboard.html";
            }
        } catch (error) {
            console.error("解析用户数据错误:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    }
}

// 文件转base64（用于图片上传）
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 全局函数
window.loginUser = loginUser;
window.registerUser = registerUser;
window.fileToBase64 = fileToBase64;
window.checkLoginStatus = checkLoginStatus;
