const jwt = require('jsonwebtoken');

//VERIFICAR TOKENS
let verificaTokens = (req, res, next)=>{

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded)=>{

        if(err){
            return res.status(401).json({
                ok:false,
                err:{
                    message:"Token no válido"
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });   

};

//VERIFICA ROL USUARIO 
let verificaAdminRole = (req, res, next)=>{
    let user = req.usuario;

    if(user.role === "ADMIN_ROLE" ){
        next();
    }else{
        return res.status(401).json({
            ok:false,
            err:{
                message:"No tiene los permisos necesarios para esta seccion"
            }
        });
    }
};

module.exports = {
    verificaTokens,
    verificaAdminRole
}