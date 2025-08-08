require('dotenv').config()
const express=require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Admin, User } = require("../db");
const router=express.Router();


const key = process.env.jwtkey;
const key1="abc";
router.post("/admin", async function(req, res) {
    try {
        const email = req.headers.email;
        const password = req.headers.password;
        
        const admin = await Admin.findOne({ email: email });
        
        if (admin) {
            const pass= await bcrypt.compare(password,admin.password);
            if (pass) {
                const token = jwt.sign(
                    { 
                        userId: admin._id, 
                        email: admin.email, 
                        role: "admin" 
                    }, 
                    key, 
                    { expiresIn: "24h" }
                );
                
                res.status(200).json({ 
                    msg: "login successful", 
                    token: token,
                    user: {
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        role: "admin"
                    }
                });
            } else {
                res.status(401).json({ msg: "password is incorrect" });
            }
        } else {
            res.status(404).json({ err: "User doesn't exist." });
        }
    } catch (error) {
        res.status(500).json({ err: "Server Error" });
    }
});


router.post("/user", async function(req, res) {
    try {
        const email = req.headers.email;
        const password = req.headers.password;
        
        const user = await User.findOne({ email: email });
        console.log(user.email);
        console.log(user.password);
        
        if (user) {
            const pass = await bcrypt.compare(password, user.password);
            if (pass) {
              
                const token = jwt.sign(
                    { 
                        userId: user._id, 
                        email: user.email, 
                        role: "user" 
                    }, 
                    key, 
                    { expiresIn: "24h" }
                );
                
                res.status(200).json({ 
                    msg: "login successful", 
                    token: token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: "user"
                    }
                });
            } else {
                res.status(401).json({ msg: "password is incorrect" });
            }
        } else {
            res.status(404).json({ err: "User doesn't exist." });
        }
    } catch (error) {
        res.status(500).json({ err: "Server Error" });
    }
});

router.get("/admin", async function(req, res) {
    try {
        const email = req.query.email; 
        console.log("Searching for email:", email);
        
        const admin = await Admin.findOne({ email: email });
        console.log("Admin found:", admin);
        
        if (admin) {
            res.json({ message: "Admin found", admin: admin });
        } else {
            res.status(404).json({ message: "Admin not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/user", async function(req, res) {
    try {
        const email = req.query.email; 
        
        const user = await User.findOne({ email: email });
        console.log("User found:", user);
        
        if (user) {
            res.json({ message: "User found", user: user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports= router;