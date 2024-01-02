const express=require("express");
const app=express();
const mongoose = require("mongoose");
const session=require("express-session");
const User=require("./model/user");
const Blog=require("./model/blogs");
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'hbs');
app.use(session({
  secret:"qwerty@1234",
}))

function checkisLoggedIn(req,res,next){
  if(req.session.isLoggedIn){
    next();
  }
  else{
    res.redirect("/login");
  }
}
app.get("/",async(req,res)=>{
  const recentBlogs=await Blog.find().limit(5);
  res.render('home',{recentBlogs})
})
app.get("/dashboard",checkisLoggedIn,(req,res)=>{
  res.render("dashboard");
})
app.get("/all",async(req,res)=>{
  const allBlogs=await Blog.find();
  res.render("all",{allBlogs});
})
// app.get("/",(req,res)=>{
//     res.render("home");
// })
app.get("/blog",(req,res)=>{
  res.render("blog");
})
app.post("/blog",async(req,res)=>{
  const {title,body,image}=req.body;
  let newblog=new Blog({title,body,image});
  await newblog.save();
  // res.send("blog added");

  res.redirect("dashboard");

})

app.get("/register",(req,res)=>{
  res.render("register");
})
app.post("/register",async(req,res)=>{
  const {username,password}=req.body;
  let newuser=new User({username,password});
  await newuser.save();
  res.redirect("login");
})
app.get("/login",(req,res)=>{
  res.render("login");
})
app.get("/userblog/:id",async(req,res)=>{
  const blogId=req.params.id;
  const blog= await Blog.findById(blogId);
  res.render("userblog",{blog});

})
app.post("/login",async(req,res)=>{
  const {username,password}=req.body;
  let user=await User.findOne({username});
  if(user){
    if(user.password!=password){
      res.send("Invalid Password");
    }
    else{
      req.session.isLoggedIn=true;
      res.render("dashboard");
    }
  }
  else{
    res.send("User doesn't exist!! Please sign up !");
  }
})
mongoose.connect('mongodb://127.0.0.1:27017/blog-app')
  .then(() => app.listen(4444,()=>{
    console.log("server started");
})
);
