// deployment-check.js
const fs = require('fs');
const path = require('path');

console.log(' 部署前检查...');

const requiredFiles = [
    'index.html',
    'manifest.json'
];

const checkedFiles = [];

// 检查 docs 目录下的文件
requiredFiles.forEach(file => {
    const filePath = path.join('docs', file);
    if (fs.existsSync(filePath)) {
        console.log(` ${file}`);
        checkedFiles.push({ file, status: 'OK' });
    } else {
        console.log(` ${file} - 文件缺失`);
        checkedFiles.push({ file, status: 'MISSING' });
    }
});

// 列出所有可用的文件
console.log('\n docs 目录内容:');
const docsFiles = fs.readdirSync('docs');
docsFiles.forEach(file => {
    const stats = fs.statSync(path.join('docs', file));
    console.log(`   ${stats.isDirectory() ? '' : ''} ${file}`);
});

console.log('\n 下一步:');
console.log('1. 访问 https://github.com');
console.log('2. 创建新仓库并上传 docs 文件夹中的所有文件');
console.log('3. 开启 GitHub Pages');
