async function analyzeImage() {
    if (!currentImageFile) {
        alert('请先选择图片！');
        return;
    }
    
    const analyzeBtn = document.querySelector('.btn-analyze');
    const originalText = analyzeBtn.innerHTML;
    
    try {
        analyzeBtn.innerHTML = '<span class="loading"></span> 分析中...';
        analyzeBtn.disabled = true;
        
        console.log("原始文件大小:", currentImageFile.size, "bytes");
        
        // 压缩图片
        const compressedImage = await compressImage(currentImageFile);
        console.log("压缩后大小:", compressedImage.length, "bytes");
        
        // 发送到后端进行分析
        const response = await fetch('/api/analysis/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                image: compressedImage,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('分析请求失败: ' + response.status);
        }
        
        const result = await response.json();
        displayAnalysisResult(result);
        
    } catch (error) {
        console.error('分析错误:', error);
        alert('分析失败：' + error.message);
    } finally {
        analyzeBtn.innerHTML = originalText;
        analyzeBtn.disabled = false;
    }
}

// 图片压缩函数
function compressImage(file, quality = 0.7, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // 计算缩放比例
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为压缩的base64
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}
