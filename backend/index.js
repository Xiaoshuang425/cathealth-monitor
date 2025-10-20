const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// ????
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "CatHealth API ????" });
});

// ?? API
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    const users = [
        { email: "jiaminpan4@gmail.com", password: "091103ka", name: "????" },
        { email: "jiaminpan@gmail.com", password: "123456", name: "????" }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({
            success: true,
            message: "????",
            user: {
                name: user.name,
                email: user.email
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: "???????"
        });
    }
});

module.exports = app;
