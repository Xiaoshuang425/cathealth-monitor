// 健康分析功能
function initializeAnalysis() {
    console.log("初始化健康分析功能");
    
    // 图片上传处理
    const uploadInput = document.getElementById("stool-image");
    const preview = document.getElementById("image-preview");
    const analyzeBtn = document.getElementById("analyze-btn");
    
    if (uploadInput) {
        uploadInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                previewImage(file, preview);
                analyzeBtn.disabled = false;
            }
        });
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyzeStoolImage);
    }
    
    // 加载分析历史
    loadAnalysisHistory();
}

// 图片预览
function previewImage(file, previewElement) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewElement.innerHTML = \`
            <div class="image-container">
                <img src="\${e.target.result}" alt="预览图片">
                <div class="image-overlay">
                    <i class="fas fa-search-plus"></i>
                    <p>点击图片可放大查看</p>
                </div>
            </div>
        \`;
        
        // 添加点击放大功能
        const img = previewElement.querySelector("img");
        img.addEventListener("click", function() {
            showImageModal(e.target.result);
        });
    };
    
    reader.readAsDataURL(file);
}

// 图片模态框
function showImageModal(imageSrc) {
    const modalHTML = \`
        <div class="image-modal" onclick="closeImageModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeImageModal()">
                    <i class="fas fa-times"></i>
                </button>
                <img src="\${imageSrc}" alt="放大图片">
            </div>
        </div>
    \`;
    
    document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function closeImageModal() {
    const modal = document.querySelector(".image-modal");
    if (modal) {
        modal.remove();
    }
}

// 分析排泄物图片
async function analyzeStoolImage() {
    const uploadInput = document.getElementById("stool-image");
    const file = uploadInput.files[0];
    
    if (!file) {
        alert("请先选择要分析的图片");
        return;
    }
    
    const analyzeBtn = document.getElementById("analyze-btn");
    const resultSection = document.getElementById("analysis-result");
    
    // 显示加载状态
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
    analyzeBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append("stoolImage", file);
        
        const response = await fetch("/api/analysis/upload", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAnalysisResult(data.analysis, data.imageUrl);
            resultSection.classList.remove("hidden");
            
            // 重新加载历史记录
            loadAnalysisHistory();
        } else {
            alert("分析失败: " + data.error);
        }
        
    } catch (error) {
        console.error("分析错误:", error);
        alert("网络错误，请稍后重试");
    } finally {
        // 恢复按钮状态
        analyzeBtn.innerHTML = '<i class="fas fa-camera"></i> 开始分析';
        analyzeBtn.disabled = false;
    }
}

// 显示分析结果
function displayAnalysisResult(analysis, imageUrl) {
    const resultSection = document.getElementById("analysis-result");
    
    const riskClass = \`risk-\${analysis.riskLevel}\`;
    const riskText = {
        low: "低风险",
        medium: "中风险", 
        high: "高风险"
    }[analysis.riskLevel] || "未知";
    
    resultSection.innerHTML = \`
        <div class="result-card \${riskClass}">
            <div class="result-header">
                <h3>分析结果</h3>
                <span class="risk-badge \${riskClass}">\${riskText}</span>
            </div>
            
            <div class="result-content">
                <div class="result-image">
                    <img src="\${imageUrl}" alt="分析图片">
                </div>
                
                <div class="result-details">
                    <div class="result-item">
                        <label>检测状况:</label>
                        <span class="condition">\${analysis.description}</span>
                    </div>
                    
                    <div class="result-item">
                        <label>置信度:</label>
                        <span class="confidence">\${(analysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                    
                    <div class="result-item">
                        <label>分析时间:</label>
                        <span>\${analysis.analysisTime}</span>
                    </div>
                    
                    <div class="result-message \${riskClass}">
                        <i class="fas fa-\${getRiskIcon(analysis.riskLevel)}"></i>
                        \${analysis.recommendation}
                    </div>
                </div>
            </div>
            
            <div class="result-footer">
                <h4>详细检测结果:</h4>
                <div class="detections-list">
                    \${analysis.allDetections.map(detection => \`
                        <div class="detection-item">
                            <span class="detection-type">\${detection.description}</span>
                            <span class="detection-confidence">\${(detection.confidence * 100).toFixed(1)}%</span>
                        </div>
                    \`).join("")}
                </div>
            </div>
        </div>
    \`;
}

// 获取风险图标
function getRiskIcon(riskLevel) {
    const icons = {
        low: "check-circle",
        medium: "exclamation-triangle", 
        high: "exclamation-circle"
    };
    return icons[riskLevel] || "question-circle";
}

// 加载分析历史
async function loadAnalysisHistory() {
    try {
        const response = await fetch("/api/analysis/history");
        const data = await response.json();
        
        if (data.success) {
            displayAnalysisHistory(data.history);
        }
    } catch (error) {
        console.error("加载历史记录失败:", error);
    }
}

// 显示分析历史
function displayAnalysisHistory(history) {
    const historySection = document.getElementById("analysis-history");
    if (!historySection) return;
    
    if (history.length === 0) {
        historySection.innerHTML = \`
            <div class="empty-history">
                <i class="fas fa-clipboard-list"></i>
                <p>暂无分析记录</p>
                <p>上传图片开始第一次健康分析</p>
            </div>
        \`;
        return;
    }
    
    historySection.innerHTML = history.map(record => \`
        <div class="history-item">
            <div class="history-image">
                <img src="\${record.imageUrl}" alt="历史记录">
            </div>
            <div class="history-info">
                <div class="history-condition \${record.condition}">\${getConditionText(record.condition)}</div>
                <div class="history-confidence">置信度: \${(record.confidence * 100).toFixed(1)}%</div>
                <div class="history-date">\${new Date(record.date).toLocaleDateString("zh-CN")}</div>
            </div>
            <div class="history-risk risk-\${record.riskLevel}">
                \${getRiskText(record.riskLevel)}
            </div>
        </div>
    \`).join("");
}

// 工具函数
function getConditionText(condition) {
    const conditions = {
        normal: "正常",
        diarrhea: "腹泻",
        constipation: "便秘", 
        bloody: "便血",
        mucus: "粘液便"
    };
    return conditions[condition] || condition;
}

function getRiskText(riskLevel) {
    const risks = {
        low: "低风险",
        medium: "中风险",
        high: "高风险"
    };
    return risks[riskLevel] || riskLevel;
}

// 添加到全局
window.initializeAnalysis = initializeAnalysis;
window.analyzeStoolImage = analyzeStoolImage;
window.showImageModal = showImageModal;
window.closeImageModal = closeImageModal;
