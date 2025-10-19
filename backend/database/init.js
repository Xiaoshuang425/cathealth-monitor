const db = require("../config/database");

const initDatabase = () => {
    console.log(" 开始初始化数据库...");
    
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createUsersTable, (err) => {
        if (err) {
            console.error(" 创建用户表失败:", err);
        } else {
            console.log(" 用户表创建成功");
        }
    });
};

if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
