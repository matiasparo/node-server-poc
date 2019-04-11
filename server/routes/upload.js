const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const colors = require('colors');
const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');

app.use(fileUpload({
    createParentPath: true,
    useTempFiles: true
}));

app.put('/upload/:tipo/:id', function (req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;


    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "No se ah seleccionado ningún archivo"
                }
            })
    }

    //valida tipo de usuario
    let tiposValidos = ['productos', 'usuarios']
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "Los tipos de upload no son validos"
                }
            })
    }


    let serverFile = req.files.archivo;
    let nameFileArr = serverFile.name.split('.');

    let extension = nameFileArr[nameFileArr.length - 1];

    //extenciones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        //no es valida
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No es una extension valida, debe ser:' + extensionesValidas.join(", ")
            }
        })
    }

    let nameFile = `${id}-${ Date.now() }.${ extension }`;
    serverFile.mv(`uploads/${ tipo }/${ nameFile }`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });

        //la imagen ya esta en el server
        if (tiposValidos[0] == tipo) //si es el tipo valido 0 es producto
            imagenProducto(id, res, nameFile);
        else
            imagenUsuario(id, res, nameFile);



    });
});

function imagenUsuario(id, res, nameFile) {
    User.findById(id, (err, ususarioDB) => {
        if (err) {
            deleteFile(nameFile, 'usuarios');
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!ususarioDB) {
            deleteFile(nameFile, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    msg: "El usuario no Existe"
                }
            });
        }

        deleteFile(ususarioDB.img, 'usuarios');

        ususarioDB.img = nameFile;
        ususarioDB.save((err, userSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        msg: "El usuario no Existe"
                    }
                });
            }

            res.json({
                ok: true,
                usuario: userSave,
                img: nameFile
            })

        });
    })
}

function imagenProducto(id, res, nameFile) {
    Product.findById(id, (err, productDB) => {
        if (err) {
            deleteFile(nameFile, 'productos');
            return res.status(500).json({
                ok: false,
                err: err
            });
        }

        if (!productDB) {
            deleteFile(nameFile, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    msg: "El Producto seleccionado no Existe"
                }
            });
        }

        deleteFile(productDB.img, 'productos');

        productDB.img = nameFile;
        productDB.save((err, productSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        msg: "El Producto no Existe"
                    }
                });
            }

            res.json({
                ok: true,
                producto: productSave,
                img: nameFile
            })

        });
    })
}

function deleteFile(nombreArchivo, tipo) {
    let pathImg = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}


module.exports = app;