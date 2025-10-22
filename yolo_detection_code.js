// ==================== YOLOv8粪便检测功能 ====================
const YOLO_AI_URL = "http://localhost:5000";

// 初始化粪便检测功能
function initializeAIAnalysis() {
    const uploadArea = document.getElementById("upload-area");
    const imageUpload = document.getElementById("image-upload");
    
    if (uploadArea && imageUpload) {
        // 点击上传区域触发文件选择
        uploadArea.addEventListener("click", function() {
            imageUpload.click();
        });
        
        // 文件选择处理
        imageUpload.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
        
        // 拖拽功能
        uploadArea.addEventListener("dragover", function(e) {
            e.preventDefault();
            uploadArea.classList.add("dragover");
        });
        
        uploadArea.addEventListener("dragleave", function() {
            uploadArea.classList.remove("dragover");
        });
        
        uploadArea.addEventListener("drop", function(e) {
            e.preventDefault();
            uploadArea.classList.remove("dragover");
            const file = e.dataTransfer.files[0];
            if (file) {
                handleImageUpload(file);
            }
        });
    }
}

// 处理图片上传
function handleImageUpload(file) {
    console.log("开始YOLOv8分析:", file.name);
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        alert("请上传图片文件！");
        return;
    }
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("preview-img").src = e.target.result;
        document.getElementById("image-preview").style.display = "block";
    };
    reader.readAsDataURL(file);
    
    // 显示分析中状态
    const uploadArea = document.getElementById("upload-area");
    uploadArea.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3>YOLOv8分析中...</h3>
        <p>正在使用训练模型分析排泄物特征</p>
        <div style="margin-top: 15px;">
            <div style="background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%); height: 4px; border-radius: 2px; width: 80%; margin: 0 auto;"></div>
        </div>
    `;
    
    // 调用YOLO分析
    analyzeWithYOLO(file);
}

// 调用YOLO分析
function analyzeWithYOLO(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    console.log("调用YOLOv8 API...");
    
    fetch(YOLO_AI_URL + "/api/ai/analyze", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        console.log("YOLOv8分析结果:", result);
        if (result.success) {
            displayYOLOResult(result);
        } else {
            showAnalysisError(result.error || "YOLO分析失败");
        }
    })
    .catch(error => {
        console.error("YOLOv8服务错误:", error);
        showAnalysisError("YOLOv8服务未启动，请运行: python yolo_service.py");
    });
}

// 显示YOLO分析结果
function displayYOLOResult(result) {
    const detectionResults = document.getElementById("detection-results");
    const uploadArea = document.getElementById("upload-area");
    
    // 根据风险等级设置颜色
    const riskColor = result.risk_metrics?.color || "#28a745";
    const riskLevel = result.health_analysis?.risk_level || "normal";
    
    // 症状显示名称映射
    const symptomNames = {
        "normal": "正常",
        "Lightweight and portable": "软便",
        "watery diarrhoea": "拉稀",
        "constipation": "便秘", 
        "parasitic infection": "寄生虫感染"
    };
    
    const detectedClass = result.detection?.class_name || "normal";
    const displayName = symptomNames[detectedClass] || detectedClass;
    const confidence = Math.round((result.detection?.confidence || 0) * 100);
    
    detectionResults.innerHTML = `
        <h3 style="margin-bottom: 25px; text-align: center; color: var(--dark);">
            <i class="fas fa-chart-bar"></i> YOLOv8分析结果
        </h3>
        
        <div style="background: ${riskColor}20; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${riskColor};">
            <h4 style="margin: 0; color: ${riskColor};">
                <i class="fas fa-robot"></i> 检测结果: ${displayName}
            </h4>
        </div>
        
        <div class="result-grid">
            <div class="result-item">
                <div class="result-value" style="color: ${riskColor};">${displayName}</div>
                <div class="result-label">健康状态</div>
            </div>
            <div class="result-item">
                <div class="result-value">${confidence}%</div>
                <div class="result-label">模型置信度</div>
            </div>
            <div class="result-item">
                <div class="result-value">${result.risk_metrics?.risk_level || 0}%</div>
                <div class="result-label">风险等级</div>
            </div>
            <div class="result-item">
                <div class="result-value">${result.risk_metrics?.cure_rate || 0}%</div>
                <div class="result-label">治愈概率</div>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-bottom: 10px; color: var(--dark);">
                <i class="fas fa-search"></i> 检测特征
            </h4>
            <p style="color: var(--dark); margin: 0; margin-bottom: 15px;">${result.detection?.features || "特征分析中..."}</p>
            
            <h4 style="margin-bottom: 10px; color: var(--dark);">
                <i class="fas fa-heartbeat"></i> 健康建议
            </h4>
            <p style="color: var(--dark); margin: 0;">${result.health_analysis?.recommendation || "请咨询兽医"}</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
            <button class="btn btn-primary" onclick="analyzeNewImage()">
                <i class="fas fa-sync-alt"></i> 分析新图片
            </button>
            <button class="btn btn-secondary" onclick="saveAnalysisResult()" style="margin-left: 10px;">
                <i class="fas fa-save"></i> 保存结果
            </button>
        </div>
    `;
    
    detectionResults.style.display = "block";
    uploadArea.style.display = "none";
    
    // 保存当前结果用于后续操作
    window.currentAnalysisResult = result;
}

// 显示分析错误
function showAnalysisError(errorMessage) {
    const uploadArea = document.getElementById("upload-area");
    const detectionResults = document.getElementById("detection-results");
    
    detectionResults.innerHTML = `
        <h3 style="margin-bottom: 25px; text-align: center; color: var(--dark);">
            <i class="fas fa-exclamation-triangle"></i> 分析失败
        </h3>
        
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h4 style="margin-bottom: 10px; color: #721c24;">
                <i class="fas fa-times-circle"></i> 错误信息
            </h4>
            <p style="color: #721c24; margin: 0;">${errorMessage}</p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
            <button class="btn btn-primary" onclick="analyzeNewImage()">
                <i class="fas fa-sync-alt"></i> 重新尝试
            </button>
        </div>
    `;
    
    detectionResults.style.display = "block";
    uploadArea.style.display = "none";
}

// 分析新图片
function analyzeNewImage() {
    const detectionResults = document.getElementById("detection-results");
    const imagePreview = document.getElementById("image-preview");
    const uploadArea = document.getElementById("upload-area");
    
    detectionResults.style.display = "none";
    imagePreview.style.display = "none";
    uploadArea.style.display = "block";
    
    uploadArea.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h3>点击上传或拖拽图片到此区域</h3>
        <p>支持 JPG、PNG 格式，最大 5MB</p>
        <button class="btn btn-primary" style="margin-top: 20px;">
            <i class="fas fa-upload"></i> 选择图片
        </button>
    `;
    
    document.getElementById("image-upload").value = "";
    window.currentAnalysisResult = null;
}

