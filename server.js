const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('./db.sqlite');

// login
app.post('/api/login',(req,res)=>{
    const {phone} = req.body;

    db.get("SELECT * FROM users WHERE phone=?", [phone], (err,user)=>{
        if(user) return res.json(user);

        let role="client";
        if(phone==="111") role="admin";
        if(phone==="222") role="master";

        db.run("INSERT INTO users(phone,role) VALUES(?,?)",[phone,role],function(){
            res.json({id:this.lastID, phone, role});
        });
    });
});

// create appointment
app.post('/api/appointments',(req,res)=>{
    const {phone,service,date} = req.body;

    db.run(
        "INSERT INTO appointments(phone,service,date,master) VALUES(?,?,?,?)",
        [phone,service,date,"Алексей"],
        ()=> res.json({ok:true})
    );
});

// admin all
app.get('/api/appointments',(req,res)=>{
    db.all("SELECT * FROM appointments",(err,rows)=>{
        res.json(rows);
    });
});

// master
app.get('/api/master/:name',(req,res)=>{
    db.all("SELECT * FROM appointments WHERE master=?", [req.params.name], (err,rows)=>{
        res.json(rows);
    });
});

app.listen(3000,()=>console.log("http://localhost:3000"));
