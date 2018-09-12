const express = require("express");
let { verificaTokens, verificaAdminRole } = require("../middlewares/auth");

let app = express();

let Category = require('../models/category');
let User = require('../models/user');

app.get('/categoria', verificaTokens ,( req, res)=>{
    Category.find({})
    .sort('nombre')
    .populate('usuarioId','nombre email')
    .exec((err, categoriesDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err
            });
        }

      
      res.json({
          ok:true,
          categories: categoriesDB
      });
    });
});

app.get('/categoria/:id', verificaTokens,( req, res)=>{
    let idCategory = req.params.id;
    Category.findById(idCategory, (err, categoryDB)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                err:{
                    message:"no existe ninguna categoria con ese ID"
                }
            });
        }

      
      res.json({
          ok:true,
          category:categoryDB
      });
    })
});

app.post('/categoria', verificaTokens,( req, res)=>{
    let body = req.body;
    let userId = req.usuario._id;

    let category = new Category({
        nombre:body.nombre,
        descripcion:body.descripcion,
        usuarioId:userId
    })

    category.save((err, categoryDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        if(!categoryDB){
            return res.status(400).json({
                ok:false,
                err:{
                    message:"La categoria no pudo ser creada"
                }
            })
        }

        res.json({
            ok:true,
            category:categoryDB
        });
    }); 
});

app.put('/categoria/:id', verificaTokens, ( req, res)=>{
    let idCategory = req.params.id;
    Category.findByIdAndUpdate(idCategory, 
        {nombre:req.body.nombre, descripcion:req.body.descripcion},
        { new:true, runValidators:true }
        , (err, categoryDB) =>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        res.json({
            ok:true,
            category:categoryDB
        });
    });

});

app.delete('/categoria/:id',[verificaTokens,verificaAdminRole], ( req, res)=>{
    let id  = req.params.id;

    if(id){
        Category.findByIdAndRemove(id, (err, categoryDelete)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }   

            if(!categoryDelete){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:'Categoria no encontrada'
                    }
                });
            }

          
            res.json({
                ok:true,
                category:categoryDelete
            });
        })
    }
});


module.exports = app;