const express= require("express");
const mongoose=require("mongoose");
const path = require("path");
const db=require("./db");
const router1= require("./router/signup");
const router2= require("./router/signin");
const routes3 = require("./router/protected");
const app=express();


app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, email, password');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use("/signup",router1);
app.use("/signin",router2);
app.use("/", routes3);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(3000,function(){
    console.log("listening to port");
});