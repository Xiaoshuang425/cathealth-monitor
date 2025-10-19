const db = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
    static create(userData, callback) {
        const { name, email, password, phone } = userData;
        
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return callback(err);
            
            const sql = `
                INSERT INTO users (name, email, password, phone) 
                VALUES (?, ?, ?, ?)
            `;
            
            db.run(sql, [name, email, hashedPassword, phone || null], function(err) {
                if (err) {
                    if (err.message.includes("UNIQUE constraint failed")) {
                        return callback(new Error("该邮箱已被注册"));
                    }
                    return callback(err);
                }
                
                callback(null, {
                    id: this.lastID,
                    name,
                    email,
                    phone: phone || null
                });
            });
        });
    }

    static findByEmail(email, callback) {
        const sql = "SELECT * FROM users WHERE email = ?";
        
        db.get(sql, [email], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }

    static findById(id, callback) {
        const sql = "SELECT id, name, email, phone, created_at FROM users WHERE id = ?";
        
        db.get(sql, [id], (err, row) => {
            if (err) return callback(err);
            callback(null, row);
        });
    }

    static verifyPassword(plainPassword, hashedPassword, callback) {
        console.log("验证密码:", {
            plainPassword: plainPassword.substring(0, 3) + "***",
            hashedPassword: hashedPassword?.substring(0, 10) + "***"
        });
        
        if (!hashedPassword) {
            return callback(new Error("密码哈希不存在"));
        }
        
        bcrypt.compare(plainPassword, hashedPassword, (err, isMatch) => {
            if (err) {
                console.error("密码比较错误:", err);
                return callback(err);
            }
            console.log("密码匹配结果:", isMatch);
            callback(null, isMatch);
        });
    }
}

module.exports = User;
