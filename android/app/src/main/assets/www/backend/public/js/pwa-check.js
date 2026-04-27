// PWA功能检查
function checkPWAFeatures() {
    const features = {
        'serviceWorker': 'serviceWorker' in navigator,
        'installPrompt': 'beforeinstallprompt' in window,
        'standalone': window.matchMedia('(display-mode: standalone)').matches,
        'manifest': !!document.querySelector('link[rel="manifest"]'),
        'icons': {
            'icon-192x192': document.querySelector('link[rel="icon"]'),
            'apple-touch-icon': document.querySelector('link[rel="apple-touch-icon"]')
        }
    };
    
    console.log('PWA功能检查:', features);
    return features;
}

// 在控制台检查PWA状态
console.log(' CatHealth PWA状态:');
console.log('Service Worker支持:', 'serviceWorker' in navigator);
console.log('安装提示支持:', 'beforeinstallprompt' in window);
console.log('当前显示模式:', window.matchMedia('(display-mode: standalone)').matches ? '独立App' : '浏览器');
console.log('Manifest链接:', !!document.querySelector('link[rel="manifest"]'));

// 页面加载完成后检查
document.addEventListener('DOMContentLoaded', checkPWAFeatures);
