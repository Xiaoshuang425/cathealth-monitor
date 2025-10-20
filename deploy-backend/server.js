// ???? Express ??? - ??????
console.log("?? CatHealth ?????...");

const express = require("express");
const app = express();

// ???? CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.use(express.json());

// ????
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
});

// ????
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    if (email === "jiaminpan4@gmail.com" && password === "091103ka") {
        res.json({ 
            success: true, 
            message: "????", 
            user: { name: "????", email: email } 
        });
    } else if (email === "jiaminpan@gmail.com" && password === "123456") {
        res.json({ 
            success: true, 
            message: "????", 
            user: { name: "????", email: email } 
        });
    } else {
        res.status(401).json({ success: false, error: "???????" });
    }
});

// ???
app.get("/", (req, res) => {
    res.json({ message: "CatHealth Backend API - ?????" });
});

// ?????
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log("???????? " + port);
});
