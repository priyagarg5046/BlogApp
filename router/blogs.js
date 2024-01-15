const express=require("express");
const router=express.Router();
// const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto=require("crypto");
const sendEmail=require("../utils/mailer");
const User=require("../model/user");
const Blog=require("../model/blog");
const Token=require("../model/token")
const session=require("express-session");

function checkisLoggedIn(req,res,next){
  if(req.session.isLoggedIn){
    next();
  }
  else{
    res.redirect("/login");
  }
}
router.get("/",async(req,res)=>{
    const recentBlogs=await Blog.find().limit(5);
    res.render('home',{recentBlogs})
  })
  router.get("/dashboard",checkisLoggedIn,(req,res)=>{
    if(req.session.user.isAdmin){
      res.render("dashboard");
    }
    
  })
  router.get("/login",(req,res)=>{
    res.render("login");
  })
  router.post("/login",async(req,res)=>{

    const {username,password}=req.body;
    let user=await User.findOne({username:username});
    if(user){
      
      if(user.isVerify==false){
        return res.send("You are not verified,Please verify your mail")
      }
     
     if (!bcrypt.compareSync(password,user.password)) {
       return res.send(`
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #f8f9fa;
          }
      
          .error-container {
            text-align: center;
            padding: 20px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            border-radius: 5px;
            margin: 20px;
          }
      
          a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
        <div class="error-container">
          <p>Invalid Password</p>
          <p><a href="/login">Login</a></p>
        </div>
      `)
      }
      req.session.isLoggedIn=true;
      req.session.user=user;
      // req.session.save();
      if (user.isAdmin === true) {
        res.render("dashboard");
      } else {
        const recentBlogs = await Blog.find().limit(5);
        return res.render("home2", { user, recentBlogs });
      }
    } else {
      res.send("User doesn't exist!! Please sign up!");
    }
    //   if(user.isAdmin==true){
    //     req.session.isLoggedIn=true;
    //     req.session.user=user;
    //     req.session.save();
    //     res.render("dashboard");
    // } else {
        
    //     req.session.save();
    //     const recentBlogs=await Blog.find().limit(5);
    //     return res.render("home2",{user,recentBlogs});
    // }
    // }
    // else{
    //  res.send("User doesn't exist!! Please sign up !");
    // }
  })
  router.post("/blog",async(req,res)=>{
    const {title,body,image}=req.body;
    const user = await User.findById({_id:req.session.user._id});
    const newblog=new Blog({title,body,image,user:user._id});
    if(user.isAdmin){
      newblog.isVerified=true;
      await newblog.save();
      res.redirect("dashboard");
    }
    await newblog.save();
    // let user = await User.findOne({_id:req.session.user._id})
    user.blogs.push(newblog._id);
    await user.save();

    // res.send("blog added");

    res.session.isLoggedIn=true;
    res.render("home2",{user});
  
  
  })
 
  router.get("/all",async(req,res)=>{
    const blogs=await Blog.find().populate("user");
    res.render("all",{blogs});
  })
  router.get("/blog",(req,res)=>{
    res.render("blog");
  })
  router.get('/myblog', async (req, res) => {
    console.log(req.session.isLoggedIn);
   
    const user = await User.findOne({ _id:req.session.user._id }).populate("blogs").exec();
    res.render('myblog', { blogs: user.blogs, user: user });
    
    
   });
 
  router.get("/approvals",async(req,res)=>{
    const UBlogs= await Blog.find({isVerified:false});
    // console.log(UBlogs._id);
    res.render("approvals",{UBlogs})
  })
  router.get("/approve/:id",async(req,res)=>{
    const blogId=req.params.id;
    const verfiedBlog=await Blog.findById(blogId);
    verfiedBlog.isVerified=true;
    await verfiedBlog.save();
    res.render("approvals");
  })
  router.get("/reject/:id",async(req,res)=>{
    await Blog.findByIdAndDelete(req.params.id);
    res.render("approvals");
  })
  router.get("/register",(req,res)=>{
    res.render("register");
  })
  router.post("/register",async(req,res)=>{
    const {email,username,password}=req.body;
    bcrypt.hash(password,saltRounds).then(async function(hash){
      let newuser=new User({username,email,password:hash});
      await newuser.save();
      let newtoken=await new Token({userId: newuser._id, 
        token: crypto.randomBytes(32).toString("hex")}).save();
      const message=`${process.env.BASE_URL}/verify/${newuser.id}/${newtoken.token}`;
      await sendEmail(newuser.email, "Verify Email for blog.it", message);
      res.send(`<style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
      }
    
      h1 {
        color: #343a40;
        text-align: center;
        padding: 2rem 0;
        margin: 0;
        border-bottom: 1px solid #dee2e6;
      }
    
      p {
        color: #6c757d;
        text-align: center;
        padding: 1rem 0;
      }
    
      a {
        color: #007bff;
        text-decoration: none;
      }
    </style>
    <h1>Verify your email</h1>
    <p>Please click the link sent to your email to complete your account setup.
    If you haven't received the email yet, please wait for a moment.</p>
    <p><a href="/login">Login now</a></p>`);
      // res.redirect("login");
    })
  })

  router.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.render("home"); // Redirect to the login page after logout
    });
  });
  
  router.get("/verify/:id/:token", async (req, res) => {
    // console.log("Verification route accessed");
    const { id } = req.params;
    // console.log("User ID:", id);
  
    let user = await User.findOne({ _id: id });
    // console.log("User:", user);
  
    if (!user) return res.status(400).send("Invalid link");
  
    let token = await Token.findOne({ userId: id, token: req.params.token });
    // console.log("Token:", token);
  
    if (!token) return res.status(400).send("Invalid link");
  
    user.isVerify = true;
    await user.save();
    await Token.findByIdAndDelete(token._id);
  
    res.redirect("/");
  });



  
  router.get("/userblog/:id",async(req,res)=>{
    const blogId=req.params.id;
    const blog= await Blog.findById(blogId);
    res.render("userblog",{blog});
  
  })

module.exports=router;