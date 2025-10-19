const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "cathealth-secret-key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: "访问令牌缺失" 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                error: "令牌无效" 
            });
        }
        req.user = user;
        next();
    });
};

const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email 
        },
        JWT_SECRET,
        { expiresIn: "24h" }
    );
};

module.exports = {
    authenticateToken,
    generateToken
};
