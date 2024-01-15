const mongoose = require("mongoose");
const userSchema=new mongoose.Schema({
    email:String,
    username:String,
    password:String,
    
   blogs:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Blog",
   }],
   isVerify:{
    type:Boolean,
    default:false,
   },
   isAdmin:{
    type:Boolean , default:false,
}
})
module.exports=mongoose.model("User",userSchema)