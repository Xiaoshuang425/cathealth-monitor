/**
 * API 認證模塊 - 處理後端 API 調用
 * 注意：登錄/註冊 UI 在 index.html 中處理
 */

// 始終使用 Render 後端
const AUTH_API_URL = 'https://cathealth-monitor-fn41.onrender.com';

// Token 存儲鍵名
const TOKEN_KEY = 'cathealth_token';
const USER_KEY = 'currentUser';  // 與 index.html 保持一致

/**
 * 獲取存儲的 Token
 */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * 設置 Token
 */
function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 清除 Token
 */
function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * 獲取當前用戶信息
 */
function getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * 設置當前用戶
 */
function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 發送帶認證的請求
 */
async function authenticatedFetch(url, options = {}) {
    const token = getToken();

    // 如果沒有 token，重定向到登錄頁
    if (!token) {
        window.location.href = 'index.html';
        throw new Error('請先登錄');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    // 合併選項
    const finalOptions = {
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(url, finalOptions);

    // 處理 401 未授權
    if (response.status === 401) {
        clearToken();
        window.location.href = 'index.html';
        throw new Error('登錄已過期，請重新登錄');
    }

    return response;
}

/**
 * ========== 貓咪 API ==========
 */

/**
 * 獲取所有貓咪
 */
async function getCats() {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/cats`);
    return await response.json();
}

/**
 * 創建貓咪
 */
async function createCat(catData) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/cats`, {
        method: 'POST',
        body: JSON.stringify(catData)
    });
    return await response.json();
}

/**
 * 更新貓咪
 */
async function updateCatAPI(catId, catData) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/cats/${catId}`, {
        method: 'PUT',
        body: JSON.stringify(catData)
    });
    return await response.json();
}

/**
 * 刪除貓咪
 */
async function deleteCatAPI(catId) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/cats/${catId}`, {
        method: 'DELETE'
    });
    return await response.json();
}

/**
 * ========== 健康記錄 API ==========
 */

/**
 * 獲取健康記錄
 */
async function getHealthRecords(catId = null) {
    let url = `${AUTH_API_URL}/api/health-records`;
    if (catId) {
        url += `?cat_id=${catId}`;
    }
    const response = await authenticatedFetch(url);
    return await response.json();
}

/**
 * 創建健康記錄
 */
async function createHealthRecord(recordData) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/health-records`, {
        method: 'POST',
        body: JSON.stringify(recordData)
    });
    return await response.json();
}

/**
 * 刪除健康記錄
 */
async function deleteHealthRecord(recordId) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/health-records/${recordId}`, {
        method: 'DELETE'
    });
    return await response.json();
}

/**
 * ========== 統計 API ==========
 */

/**
 * 獲取統計數據
 */
async function getStats() {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/stats`);
    return await response.json();
}

/**
 * 更新用戶信息
 */
async function updateUserInfo(name, email) {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/auth/update`, {
        method: 'PUT',
        body: JSON.stringify({ name, email })
    });
    return await response.json();
}

/**
 * 獲取用戶信息
 */
async function fetchUserInfo() {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/auth/me`);
    return await response.json();
}
