// 自动修复displayAnalysisResult函数
function fixDisplayAnalysisResult() {
    if (typeof window.displayAnalysisResult !== 'function') {
        console.log('❌ displayAnalysisResult函数不存在');
        return;
    }
    
    // 保存原始函数（如果需要）
    if (typeof window.originalDisplayAnalysisResult === 'undefined') {
        window.originalDisplayAnalysisResult = window.displayAnalysisResult;
    }
    
    // 覆盖函数
    window.displayAnalysisResult = function(result) {
        console.log('🔧 使用修复版displayAnalysisResult');
        
        if (!result) {
            console.error('分析结果为空');
            return;
        }
        
        try {
            const resultArea = document.getElementById('result-area');
            const riskLevel = document.getElementById('risk-level');
            const riskTitle = document.getElementById('risk-title');
            const riskDesc = document.getElementById('risk-desc');
            
            if (!resultArea || !riskLevel || !riskTitle || !riskDesc) {
                console.error('找不到DOM元素');
                return;
            }
            
            // 使用新的数据结构
            riskLevel.className = 'risk-level ' + (result.risk_level || 'unknown');
            riskTitle.textContent = result.condition || '分析完成';
            riskDesc.textContent = result.advice || '基于AI分析';
            
            document.getElementById('color-result').textContent = result.detections?.[0]?.color || '未检测';
            document.getElementById('texture-result').textContent = result.detections?.[0]?.texture || '未检测';
            document.getElementById('shape-result').textContent = result.detections?.[0]?.shape || '未检测';
            document.getElementById('confidence-result').textContent = 
                result.confidence ? (result.confidence * 100).toFixed(1) + '%' : '0%';
            document.getElementById('recommendation-content').innerHTML = 
                '<p>' + (result.advice || '暂无建议') + '</p>';
            
            resultArea.classList.remove('hidden');
            
            console.log('✅ 分析结果显示成功');
            
        } catch (error) {
            console.error('显示错误:', error);
        }
    };
    
    console.log('✅ displayAnalysisResult函数已修复');
}

// 页面加载后自动修复
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixDisplayAnalysisResult);
} else {
    fixDisplayAnalysisResult();
}

// 也修复analyzeImage函数
function fixAnalyzeImage() {
    if (typeof window.analyzeImage !== 'function') return;
    
    const originalAnalyzeImage = window.analyzeImage;
    window.analyzeImage = async function() {
        console.log('🔧 使用修复版analyzeImage');
        try {
            await originalAnalyzeImage.apply(this, arguments);
        } catch (error) {
            console.error('分析错误:', error);
        }
    };
    
    console.log('✅ analyzeImage函数已修复');
}
fixAnalyzeImage();
