// 健康分析功能
let currentImageFile = null;
let analysisResults = [];

// 初始化图片上传功能
function initImageUpload() {
    const uploadInput = document.getElementById('image-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleImageSelect);
    }
}

// 处理图片选择
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型和大小
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB！');
        return;
    }
    
    currentImageFile = file;
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('preview-area').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// 移除图片
function removeImage() {
    currentImageFile = null;
    document.getElementById('image-upload').value = '';
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('preview-area').classList.add('hidden');
    document.getElementById('result-area').classList.add('hidden');
}

// 分析图片
async function analyzeImage() {
    if (!currentImageFile) {
        alert('请先选择图片！');
        return;
    }
    
    const analyzeBtn = document.querySelector('.btn-analyze');
    const originalText = analyzeBtn.innerHTML;
    
    try {
        // 显示加载状态
        analyzeBtn.innerHTML = '<span class="loading"></span> 分析中...';
        analyzeBtn.disabled = true;
        
        // 将图片转换为base64
        const base64Image = await fileToBase64(currentImageFile);
        
        // 发送到后端进行分析
        const response = await fetch('/api/analysis/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                image: base64Image,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('分析请求失败');
        }
        
        const result = await response.json();
        displayAnalysisResult(result);
        
    } catch (error) {
        console.error('分析错误:', error);
        alert('分析失败，请稍后重试');
    } finally {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

// 文件转base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// 显示分析结果
function displayAnalysisResult(result) {
    const resultArea = document.getElementById('result-area');
    const riskLevel = document.getElementById('risk-level');
    const riskTitle = document.getElementById('risk-title');
    const riskDesc = document.getElementById('risk-desc');
    
    // 根据风险等级设置样式
    riskLevel.className = 'risk-level ' + result.risk_level;
    
    // 更新风险信息
    riskTitle.textContent = result.health_analysis.message;
    riskDesc.textContent = result.health_analysis.description;
    
    // 更新详细结果
    document.getElementById('color-result').textContent = result.detection?.color || '未检测';
    document.getElementById('texture-result').textContent = result.detection?.texture || '未检测';
    document.getElementById('shape-result').textContent = result.detection?.shape || '未检测';
    document.getElementById('confidence-result').textContent = 
        result.health_analysis.confidence ? (result.health_analysis.confidence * 100).toFixed(1) + '%' : '-';
    
    // 更新建议
    document.getElementById('recommendation-content').innerHTML = 
        '<p>' + result.health_analysis.recommendation + '</p>';
    
    // 显示结果区域
    resultArea.classList.remove('hidden');
    
    // 保存结果到本地
    result.timestamp = new Date().toISOString();
    result.image = document.getElementById('preview-img').src;
    analysisResults.unshift(result);
    updateAnalysisHistory();
}

// 保存分析结果
async function saveAnalysis() {
    if (analysisResults.length === 0) {
        alert('没有可保存的分析结果！');
        return;
    }
    
    const latestResult = analysisResults[0];
    
    try {
        const response = await fetch('/api/analysis/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                result: latestResult,
                timestamp: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            alert('分析记录保存成功！');
        } else {
            throw new Error('保存失败');
        }
    } catch (error) {
        console.error('保存错误:', error);
        alert('保存失败，请稍后重试');
    }
}

// 开始新的分析
function newAnalysis() {
    removeImage();
    document.getElementById('result-area').classList.add('hidden');
}

// 更新分析历史
function updateAnalysisHistory() {
    const historyList = document.getElementById('history-list');
    
    if (analysisResults.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-clipboard-list"></i>
                <p>暂无分析记录</p>
                <p>开始第一次分析后，这里会显示您的历史记录</p>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = analysisResults.map((result, index) => `
        <div class="history-item">
            <div class="history-content">
                <div class="history-main">
                    <span class="history-type ${result.risk_level}">${getRiskText(result.risk_level)}</span>
                    <span class="history-date">${formatDate(result.timestamp)}</span>
                </div>
                <div class="history-details">
                    <span>${result.health_analysis.message}</span>
                </div>
            </div>
            <button class="btn-history-view" onclick="viewHistoryDetail(${index})">
                <i class="fas fa-eye"></i>
            </button>
        </div>
    `).join('');
}

// 获取风险等级文本
function getRiskText(riskLevel) {
    const riskMap = {
        'normal': '正常',
        'warning': '需关注', 
        'danger': '高风险'
    };
    return riskMap[riskLevel] || '未知';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 查看历史详情
function viewHistoryDetail(index) {
    const result = analysisResults[index];
    if (result) {
        // 显示图片预览
        document.getElementById('preview-img').src = result.image;
        document.getElementById('upload-area').classList.add('hidden');
        document.getElementById('preview-area').classList.remove('hidden');
        
        // 显示分析结果
        displayAnalysisResult(result);
    }
}

// 在页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initImageUpload();
});
