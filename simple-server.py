import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"临时服务器运行在: http://localhost:{PORT}")
    print("手机访问: http://你的IP:8000")
    httpd.serve_forever()
