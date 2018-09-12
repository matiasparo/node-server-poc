const express = require("express");
let { verificaTokens } = require("../middlewares/auth");

let app = express();
let Product = require('../models/product');
let Category = require('../models/category');


app.get('/productos',verificaTokens,(req,res)=>{
    //trae todos los productos
    //populate:usurio categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);


    Product.find({disponible:true})
    .skip(desde)
    .limit(limite)
    .populate("usuario", "nombre email")
    .populate("categoria", "nombre")
    .exec((err, productDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        
        res.json({
            ok:true,
            productos: productDB
        })


    });


})

app.get('/productos/:id',verificaTokens, (req,res)=>{
    //populate: usuario categoria
    let idProduct = req.params.id;
    Product.findById(idProduct)
    .populate("usuario", "nombre email")
    .populate("categoria", "nombre")
    .exec((err, productDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }
        if(!productDB){
            return res.status(400).json({
                ok:false,
                err:{
                    msg:"ID de producto no existe"
                }
            })
        }

        res.json({
            ok:true,
            product:productDB
        });
    });
});

app.get('/productos/buscar/:termino', verificaTokens, (req, res)=>{

    let termino = req.params.termino;
    let regExp = new RegExp(termino, 'i');

    Product.find({nombre:regExp})
    .populate("categoria", "nombre")
    .exec((err, products)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            });
        }

        res.json({
            ok:true,
            products
        });
        
    })


})

app.post('/productos', verificaTokens,(req,res)=>{
    //grabar usuario
    //grabar una categoria del listado
    
    let body = req.body;
    let userId = req.usuario._id;
    
    Category.findOne({nombre:body.categoria}, (err, categoryDB)=>{

        if(err){
            return json.status(500).json({
                ok:false,
                err
            });
        }


        if(!categoryDB){
            return json.status(400).json({
                ok:false,
                msg:"La categoria indicada no exite en el sistema"
            })
        }
        
        let product = new Product({
            nombre: body.nombre,
            precioUni: body.precioUni,
            descripcion: body.descripcion,
            disponible: body.disponible || true,
            categoria: categoryDB._id,
            usuario: userId
        });


        product.save((err, productDB)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
    
            if(!productDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        message:"El producto no pudo ser creado!"
                    }
                })
            }
    
            res.json({
                ok:true,
                producto:productDB
            });
        });
    
    });

});

app.put('/productos/:id', verificaTokens,(req,res)=>{
    let idProduct = req.params.id;

    let productUpdate = { 
        nombre:req.body.nombre,
        precioUni:req.body.precioUni,
        descripcion:req.body.descripcion
    }
        

    Product.findByIdAndUpdate(idProduct, productUpdate,{ new:true, runValidators:true },
        (err, productDB) =>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }
    
            if(!productUpdate){
                return res.status(400).json({
                    ok:false,
                    err:{
                        msg:"El ID del producto no existe"
                    }
                })
            }
            res.json({
                ok:true,
                product:productDB
            });
        
        }
    );
    
});

//TODO: cambiar categoria
app.delete('/productos/:id', verificaTokens, (req,res)=>{
    //poner producto no disponible
    let idProduct = req.params.id;

    let productUpdate = { 
        disponible:false
    }
        

    Product.findByIdAndUpdate(idProduct, productUpdate,{ new:true, runValidators:true },
        (err, productDB) =>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    err
                });
            }

            if(!productDB){
                return res.status(400).json({
                    ok:false,
                    err:{
                        msg:"ID de producto no existe"
                    }
                })
            }
    
            res.json({
                ok:true,
                message:"Producto Borrado"        
            });
        
        }
    );

});

module.exports = app;