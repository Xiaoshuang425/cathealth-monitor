// PWA安装功能
let deferredPrompt;
const installButton = document.createElement('button');

// 创建安装按钮样式
installButton.innerHTML = ' 安装App';
installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #8b7355;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    display: none;
`;

document.body.appendChild(installButton);

// 监听安装提示
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // 显示安装按钮
    installButton.style.display = 'block';
    
    console.log('PWA安装可用');
});

// 安装按钮点击事件
installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('用户接受了PWA安装');
        installButton.style.display = 'none';
    } else {
        console.log('用户拒绝了PWA安装');
    }
    
    deferredPrompt = null;
});

// 监听安装完成
window.addEventListener('appinstalled', () => {
    console.log('PWA安装完成');
    installButton.style.display = 'none';
    deferredPrompt = null;
});

// 注册Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker 注册成功: ', registration.scope);
            })
            .catch(function(error) {
                console.log('ServiceWorker 注册失败: ', error);
            });
    });
}

// 检查是否已安装
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('正在以独立App模式运行');
        installButton.style.display = 'none';
    }
});
