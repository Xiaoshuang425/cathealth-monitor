// CatHealth Monitor 前端JavaScript - 调试版本
console.log("CatHealth Monitor 前端加载完成 - 调试版本");

// 调试函数：显示所有ID
function debugAllIds() {
    console.log("=== 所有ID调试 ===");
    const allElements = document.querySelectorAll('[id]');
    console.log("有ID的元素数量:", allElements.length);
    
    allElements.forEach(element => {
        console.log(`ID: "${element.id}", 标签: <${element.tagName.toLowerCase()}>`);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM 加载完成");
    
    // 运行调试
    debugAllIds();
    
    // 特别检查登录相关元素
    console.log("=== 登录相关元素检查 ===");
    const loginIds = ['login-form', 'login-email', 'login-password', 'username', 'password'];
    loginIds.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? " 找到" : " 未找到");
    });
    
    // 登录功能（带备用方案）
    const loginForm = document.getElementById("login-form") || 
                     document.querySelector('form');
    
    if (loginForm) {
        console.log("找到表单，绑定提交事件");
        loginForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            console.log("表单提交事件触发");
            
            // 尝试多种方式获取邮箱和密码
            let email, password;
            
            // 方式1：通过ID
            email = document.getElementById("login-email")?.value;
            password = document.getElementById("login-password")?.value;
            
            // 方式2：通过类型
            if (!email || !password) {
                const emailInputs = document.querySelectorAll('input[type="email"]');
                const passwordInputs = document.querySelectorAll('input[type="password"]');
                if (emailInputs.length > 0) email = emailInputs[0].value;
                if (passwordInputs.length > 0) password = passwordInputs[0].value;
            }
            
            // 方式3：通过placeholder
            if (!email || !password) {
                const allInputs = document.querySelectorAll('input');
                allInputs.forEach(input => {
                    if (input.placeholder?.includes('邮箱') || input.placeholder?.includes('email')) {
                        email = input.value;
                    }
                    if (input.placeholder?.includes('密码') || input.placeholder?.includes('password')) {
                        password = input.value;
                    }
                });
            }
            
            console.log("最终获取的值:", { email, password });
            
            if (!email || !password) {
                alert("请填写邮箱和密码");
                return;
            }
            
            await loginUser(email, password);
        });
    } else {
        console.error(" 找不到任何表单");
    }
    
    // 其他功能保持不变...
    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    
    if (showRegister) {
        showRegister.addEventListener("click", function(e) {
            e.preventDefault();
            document.getElementById("login-card").classList.add("hidden");
            document.getElementById("register-card").classList.remove("hidden");
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener("click", function(e) {
            e.preventDefault();
            document.getElementById("register-card").classList.add("hidden");
            document.getElementById("login-card").classList.remove("hidden");
        });
    }
    
    checkLoginStatus();
});

// 其他函数保持不变...
// 模拟登录函数 - 用于静态网站
async function loginUser(email, password) {
    console.log("模拟登录:", email);
    
    // 模拟用户数据库
    const users = [
        { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
        { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" },
        { email: "test@test.com", password: "123456", name: "测试用户2" }
    ];
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        return {
            success: true,
            message: "登录成功",
            token: "static-token-" + Date.now(),
            user: {
                name: user.name,
                email: user.email
            }
        };
    } else {
        throw new Error("邮箱或密码错误");
    }
},
            body: JSON.stringify({ email: email, password: password })
        });
        
        const data = await response.json();
        console.log("登录响应:", data);
        
        if (data.success) {
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

// 注册和其他函数...
async function registerUser(name, email, password) {
    // 简化版本...
}

function checkLoginStatus() {
    // 简化版本...
}

console.log(" 调试版本JavaScript加载完成");


