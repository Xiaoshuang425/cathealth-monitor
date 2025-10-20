// 简化的健康分析功能
class HealthAnalysis {
    constructor() {
        this.selectedFile = null;
        this.analysisResult = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAnalysisHistory();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }

        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeImage();
            });
        }
    }

    handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB！');
            return;
        }

        this.selectedFile = file;
        this.displaySelectedImage(file);
    }

    displaySelectedImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = document.getElementById('upload-area');
            const uploadContent = document.getElementById('upload-content');
            
            uploadArea.classList.add('has-image');
            uploadContent.innerHTML = '<div class="selected-image"><img src="' + e.target.result + '" alt="Selected image"><div class="image-info"><p>' + file.name + '</p><p>' + this.formatFileSize(file.size) + '</p></div></div>';

            document.getElementById('analyze-section').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    async analyzeImage() {
        if (!this.selectedFile) {
            alert('请先选择图片！');
            return;
        }

        const analyzeBtn = document.getElementById('analyze-btn');
        const originalText = analyzeBtn.innerHTML;
        
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 分析中...';
        analyzeBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image', this.selectedFile);

            const response = await fetch('/api/health/analyze', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                this.analysisResult = data.result;
                this.displayAnalysisResult(data.result);
                this.saveToHistory(data.result);
            } else {
                throw new Error(data.error || '分析失败');
            }

        } catch (error) {
            console.error('Analysis error:', error);
            alert('分析失败: ' + error.message);
        } finally {
            analyzeBtn.innerHTML = originalText;
            analyzeBtn.disabled = false;
        }
    }

    displayAnalysisResult(result) {
        const resultSection = document.getElementById('result-section');
        const resultContent = document.getElementById('result-content');
        
        const statusClass = this.getStatusClass(result.health_status);
        const statusText = this.getStatusText(result.health_status);
        const recommendations = this.getRecommendations(result.health_status);

        let recommendationsHTML = '';
        recommendations.forEach(rec => {
            recommendationsHTML += '<li>' + rec + '</li>';
        });

        resultContent.innerHTML = '<div class="result-card ' + statusClass + '"><div class="result-header"><div class="status-indicator"><i class="fas ' + this.getStatusIcon(result.health_status) + '"></i><h3>分析结果</h3></div><span class="health-status">' + statusText + '</span></div><div class="result-details"><div class="detail-item"><label>健康评分:</label><span class="score">' + result.health_score + '/100</span></div><div class="detail-item"><label>检测类型:</label><span>' + (result.detection_type || '猫咪排泄物') + '</span></div><div class="detail-item"><label>分析时间:</label><span>' + new Date().toLocaleString() + '</span></div></div><div class="confidence-level"><label>分析置信度:</label><div class="confidence-bar"><div class="confidence-fill" style="width: ' + (result.confidence || 85) + '%"></div></div><span class="confidence-value">' + (result.confidence || 85) + '%</span></div><div class="recommendations"><h4>建议措施</h4><ul>' + recommendationsHTML + '</ul></div><div class="result-actions"><button class="btn-secondary" onclick="healthAnalysis.saveResult()"><i class="fas fa-save"></i> 保存结果</button><button class="btn-primary" onclick="healthAnalysis.shareResult()"><i class="fas fa-share"></i> 分享报告</button></div></div>';

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    getStatusClass(status) {
        const statusMap = {
            'healthy': 'status-healthy',
            'warning': 'status-warning',
            'critical': 'status-critical',
            'unknown': 'status-unknown'
        };
        return statusMap[status] || 'status-unknown';
    }

    getStatusText(status) {
        const statusMap = {
            'healthy': '健康',
            'warning': '需要注意',
            'critical': '需要就医',
            'unknown': '无法确定'
        };
        return statusMap[status] || '未知状态';
    }

    getStatusIcon(status) {
        const iconMap = {
            'healthy': 'fa-check-circle',
            'warning': 'fa-exclamation-triangle',
            'critical': 'fa-times-circle',
            'unknown': 'fa-question-circle'
        };
        return iconMap[status] || 'fa-question-circle';
    }

    getRecommendations(status) {
        const recommendations = {
            'healthy': [
                '继续保持良好的饮食习惯',
                '确保充足的饮水',
                '定期进行健康检查'
            ],
            'warning': [
                '建议观察猫咪的食欲和精神状态',
                '适当调整饮食结构',
                '如症状持续，建议咨询兽医'
            ],
            'critical': [
                '立即联系兽医进行专业检查',
                '暂停当前饮食，改为易消化食物',
                '保持猫咪温暖和安静'
            ],
            'unknown': [
                '建议重新拍摄清晰的照片',
                '确保照片光线充足',
                '如担心猫咪健康，建议咨询兽医'
            ]
        };
        return recommendations[status] || recommendations.unknown;
    }

    resetUpload() {
        this.selectedFile = null;
        this.analysisResult = null;
        
        const uploadArea = document.getElementById('upload-area');
        const uploadContent = document.getElementById('upload-content');
        const analyzeSection = document.getElementById('analyze-section');
        const resultSection = document.getElementById('result-section');
        
        uploadArea.classList.remove('has-image');
        uploadContent.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>点击或拖拽图片到这里</p><span class="upload-hint">支持 JPG、PNG 格式，最大 5MB</span>';
        
        analyzeSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        
        document.getElementById('file-input').value = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveToHistory(result) {
        const history = this.getAnalysisHistory();
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            result: result,
            image: this.selectedFile ? URL.createObjectURL(this.selectedFile) : null
        };
        
        history.unshift(historyItem);
        localStorage.setItem('healthAnalysisHistory', JSON.stringify(history.slice(0, 50)));
        
        this.loadAnalysisHistory();
    }

    getAnalysisHistory() {
        const history = localStorage.getItem('healthAnalysisHistory');
        return history ? JSON.parse(history) : [];
    }

    loadAnalysisHistory() {
        const history = this.getAnalysisHistory();
        const historyList = document.getElementById('history-list');
        
        if (!historyList) return;

        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-history"><i class="fas fa-clipboard-list"></i><p>暂无分析记录</p><p class="hint">开始使用健康分析功能后，这里会显示您的历史记录</p></div>';
            return;
        }

        let historyHTML = '';
        history.forEach(item => {
            historyHTML += '<div class="history-item" onclick="healthAnalysis.viewHistoryDetail(' + item.id + ')"><div class="history-image"><img src="' + (item.image || '/images/placeholder.jpg') + '" alt="分析记录"></div><div class="history-info"><div class="history-status ' + this.getStatusClass(item.result.health_status) + '"><i class="fas ' + this.getStatusIcon(item.result.health_status) + '"></i>' + this.getStatusText(item.result.health_status) + '</div><div class="history-score">评分: ' + item.result.health_score + '/100</div><div class="history-time">' + new Date(item.timestamp).toLocaleString() + '</div></div></div>';
        });

        historyList.innerHTML = historyHTML;
    }

    viewHistoryDetail(historyId) {
        const history = this.getAnalysisHistory();
        const item = history.find(h => h.id === historyId);
        
        if (item) {
            this.analysisResult = item.result;
            this.displayAnalysisResult(item.result);
            document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    saveResult() {
        if (!this.analysisResult) {
            alert('没有可保存的分析结果！');
            return;
        }

        alert('分析结果已保存到健康历史！');
    }

    shareResult() {
        if (!this.analysisResult) {
            alert('没有可分享的分析结果！');
            return;
        }

        const shareText = '我的猫咪健康分析结果：' + this.getStatusText(this.analysisResult.health_status) + '，评分：' + this.analysisResult.health_score + '/100';
        
        if (navigator.share) {
            navigator.share({
                title: '猫咪健康分析报告',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('分析结果已复制到剪贴板！');
            });
        }
    }
}

// 初始化健康分析功能
let healthAnalysis;
document.addEventListener('DOMContentLoaded', function() {
    healthAnalysis = new HealthAnalysis();
});

window.healthAnalysis = healthAnalysis;
