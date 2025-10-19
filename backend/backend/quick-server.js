const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// 直接指向public目录
app.use(express.static(path.join(__dirname, "../public")));

app.listen(PORT, "0.0.0.0", () => {
    console.log(" 快速修复服务器启动");
    console.log(" http://localhost:" + PORT);
});
