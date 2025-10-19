const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "..", "database", "cathealth.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(" 数据库连接失败:", err.message);
    } else {
        console.log(" 已连接到SQLite数据库");
        db.run("PRAGMA foreign_keys = ON");
    }
});

module.exports = db;
