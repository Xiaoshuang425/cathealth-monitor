// 模拟登录函数
async function loginUser(email, password) {
    console.log("模拟登录:", email);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = [
        { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
        { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        return { 
            success: true, 
            message: "登录成功",
            user: { name: user.name, email: user.email }
        };
    }
    throw new Error("邮箱或密码错误");
}

// PWA 安装提示（简化版）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(registration => console.log('SW registered'))
        .catch(error => console.log('SW registration failed'));
}
