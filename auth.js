/**
 * 用戶認證模塊 - 處理登錄、註冊和 Token 管理
 */

const AUTH_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:10002'
    : 'https://cathealth-monitor-fn41.onrender.com';

// Token 存儲鍵名
const TOKEN_KEY = 'cathealth_token';
const USER_KEY = 'cathealth_user';

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
 * 檢查是否已登錄
 */
function isLoggedIn() {
    return !!getToken();
}

/**
 * 發送帶認證的請求
 */
async function authenticatedFetch(url, options = {}) {
    const token = getToken();

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
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
        showLoginModal();
        throw new Error('請先登錄');
    }

    return response;
}

/**
 * 用戶註冊
 */
async function register(email, password, name) {
    const response = await fetch(`${AUTH_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();

    if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
    }

    return data;
}

/**
 * 用戶登錄
 */
async function login(email, password) {
    const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
        setToken(data.token);
        setCurrentUser(data.user);
    }

    return data;
}

/**
 * 登出
 */
function logout() {
    clearToken();
    window.location.href = 'index.html';
}

/**
 * 獲取用戶信息
 */
async function fetchUserInfo() {
    const response = await authenticatedFetch(`${AUTH_API_URL}/api/auth/me`);
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
 * ========== UI 功能 ==========
 */

/**
 * 顯示登錄模態框
 */
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        showAuthTab('login');
    }
}

/**
 * 隱藏登錄模態框
 */
function hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * 切換登錄/註冊標籤
 */
function showAuthTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

/**
 * 處理登錄表單提交
 */
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        errorDiv.textContent = '';
        const result = await login(email, password);

        if (result.success) {
            hideLoginModal();
            updateUIForLoggedInUser();
            // 刷新頁面數據
            if (typeof loadUserData === 'function') {
                loadUserData();
            }
        } else {
            errorDiv.textContent = result.error || '登錄失敗';
        }
    } catch (error) {
        errorDiv.textContent = '網絡錯誤，請稍後再試';
        console.error('Login error:', error);
    }
}

/**
 * 處理註冊表單提交
 */
async function handleRegister(e) {
    e.preventDefault();

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    const errorDiv = document.getElementById('register-error');

    // 驗證密碼
    if (password.length < 6) {
        errorDiv.textContent = '密碼至少需要6個字符';
        return;
    }

    try {
        errorDiv.textContent = '';
        const result = await register(email, password, name);

        if (result.success) {
            hideLoginModal();
            updateUIForLoggedInUser();
            // 刷新頁面數據
            if (typeof loadUserData === 'function') {
                loadUserData();
            }
        } else {
            errorDiv.textContent = result.error || '註冊失敗';
        }
    } catch (error) {
        errorDiv.textContent = '網絡錯誤，請稍後再試';
        console.error('Register error:', error);
    }
}

/**
 * 更新 UI 為登錄狀態
 */
function updateUIForLoggedInUser() {
    const user = getCurrentUser();
    if (!user) return;

    // 更新用戶信息顯示
    const userInfoElements = document.querySelectorAll('.user-info');
    userInfoElements.forEach(el => {
        el.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div>
                <div>${user.name}</div>
                <div style="font-size: 0.8rem; color: var(--gray);">${user.email}</div>
            </div>
        `;
    });

    // 更新歡迎標語
    const welcomeTitle = document.querySelector('.welcome-banner h2');
    if (welcomeTitle) {
        welcomeTitle.innerHTML = `歡迎回來，${user.name}！`;
    }

    // 隱藏登錄按鈕，顯示登出按鈕
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
}

/**
 * 更新 UI 為未登錄狀態
 */
function updateUIForGuest() {
    // 顯示登錄按鈕，隱藏登出按鈕
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    if (loginBtn) loginBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
}

/**
 * 檢查登錄狀態並更新 UI
 */
async function checkAuthStatus() {
    if (isLoggedIn()) {
        try {
            // 驗證 token 是否有效
            const result = await fetchUserInfo();
            if (result.success) {
                setCurrentUser(result.user);
                updateUIForLoggedInUser();
                return true;
            } else {
                clearToken();
                updateUIForGuest();
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            updateUIForGuest();
            return false;
        }
    } else {
        updateUIForGuest();
        return false;
    }
}

/**
 * 初始化認證模塊
 */
function initAuth() {
    // 綁定表單事件
    const loginForm = document.getElementById('login-form-element');
    const registerForm = document.getElementById('register-form-element');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 綁定標籤切換
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    if (loginTab) {
        loginTab.addEventListener('click', () => showAuthTab('login'));
    }

    if (registerTab) {
        registerTab.addEventListener('click', () => showAuthTab('register'));
    }

    // 綁定關閉按鈕
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideLoginModal);
    }

    // 綁定登出按鈕
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // 綁定登錄按鈕
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', showLoginModal);
    }

    // 檢查登錄狀態
    checkAuthStatus();
}

// 頁面加載時初始化
document.addEventListener('DOMContentLoaded', initAuth);
