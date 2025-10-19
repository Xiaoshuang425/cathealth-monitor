console.log('1. 服务器开始启动...');
const http = require('http');
console.log('2. HTTP模块加载成功...');

const server = http.createServer((req, res) => {
    console.log('收到请求:', req.url);
    res.end('Hello World! ' + new Date().toISOString());
});

console.log('3. 服务器创建成功...');

server.listen(3001, '0.0.0.0', () => {
    console.log('4.  服务器启动成功!');
    console.log('   本地: http://localhost:3001');
    console.log('   手机: http://192.168.31.199:3001');
});

console.log('5. 监听中...');
