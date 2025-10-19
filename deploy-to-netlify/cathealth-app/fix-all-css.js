const fs = require('fs');
const path = require('path');

console.log('🔧 统一CSS路径...');

function fixAllHTMLFiles() {
    const htmlFiles = [
        'dashboard.html',
        'health-analysis.html', 
        'index.html',
        'login.html'
    ];

    htmlFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log('处理:', file);
            let content = fs.readFileSync(file, 'utf8');
            
            // 统一CSS路径为绝对路径
            content = content.replace(
                /href="(?!https?:\/\/)([^"]*\.css)"/g,
                'href="/"'
            );
            
            fs.writeFileSync(file, content, 'utf8');
            console.log('✅ 已修复:', file);
        } else {
            console.log('❌ 文件不存在:', file);
        }
    });
}

fixAllHTMLFiles();
console.log('🎉 CSS路径统一完成！');
