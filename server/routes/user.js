const express = require('express');
const _ = require('underscore');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { verificaTokens,verificaAdminRole } = require('../middlewares/auth');
const app = express();

  app.get('/usuario', verificaTokens,function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);



    User.find({estado:true},'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }
            User.count({estado:true},(err, conteo)=>{
                res.json({
                    ok:true,
                    usuarios,
                    cuantos:conteo
                });
            })
        });
    
  });
   
  app.post('/usuario',[verificaTokens,verificaAdminRole], function (req, res)
  {
      let body = req.body;

        let user = new User({
            nombre:body.nombre,
            email:body.email,
            password: bcrypt.hashSync(body.password, 10),
            role:body.role
        });
        user.save((err, userDB)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

            userDB.password = null;
            res.json({
                ok:true,
                user:userDB
            });
        }); 
  })
  
  app.put('/usuario/:id',[verificaTokens,verificaAdminRole], function (req, res) {
      let id = req.params.id;
      let body = _.pick(req.body,['nombre','email','img','role','estado']);

      User.findByIdAndUpdate(id, body, {new:true, runValidators:true},(err, usuarioDB)=>{

            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }

          
          res.json({
              ok:true,
              usuario:usuarioDB
          });
      });


  })
  
  app.delete('/usuario/:id',[verificaTokens,verificaAdminRole], function (req, res) {

    let id  = req.params.id;

    if(id){
        User.findByIdAndUpdate(id,{estado:false}, (err, userDelete)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    err
                });
            }   

            if(!userDelete){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'Usuario no encontrado'
                    }
                });
            }

          
            res.json({
                ok:true,
                usuario:userDelete
            });
        })
    }


      
  })

  
  module.exports = app;