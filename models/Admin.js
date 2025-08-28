const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema({

    fullname:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    contactNo:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['superAdmin','moderator','analyst'],
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isOnline:{
        type:Boolean,
        default:false
    }
})

const Admin = mongoose.model("admin",adminSchema);
module.exports=Admin;