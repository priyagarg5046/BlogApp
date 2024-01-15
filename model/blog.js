const mongoose = require("mongoose");
const blogSchema=mongoose.Schema({
    title:String,
    body:String,
    image:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isVerified:{type:Boolean,default:false},
    // category:String,
})
module.exports=mongoose.model("Blog",blogSchema);