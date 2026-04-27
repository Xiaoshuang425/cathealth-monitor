// 在 showDashboard 函数中的 analysis-section 部分替换为：

<div class="content-section" id="analysis-section">
    <div class="analysis-header">
        <h2><i class="fas fa-camera"></i> AI健康分析</h2>
        <p>上传猫咪排泄物照片，使用YOLO模型进行智能分析</p>
    </div>

    <div class="analysis-container">
        <!-- 上传区域 -->
        <div class="upload-section">
            <div class="upload-card" id="upload-area">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <h3>上传排泄物照片</h3>
                <p>支持 JPG、PNG 格式，最大 5MB</p>
                <input type="file" id="image-upload" accept="image/*" hidden>
                <button class="btn-upload" onclick="document.getElementById('image-upload').click()">
                    选择图片
                </button>
            </div>
            
            <!-- 图片预览 -->
            <div class="preview-card hidden" id="preview-area">
                <div class="preview-header">
                    <h4>图片预览</h4>
                    <button class="btn-remove" onclick="removeImage()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-image">
                    <img id="preview-img" src="" alt="预览图片">
                </div>
                <button class="btn-analyze" onclick="analyzeImage()">
                    <i class="fas fa-robot"></i> 开始AI分析
                </button>
            </div>
        </div>

        <!-- 分析结果 -->
        <div class="result-section hidden" id="result-area">
            <div class="result-header">
                <h3><i class="fas fa-chart-bar"></i> 分析结果</h3>
            </div>
            
            <div class="result-content">
                <div class="result-overview">
                    <div class="risk-level" id="risk-level">
                        <div class="risk-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="risk-info">
                            <h4 id="risk-title">健康状况良好</h4>
                            <p id="risk-desc">未检测到明显异常</p>
                        </div>
                    </div>
                </div>

                <div class="result-details">
                    <div class="detail-card">
                        <h5>检测特征</h5>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span class="detail-label">颜色分析</span>
                                <span class="detail-value" id="color-result">-</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">质地分析</span>
                                <span class="detail-value" id="texture-result">-</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">形状分析</span>
                                <span class="detail-value" id="shape-result">-</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">置信度</span>
                                <span class="detail-value" id="confidence-result">-</span>
                            </div>
                        </div>
                    </div>

                    <div class="recommendation-card">
                        <h5>健康建议</h5>
                        <div class="recommendation-content" id="recommendation-content">
                            <p>请保持当前的喂养习惯，继续观察猫咪的健康状况。</p>
                        </div>
                    </div>
                </div>

                <div class="result-actions">
                    <button class="btn-save" onclick="saveAnalysis()">
                        <i class="fas fa-save"></i> 保存记录
                    </button>
                    <button class="btn-new" onclick="newAnalysis()">
                        <i class="fas fa-plus"></i> 新的分析
                    </button>
                </div>
            </div>
        </div>

        <!-- 分析历史 -->
        <div class="history-section">
            <h3>分析历史</h3>
            <div class="history-list" id="history-list">
                <div class="history-empty">
                    <i class="fas fa-clipboard-list"></i>
                    <p>暂无分析记录</p>
                    <p>开始第一次分析后，这里会显示您的历史记录</p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .analysis-header {
        margin-bottom: 30px;
    }
    
    .analysis-header h2 {
        font-size: 1.8rem;
        color: var(--dark);
        margin-bottom: 8px;
    }
    
    .analysis-header p {
        color: var(--gray);
        font-size: 1.1rem;
    }
    
    .upload-section {
        display: flex;
        gap: 30px;
        margin-bottom: 40px;
    }
    
    .upload-card, .preview-card {
        flex: 1;
        background: var(--light);
        border: 2px dashed var(--primary-light);
        border-radius: 15px;
        padding: 40px;
        text-align: center;
        transition: all 0.3s ease;
    }
    
    .upload-card:hover {
        border-color: var(--primary);
        background: #fefaf3;
    }
    
    .upload-icon i {
        font-size: 3rem;
        color: var(--primary);
        margin-bottom: 20px;
    }
    
    .upload-card h3 {
        color: var(--dark);
        margin-bottom: 10px;
        font-size: 1.3rem;
    }
    
    .upload-card p {
        color: var(--gray);
        margin-bottom: 25px;
    }
    
    .btn-upload {
        background: var(--primary);
        color: var(--dark);
        border: none;
        padding: 12px 30px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
    }
    
    .btn-upload:hover {
        background: var(--primary-light);
    }
    
    .preview-card {
        border: 2px solid var(--primary-light);
        display: flex;
        flex-direction: column;
    }
    
    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }
    
    .preview-header h4 {
        color: var(--dark);
        font-size: 1.2rem;
    }
    
    .btn-remove {
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 5px;
    }
    
    .btn-remove:hover {
        color: var(--dark);
    }
    
    .preview-image {
        flex: 1;
        margin-bottom: 20px;
    }
    
    .preview-image img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 8px;
        object-fit: contain;
    }
    
    .btn-analyze {
        background: var(--primary);
        color: var(--dark);
        border: none;
        padding: 12px 25px;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-analyze:hover {
        background: var(--primary-light);
        transform: translateY(-2px);
    }
    
    .btn-analyze:disabled {
        background: var(--gray);
        cursor: not-allowed;
        transform: none;
    }
    
    .result-section {
        background: var(--light);
        border: 1px solid var(--primary-light);
        border-radius: 15px;
        padding: 30px;
        margin-bottom: 40px;
    }
    
    .result-header h3 {
        color: var(--dark);
        margin-bottom: 25px;
        font-size: 1.4rem;
    }
    
    .risk-level {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: white;
        border-radius: 10px;
        border: 1px solid var(--primary-light);
        margin-bottom: 25px;
    }
    
    .risk-icon i {
        font-size: 2.5rem;
    }
    
    .risk-level.normal .risk-icon i { color: #4CAF50; }
    .risk-level.warning .risk-icon i { color: #FF9800; }
    .risk-level.danger .risk-icon i { color: #F44336; }
    
    .risk-info h4 {
        color: var(--dark);
        margin-bottom: 5px;
        font-size: 1.3rem;
    }
    
    .risk-info p {
        color: var(--gray);
    }
    
    .result-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 25px;
    }
    
    .detail-card, .recommendation-card {
        background: white;
        border: 1px solid var(--primary-light);
        border-radius: 10px;
        padding: 20px;
    }
    
    .detail-card h5, .recommendation-card h5 {
        color: var(--dark);
        margin-bottom: 15px;
        font-size: 1.1rem;
    }
    
    .detail-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--primary-light);
    }
    
    .detail-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }
    
    .detail-label {
        color: var(--gray);
        font-weight: 500;
    }
    
    .detail-value {
        color: var(--dark);
        font-weight: 600;
    }
    
    .recommendation-content {
        color: var(--dark);
        line-height: 1.6;
    }
    
    .result-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    
    .btn-save, .btn-new {
        padding: 12px 25px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .btn-save {
        background: var(--secondary);
        color: white;
    }
    
    .btn-save:hover {
        background: #8DB596;
    }
    
    .btn-new {
        background: var(--primary-light);
        color: var(--dark);
    }
    
    .btn-new:hover {
        background: var(--primary);
    }
    
    .history-section h3 {
        color: var(--dark);
        margin-bottom: 20px;
        font-size: 1.4rem;
    }
    
    .history-list {
        background: var(--light);
        border: 1px solid var(--primary-light);
        border-radius: 12px;
        padding: 20px;
    }
    
    .history-empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--gray);
    }
    
    .history-empty i {
        font-size: 3rem;
        margin-bottom: 15px;
        color: var(--primary-light);
    }
    
    /* 加载动画 */
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .upload-section {
            flex-direction: column;
        }
        
        .result-details {
            grid-template-columns: 1fr;
        }
        
        .result-actions {
            flex-direction: column;
        }
    }
</style>
