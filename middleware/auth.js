const jwt = require("jsonwebtoken");
const { Admin, User } = require("../db");

const JWT_SECRET = "abc"; 


const foradmin = async (req, res, next) => {
    console.log("foradmin middleware called");
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token,process.env.jwtkey);
        
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admin role required." });
        }

        const admin = await Admin.findById(decoded.userId);
        if (!admin) {
            return res.status(401).json({ error: "Invalid token. Admin not found." });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};


const foruser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token,process.env.jwtkey);
        
        if (decoded.role !== "user") {
            return res.status(403).json({ error: "Access denied. User role required." });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "Invalid token. User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};

module.exports = { foradmin, foruser };