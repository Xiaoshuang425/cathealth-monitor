// 模拟登录函数 - 用于 GitHub Pages 静态部署
const mockUsers = [
    { email: "jiaminpan4@gmail.com", password: "091103ka", name: "凌霜大王" },
    { email: "jiaminpan@gmail.com", password: "123456", name: "测试用户" },
    { email: "test@test.com", password: "123456", name: "测试用户2" }
];

// 重写 loginUser 函数
async function loginUser(email, password) {
    console.log("模拟登录:", email);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        // 保存用户信息到 localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("authToken", "mock-token-" + Date.now());
        
        return {
            success: true,
            message: "登录成功！",
            user: {
                name: user.name,
                email: user.email
            }
        };
    } else {
        throw new Error("邮箱或密码错误");
    }
}

// 模拟注册函数
async function registerUser(userData) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
        success: true,
        message: "注册成功（模拟）"
    };
}

console.log("模拟认证系统已加载");
