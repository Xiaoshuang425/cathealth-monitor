// check-deployment.js
// 在浏览器中运行这个来检查 CSS 加载问题

console.log(' 检查 CSS 加载问题...');

// 检查所有 CSS 链接
const links = document.querySelectorAll('link[rel="stylesheet"]');
console.log('找到的 CSS 链接:', links.length);

links.forEach((link, index) => {
    const href = link.href;
    console.log(\CSS \: \\);
    
    // 检查是否加载成功
    const sheet = link.sheet;
    if (sheet) {
        console.log('   加载成功');
    } else {
        console.log('   加载失败');
        
        // 尝试修复路径
        const fixedHref = href.replace('/Xiaoshuang425/cathealth-monitor/', '/cathealth-monitor/');
        console.log('  尝试修复路径:', fixedHref);
    }
});

// 检查控制台错误
window.addEventListener('error', (e) => {
    console.log(' 页面错误:', e.message);
});
