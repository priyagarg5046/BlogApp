require("dotenv").config();
const express=require("express");
const session=require("express-session");
const app=express();
const mongoose = require("mongoose");
app.use(session({
  secret: 'keyboard cat',
  // resave: false,
  // saveUninitialized: true,
  
}))
const PORT=process.env.PORT || 4444;
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'hbs');

app.use("/blog.it",require("./router/blogs"))
mongoose.connect('mongodb://127.0.0.1:27017/blog-app')
  .then(() => app.listen(PORT,()=>{
    console.log("server started at "+PORT);
})
);