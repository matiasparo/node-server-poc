const mongoose = require('mongoose');
const uniqueValidator  = require('mongoose-unique-validator');
let Schema = mongoose.Schema;

let categorySchema = new Schema({
    nombre:{
        type:String,
        unique:true,
        require:[true,"El nombre es requerido"]
    },
    descripcion:{
        type:String,
        unique:true,
        require:[true,"La descripcion es requerida"]
    },
    usuarioId:{
        type:Schema.Types.ObjectId, ref:'User'
    }
});




categorySchema.plugin(uniqueValidator, {message:'{PATH} debe de ser unico'});

module.exports = mongoose.model( 'Category', categorySchema );
