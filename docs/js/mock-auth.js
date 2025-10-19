// 静态网站模拟登录
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
        return { success: true, user: user };
    }
    throw new Error("登录失败");
}
