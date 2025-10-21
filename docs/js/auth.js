// 认证相关功能
class Auth {
    constructor() {
        this.isLoggedIn = this.checkLoginStatus();
    }

    // 检查登录状态（不跳转）
    checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const loginTime = localStorage.getItem('loginTime');
        
        if (isLoggedIn && loginTime) {
            const timeDiff = Date.now() - parseInt(loginTime);
            if (timeDiff < 24 * 60 * 60 * 1000) { // 24小时
                return true;
            }
        }
        
        // 不清除状态，只返回false
        return false;
    }

    // 要求登录（会跳转）
    requireLogin() {
        if (!this.isLoggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // 登录
    login(username, password) {
        if (this.validateCredentials(username, password)) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loginTime', Date.now().toString());
            localStorage.setItem('username', username);
            this.isLoggedIn = true;
            return true;
        }
        return false;
    }

    // 验证凭据
    validateCredentials(username, password) {
        const validUsers = {
            'admin': 'admin123',
            'user': 'user123',
            'test': 'test123'
        };
        return validUsers[username] === password;
    }

    // 登出
    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('username');
        this.isLoggedIn = false;
        window.location.href = 'login.html';
    }

    // 获取当前用户
    getCurrentUser() {
        return localStorage.getItem('username');
    }
}

// 创建全局认证实例
const auth = new Auth();