// 保存分析结果
function saveAnalysisResult() {
    if (!window.currentAnalysisResult) {
        alert("没有可保存的分析结果");
        return;
    }
    
    const records = JSON.parse(localStorage.getItem("yoloAnalysisRecords") || "[]");
    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        result: window.currentAnalysisResult,
        image: document.getElementById("preview-img").src
    };
    
    records.unshift(record);
    
    // 只保留最近20条记录
    if (records.length > 20) {
        records.pop();
    }
    
    localStorage.setItem("yoloAnalysisRecords", JSON.stringify(records));
    alert(" 分析结果已保存！");
}

// 测试YOLO服务连接
function testYOLOService() {
    fetch(YOLO_AI_URL + "/health")
        .then(response => response.json())
        .then(data => {
            console.log("YOLO服务状态:", data);
            if (data.status === "healthy") {
                alert(" YOLOv8服务连接正常！");
            } else {
                alert(" YOLOv8服务异常");
            }
        })
        .catch(error => {
            console.error("YOLO服务测试失败:", error);
            alert(" 无法连接到YOLOv8服务");
        });
}

// 页面加载时初始化
document.addEventListener("DOMContentLoaded", function() {
    initializeAIAnalysis();
    console.log("YOLOv8粪便检测功能已加载");
});
