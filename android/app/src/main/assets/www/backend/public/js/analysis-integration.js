
// 在 showDashboard 函数中的分析部分占位符处替换为真实的分析界面
function showAnalysisSection() {
    return \`
        <div class="analysis-container">
            <div class="analysis-header">
                <h2><i class="fas fa-camera"></i> 健康分析</h2>
                <p>上传猫咪排泄物照片，使用AI进行健康风险评估</p>
            </div>
            
            <div class="upload-section">
                <div class="upload-card">
                    <div class="upload-area" id="upload-area">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <h3>上传排泄物照片</h3>
                        <p>支持 JPG、PNG 格式，最大 10MB</p>
                        <input type="file" id="stool-image" accept="image/*" hidden>
                        <button class="btn btn-primary" onclick="document.getElementById('stool-image').click()">
                            <i class="fas fa-folder-open"></i> 选择图片
                        </button>
                    </div>
                    
                    <div class="image-preview hidden" id="image-preview">
                        <!-- 图片预览将在这里显示 -->
                    </div>
                </div>
                
                <div class="analysis-controls">
                    <button class="btn btn-primary" id="analyze-btn" disabled>
                        <i class="fas fa-camera"></i> 开始分析
                    </button>
                </div>
            </div>
            
            <div class="result-section hidden" id="analysis-result">
                <!-- 分析结果将在这里显示 -->
            </div>
            
            <div class="history-section">
                <h3>分析历史</h3>
                <div class="history-list" id="analysis-history">
                    <!-- 历史记录将在这里显示 -->
                </div>
            </div>
        </div>
        
        <style>
            .analysis-container {
                max-width: 1000px;
                margin: 0 auto;
            }
            
            .analysis-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .analysis-header h2 {
                font-size: 2rem;
                color: var(--dark);
                margin-bottom: 10px;
            }
            
            .upload-card {
                background: var(--light);
                border: 2px dashed var(--primary-light);
                border-radius: 15px;
                padding: 40px;
                text-align: center;
                margin-bottom: 20px;
            }
            
            .upload-area i {
                font-size: 3rem;
                color: var(--primary);
                margin-bottom: 15px;
            }
            
            .upload-area h3 {
                color: var(--dark);
                margin-bottom: 10px;
            }
            
            .upload-area p {
                color: var(--gray);
                margin-bottom: 20px;
            }
            
            .image-preview {
                margin-top: 20px;
            }
            
            .image-container {
                position: relative;
                max-width: 400px;
                margin: 0 auto;
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
            }
            
            .image-container img {
                width: 100%;
                height: auto;
                display: block;
            }
            
            .image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: white;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .image-container:hover .image-overlay {
                opacity: 1;
            }
            
            .analysis-controls {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .result-card {
                background: var(--light);
                border: 1px solid var(--primary-light);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
            }
            
            .result-card.risk-low {
                border-left: 5px solid #4CAF50;
            }
            
            .result-card.risk-medium {
                border-left: 5px solid #FF9800;
            }
            
            .result-card.risk-high {
                border-left: 5px solid #F44336;
            }
            
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid var(--primary-light);
            }
            
            .risk-badge {
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .risk-badge.risk-low {
                background: #E8F5E9;
                color: #2E7D32;
            }
            
            .risk-badge.risk-medium {
                background: #FFF3E0;
                color: #EF6C00;
            }
            
            .risk-badge.risk-high {
                background: #FFEBEE;
                color: #C62828;
            }
            
            .result-content {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 30px;
                margin-bottom: 25px;
            }
            
            .result-image img {
                width: 100%;
                border-radius: 10px;
            }
            
            .result-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid var(--primary-light);
            }
            
            .result-item label {
                font-weight: 600;
                color: var(--dark);
            }
            
            .condition {
                font-weight: 600;
                color: var(--dark);
            }
            
            .confidence {
                font-weight: 700;
                color: var(--primary);
            }
            
            .result-message {
                padding: 15px;
                border-radius: 8px;
                margin-top: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .result-message.risk-low {
                background: #E8F5E9;
                color: #2E7D32;
            }
            
            .result-message.risk-medium {
                background: #FFF3E0;
                color: #EF6C00;
            }
            
            .result-message.risk-high {
                background: #FFEBEE;
                color: #C62828;
            }
            
            .detections-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
            
            .detection-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: white;
                border-radius: 6px;
                border: 1px solid var(--primary-light);
            }
            
            .history-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .history-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: var(--light);
                border: 1px solid var(--primary-light);
                border-radius: 10px;
            }
            
            .history-image {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .history-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .history-info {
                flex: 1;
            }
            
            .history-condition {
                font-weight: 600;
                margin-bottom: 5px;
            }
            
            .history-confidence {
                font-size: 0.9rem;
                color: var(--gray);
                margin-bottom: 3px;
            }
            
            .history-date {
                font-size: 0.8rem;
                color: var(--gray);
            }
            
            .history-risk {
                padding: 6px 12px;
                border-radius: 15px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .empty-history {
                text-align: center;
                padding: 40px;
                color: var(--gray);
            }
            
            .empty-history i {
                font-size: 3rem;
                margin-bottom: 15px;
                color: var(--primary-light);
            }
            
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                position: relative;
                max-width: 90%;
                max-height: 90%;
            }
            
            .modal-content img {
                max-width: 100%;
                max-height: 90vh;
                border-radius: 10px;
            }
            
            .modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            @media (max-width: 768px) {
                .result-content {
                    grid-template-columns: 1fr;
                }
                
                .history-item {
                    flex-direction: column;
                    text-align: center;
                }
            }
        </style>
        
        <script src="/js/analysis.js"></script>
        <script>
            // 初始化分析功能
            setTimeout(() => {
                if (typeof initializeAnalysis === "function") {
                    initializeAnalysis();
                }
            }, 100);
        </script>
    \`;
}
