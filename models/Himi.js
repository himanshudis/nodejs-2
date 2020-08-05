const mongoose=require('mongoose');
let userSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    fullname:String,
    email:String,
    mobile:String,
    city:String,
    password:String
})
module.exports=mongoose.model('Himi',userSchema);