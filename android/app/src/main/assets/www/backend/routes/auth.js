const express = require("express");
const User = require("../models/user");
const { generateToken, authenticateToken } = require("../middleware/auth");

const router = express.Router();

// 用户注册
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        console.log("注册请求:", { name, email, password: password ? "***" : "empty", phone });

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "请填写姓名、邮箱和密码" 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: "密码长度至少6位" 
            });
        }

        User.create({ name, email, password, phone }, (err, user) => {
            if (err) {
                console.error("注册错误:", err);
                return res.status(400).json({ 
                    success: false,
                    error: err.message 
                });
            }

            console.log("注册成功:", user);

            const token = generateToken(user);

            res.status(201).json({
                success: true,
                message: "注册成功",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                },
                token
            });
        });

    } catch (error) {
        console.error("注册异常:", error);
        res.status(500).json({ 
            success: false,
            error: "服务器错误" 
        });
    }
});

// 用户登录
router.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("登录请求:", { email, password: password ? "***" : "empty" });

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: "请填写邮箱和密码" 
            });
        }

        User.findByEmail(email, (err, user) => {
            if (err) {
                console.error("查找用户错误:", err);
                return res.status(500).json({ 
                    success: false,
                    error: "服务器错误" 
                });
            }

            console.log("找到用户:", user ? "是" : "否");

            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    error: "邮箱或密码错误" 
                });
            }

            User.verifyPassword(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error("密码验证错误:", err);
                    return res.status(500).json({ 
                        success: false,
                        error: "服务器错误" 
                    });
                }

                console.log("密码匹配:", isMatch);

                if (!isMatch) {
                    return res.status(401).json({ 
                        success: false,
                        error: "邮箱或密码错误" 
                    });
                }

                const token = generateToken(user);

                console.log("登录成功:", user.email);

                res.json({
                    success: true,
                    message: "登录成功",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone
                    },
                    token
                });
            });
        });

    } catch (error) {
        console.error("登录异常:", error);
        res.status(500).json({ 
            success: false,
            error: "服务器错误" 
        });
    }
});

// 获取当前用户信息
router.get("/me", authenticateToken, (req, res) => {
    User.findById(req.user.id, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ 
                success: false,
                error: "用户不存在" 
            });
        }

        res.json({
            success: true,
            user
        });
    });
});

module.exports = router;
