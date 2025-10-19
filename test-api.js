const http = require('http');

console.log('🧪 测试登录API...');

const testData = JSON.stringify({
    email: 'jiaminpan@gmail.com',
    password: '123456'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

const req = http.request(options, (res) => {
    console.log('状态码:', res.statusCode);
    console.log('响应头:', JSON.stringify(res.headers));
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('响应数据:', data);
        try {
            const json = JSON.parse(data);
            console.log('✅ API测试成功！');
        } catch (e) {
            console.log('❌ 响应不是JSON:', data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.log('❌ 请求错误:', e.message);
});

req.write(testData);
req.end();
