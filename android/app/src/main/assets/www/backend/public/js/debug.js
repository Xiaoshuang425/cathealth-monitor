// 调试工具 - 找出正确的表单ID
function findFormElements() {
    console.log("=== 表单元素调试 ===");
    
    // 查找所有表单
    const forms = document.querySelectorAll('form');
    console.log("找到的表单:", forms.length);
    
    forms.forEach((form, index) => {
        console.log(\表单 \:\, {
            id: form.id,
            action: form.action,
            method: form.method
        });
        
        // 查找表单内的所有输入框
        const inputs = form.querySelectorAll('input');
        console.log(\  表单 \ 的输入框:\, inputs.length);
        
        inputs.forEach((input, inputIndex) => {
            console.log(\    输入框 \:\, {
                id: input.id,
                type: input.type,
                name: input.name,
                placeholder: input.placeholder,
                value: input.value
            });
        });
    });
    
    // 特别查找邮箱和密码输入框
    console.log("=== 特别查找 ===");
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    
    console.log("邮箱输入框:", emailInputs.length);
    emailInputs.forEach((input, index) => {
        console.log(\  邮箱 \: id=\"\\", placeholder=\"\\"\);
    });
    
    console.log("密码输入框:", passwordInputs.length);
    passwordInputs.forEach((input, index) => {
        console.log(\  密码 \: id=\"\\", placeholder=\"\\"\);
    });
}

// 页面加载后自动运行调试
document.addEventListener('DOMContentLoaded', findFormElements);

// 全局函数，可在控制台调用
window.findFormElements = findFormElements;
