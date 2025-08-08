const express=require("express");
const bcrypt=require("bcryptjs");
const { z } = require("zod");
//const db=require("../db");
const { Admin, User, Course } = require("../db");
const router=express.Router();

const validate=z.object({
    name:z.string().min(1,"Atleast one character"),
    email:z.string().email(),
    password:z.string().min(6,"password should be atleast 6 characters")
});

router.post("/admin", async function(req, res) {
    try {
        const { name, email, password } =validate.parse(req.body);

        const existingAdmin = await Admin.findOne({ email: email });
        
        if (existingAdmin) {
            return res.status(400).json({ err: "User already exists" });
    }
        const hash = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
        name,
        email,
            password: hash
        });
        
        res.status(200).json({ msg: "admin created successfully" });
    } catch (error) {
        res.status(500).json({ err: "Server Error" });
}
});


router.post("/user", async function(req, res) {
    try {
        const { name, email, password } = validate.parse(req.body);

        const exist = await User.findOne({ email: email });
        
        if (exist) {
            return res.status(400).json({ err: "User already exists" });
   }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
       name,
       email,
            password: hash,
        });
        
        res.status(200).json({ msg: "user created successfully" });
    } catch (error) {
        res.status(500).json({ err: "Server Error" });
}
});



module.exports = router;