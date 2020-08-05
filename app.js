const express=require("express");
const bodyparser=require('body-parser');
const multer=require('multer')
const crypto=require('crypto');
const key='password';
const algo='aes256';
const jwt=require('jsonwebtoken');
const jwtkey='jwt';
const nodemailer=require('nodemailer');
const connection=require('./models/Himi');
const ejs=require('ejs');
const MailMessage = require("nodemailer/lib/mailer/mail-message");
const mongoose=require('mongoose');
const { stringify } = require("querystring");
var app=express();
app.use(express.json());


//app.use(express.urlencoded({extended:false}))
var encoder=bodyparser.urlencoded({
    extended:false
})

mongoose.connect('mongodb://localhost:27017',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'Himi',
});

app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/login',function(req,res){
    dat={

    }
   res.render('login',{dat});
})

app.post('/login',encoder,function(req,res){
    console.log(req.body);
    var cipher=crypto.createCipher(algo,key);
    var encrypted=cipher.update(req.body.password,'utf8','hex')
    +cipher.final('hex');
    console.log(encrypted)
    k=Abc(req.body,encrypted);
    console.log("check "+k)
    res.redirect('/front');
    
})

app.get('/log',function(req,res){
    res.render('log');
})

app.post('/check',encoder,function(req,res){
    console.log(req.body.email)
    connection.findOne({email:req.body.email}).then((result)=>{
        const dicipher=crypto.createDecipher(algo,key);
        const decrypt=dicipher.update(result.password,'hex','utf8')+dicipher.final('utf8');
        console.log("pass "+decrypt);
        if(decrypt==req.body.password)
        {
            const token=jwt.sign({
               email:req.body.email,
               password:req.body.password 
            },jwtkey);
            console.log(token);
            res.set('authorization',token);
            res.json({token:token}).then(()=>{
                res.redirect('./front');
            });
            
            //mails(req.body.email);
        }
        else{
            res.send("wrong user");
        }
        res.redirect('/front');
    })
})

app.get('/front',verifytoken,function(req,res){
    connection.find({},(error,user)=>{
        if(error){
            console.log("error"+error);
        }
        else{
            res.render('front',{user})
            //console.log(user);
        }
    })
})

app.get('/edit/:id',function(req,res){
    console.log(req.params.id)
   connection.findById({_id:req.params.id},(err,dat)=>{
       if(err){
           console.log("error1"+err);
       }
       else{
           res.render('login',{dat})
       }
   })
})

app.post('/edit/:id',function(req,res){
    console.log(req.params.id)
   connection.findByIdAndUpdate(req.params.id,{
        fullname:req.body.fullname,
        email:req.body.email,
        mobile:req.body.mobile,
        city:req.body.city,
        password:req.body.password 
   },(err,dat)=>{
       if(err){
           console.log("error1"+err);
       }
       else{
           res.redirect('/front')
       }
   })
})

app.get('/show/:id',function(req,res){
    console.log(req.params.id)
   connection.findById({_id:req.params.id},(err,dat)=>{
       if(err){
           console.log("error1"+err);
       }
       else{
           res.render('show',{dat})
       }
   })
})

app.get('/delete/:id',function(req,res){
    connection.findOneAndDelete({_id:req.params.id},(err)=>{
        if(err){
            console.log(err);
        }
        else{
            res.redirect('../front')
        }
    })
})

function Abc(a,encrypted){
   console.log(encrypted);
    const data=new connection({
        _id:new mongoose.Types.ObjectId(),
        fullname:a.fullname,
        email:a.email,
        mobile:a.mobile,
        city:a.city,
        password:encrypted
    })
    data.save().then((result)=>{
        res.status(200).json({result})
    })
    .catch(err=>console.log(err));
}

function mails(emailid){
    var transport=nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:587,
        secure:false,
        requireTLS:true,
        auth:{
            user:'',
            pass:''
        }
    })
    var mailoption={
        from:'',
        to:JSON.stringify(emailid),
        subject:'nothing',
        text:'hello'
    }
    transport.sendMail(mailoption,function(error,info){
        if(error){
            console.log("error occured"+error);
        }
        else{
            console.log(info.response);
        }
    })
}

function verifytoken(req,res,next){
    var bearerHeaders=req.headers['authorization'];
   // var token=req.body.token;
   // console.log("body "+token);
    console.log("i  "+bearerHeaders)
    if(typeof bearerHeaders!=='undefined')
    {  
        const bearer=bearerHeaders.split(' ');
        token=bearer[1];
        const tok=jwt.verify(token,jwtkey);
        req.userdata=tok;
        next();
    }
    else{
        res.send("token not provided" +bearerHeaders);

    }
}
connection.find({},(error,user)=>{
    if(error){
        console.log("error"+error);
    }
    else{
        console.log(user);
    }
})
app.listen(4500);