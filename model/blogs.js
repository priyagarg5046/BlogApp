const mongoose = require("mongoose");
const blogSchema=mongoose.Schema({
    title:String,
    body:String,
    image:String,
})
module.exports=mongoose.model("Blogs",blogSchema);