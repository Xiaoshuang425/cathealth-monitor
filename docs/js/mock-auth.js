// 静态网站模拟登录
async function loginUser(email, password) {
    console.log("模拟登录:", email);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = [
        { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
        { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" },
        { email: "test@test.com", password: "123456", name: "测试用户2" }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("authToken", "mock-token-" + Date.now());
        return { 
            success: true, 
            message: "登录成功",
            user: {
                name: user.name,
                email: user.email
            }
        };
    }
    throw new Error("邮箱或密码错误");
}

async function registerUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        success: true,
        message: "注册成功（模拟）"
    };
}
