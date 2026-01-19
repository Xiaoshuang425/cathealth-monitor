#  CatHealth - 猫咪健康检测应用-created by xiaoshuangshuang

基于YOLOv8的猫咪排泄物智能分析系统，帮助猫主人通过排泄物图片快速了解猫咪健康状况。

##  功能特点

-  **AI智能分析** - 使用YOLOv8模型对猫咪排泄物图片进行实时检测
-  **健康评估** - 自动分析排泄物形态，评估健康风险等级
-  **专业建议** - 根据检测结果提供专业养护建议
-  **响应式设计** - 支持桌面和移动设备访问
- **快速部署** - 简单配置即可运行

項目結構：
  **系統維護中，暫不開放下載，請靜候佳音。**

##  环境要求

- Python 3.8+
- Node.js (可选，用于前端开发)
- 现代浏览器（Chrome 90+ / Firefox 88+ / Edge 90+）

##  快速开始

### 1. 克隆项目

```bash
git clone <项目地址>
cd cathealth-app
```

### 2. 安装Python依赖

```bash
cd backend/python
pip install -r requirements.txt
```

如果没找到requirements.txt，手动安装：

```bash
pip install flask flask-cors ultralytics torch torchvision pillow opencv-python numpy
```

### 3. 准备模型文件

确保 `backend/python/models/best.pt` 文件存在，包含训练好的YOLOv8模型。

### 4. 启动后端服务

```bash
cd backend/python
python main.py
```

或者使用备用版本：
```bash
python main1.py
```

服务将运行在：`http://127.0.0.1:3001`

### 5. 访问前端

1. 打开 `frontend/index.html` 文件
2. 或使用Live Server等工具运行

3. 在浏览器控制台中设置API地址：
```javascript
window.CLOUD_AI_URL = "http://127.0.0.1:3001";
```

##  API接口

### 健康检查
```
GET /health
```

响应：
```json
{
  "status": "healthy",
  "service": "CatHealth YOLO Service",
  "model_loaded": true,
  "model_path": "models/best.pt"
}
```

### 排泄物分析
```
POST /analyze/stool
```

请求体：
```json
{
  "image": "base64编码的图片数据"
}
```

响应：
```json
{
  "success": true,
  "detection": {
    "confidence": 0.85,
    "class_id": 0,
    "class_name": "正常",
    "features": "YOLOv8检测 - 正常"
  },
  "health_analysis": {
    "risk_level": "normal",
    "message": "检测到: 正常",
    "description": "AI分析完成",
    "recommendation": "猫咪排泄物形态正常，建议保持当前饮食"
  }
}
```

##  配置说明

### 端口配置
- 默认端口：3001
- 修改端口：设置环境变量 `PYTHON_PORT`
  ```bash
  set PYTHON_PORT=5000  # Windows
  export PYTHON_PORT=5000  # Linux/Mac
  ```

### 模型配置
- 模型路径：`backend/python/models/best.pt`
- 支持的类别：
  - 0: 正常
  - 1: 软便
  - 2: 拉稀
  - 3: 便秘
  - 4: 寄生虫感染

##  常见问题
### Q1: 模型加载失败
- 检查 `models/best.pt` 文件是否存在
- 确认文件完整（约18.4MB）
- 检查ultralytics包是否正确安装

### Q2: 检测结果总是"正常"
- 模型可能训练过于严格
- 尝试调整检测阈值
- 确保图片清晰、光线充足

### Q3: 前端无法连接后端
- 检查后端服务是否运行
- 确认端口号正确
- 检查浏览器控制台错误信息

### Q4: 图片上传失败
- 检查图片格式（支持JPG、PNG）
- 确认图片大小合适（建议<5MB）
- 检查网络连接

##  使用示例
1. **拍摄猫咪排泄物照片**
   - 确保照片清晰
   - 光线充足
   - 尽量拍摄特写

2. **上传图片**
   - 点击上传区域选择图片
   - 等待AI分析

3. **查看结果**
   - 查看健康风险等级
   - 阅读专业建议
   - 根据建议采取相应措施

##  技术栈
- 后端：Flask, YOLOv8, OpenCV
- 前端：HTML5, CSS3, JavaScript
- AI框架：Ultralytics YOLO, PyTorch
- 部署：支持render雲部署

##  致谢
- 鹽津蝦許圈圈
- 爾多隆小潘潘
- 丁不咚呱77
- 成呂控小呂呂
- 漂漂亮亮可可愛愛溫柔大方刀槍不入的指導老師

##  支持与反馈
遇到问题或需要帮助？
1. 查看常见问题部分
2. 提交GitHub Issue
3. 联系xiaoshuangshuang

---

**温馨提示**：本应用提供的是初步健康评估，不能替代专业兽医诊断。如有严重症状，请及时就医。
本项目仅供学习和研究使用。商业使用请联系项目维护者。
---

*最后更新：2025年10月*
*版本：v1.0.0*
