from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

print("=" * 50)
print(" CatHealth 测试服务器启动!")
print("📍 http://localhost:10000")
print("=" * 50)

@app.route('/')
def home():
    return jsonify({"status": "running", "message": "Hello World!"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "CatHealth"})

@app.route('/test')
def test():
    return jsonify({"message": "Test successful!"})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=10000, debug=True)
