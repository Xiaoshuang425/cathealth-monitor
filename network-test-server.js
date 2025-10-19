const http = require('http');
const port = 3001;

const server = http.createServer((req, res) => {
    console.log('请求: ' + req.method + ' ' + req.url + ' 来自 ' + req.socket.remoteAddress);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
        '<!DOCTYPE html>' +
        '<html>' +
        '<head><title>网络测试</title></head>' +
        '<body>' +
        '<h1> 网络连接成功！</h1>' +
        '<p>时间: ' + new Date().toISOString() + '</p>' +
        '<p>你的IP: ' + req.socket.remoteAddress + '</p>' +
        '</body>' +
        '</html>'
    );
});

server.listen(port, '0.0.0.0', () => {
    console.log(' 网络测试服务器运行在: http://localhost:' + port);
    console.log(' 手机访问: http://192.168.31.199:' + port);
});
