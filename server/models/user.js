const mongoose = require("mongoose");
const uniqueValidator  = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let validRole = {
    values:['ADMIN_ROLE','USER_ROLE'],
    message:'{VALUE} no es un rol válido'
}


let userSchema = new Schema({
    nombre:{
        type:String,
        require:[true,'El nombre es requerido']
    },
    email:{
        type:String,
        required:[true, 'El correo es requerido'],
        unique:true
    },
    password:{
        type:String,
        required:[true, 'La contraseña es obligatoria']
    },
    img:{
        type:String,
        required:false
    },
    role:{
        type:String,
        required:true,
        default:'USER_ROLE',
        enum:validRole
    },
    estado:{
        type:Boolean,
        default:true
    },
    google:{
        type:Boolean,
        required:false
    }
});


userSchema.methods.toJSON = function(){
    let _user = this;
    let userObject = _user.toObject();
    delete userObject.password;

    return userObject;
}


userSchema.plugin(uniqueValidator, {message:'{PATH} debe de ser unico'});

module.exports = mongoose.model( 'User', userSchema );