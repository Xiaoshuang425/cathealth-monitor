// 快速测试你的网站
console.log("测试 CatHealth 网站...");

// 测试健康检查
fetch("/api/health")
    .then(response => response.json())
    .then(data => console.log("健康检查:", data))
    .catch(error => console.log("健康检查失败:", error));

// 测试页面元素
console.log("页面元素检查:");
console.log("登录表单:", document.getElementById("loginForm"));
console.log("邮箱输入:", document.getElementById("email"));
console.log("密码输入:", document.getElementById("password"));
