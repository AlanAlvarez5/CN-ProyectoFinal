import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)


const router = express.Router()

const db = require('../db');

async function delete_img(id) {
    let old_img = await db.query(`SELECT imagen from producto where id = ${id}`);
    old_img = old_img[0].imagen
    await unlinkAsync('uploads/products/'+old_img) 
}

router.get('/select', async (req, res) => {
    try{
        let productos = await db.query(`SELECT * from producto`);
        res.json(productos)
    }
    catch (error){
        return res.status(400).json({
            mensaje: 'Query Error',
            error
        });
    }
});

router.use((req, res, next) => {
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, req.app.get('llave'), (err, decoded) => {
            if (err) {
                return res.json({mensaje: 'Token invalido'});
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else{
        res.send({
            mensaje: 'Token no enviado'
        });
    }
});

router.get('/select/:id', async (req, res) => {
    let id = req.params.id;
    try{
        let productos = await db.query(`SELECT * from producto where id = ${id}`);
        res.json(productos)
    }
    catch (error){
        return res.status(400).json({
            mensaje: 'Query Error',
            error
        })
    }
});

router.post('/add', async (req, res) => {
    if (req.decoded.admin){
        try{
            let imagen = req.file.filename;
            let { nombre, marca, descripcion, precio, stock} = req.body;

            await db.query(`INSERT INTO producto (nombre, marca, descripcion, precio, stock, imagen ) VALUES ('${nombre}', '${marca}', '${descripcion}', '${precio}', '${stock}', '${imagen}')`);

            res.json({
                mensaje: 'PRODUCT_ADDED'
            });
        }
        catch (error){
            return res.status(400).json({
                mensaje: 'Query Error',
                error
            });
        }
    } else {
        return res.status(400).json({
            mensaje: 'No permitido'
        });
    }
});

router.put('/edit/:id', async (req, res) => {
    if (req.decoded.admin){
        try{
            let id = req.params.id;
            let { nombre, marca, descripcion, precio, stock} = req.body;
            if (req.file === undefined){
                await db.query(`UPDATE producto SET nombre = '${nombre}', marca = '${marca}', descripcion = '${descripcion}', precio = '${precio}', stock = '${stock}' where id = ${id}`);
            } else {
                delete_img(id);
                let imagen = req.file.filename;
                await db.query(`UPDATE producto SET nombre = '${nombre}', marca = '${marca}', descripcion = '${descripcion}', precio = '${precio}', stock = '${stock}', imagen = '${imagen}' where id = ${id}`);
            }

            res.json({
                mensaje: 'PRODUCT_UPDATED'
            });
        }
        catch (error){
            return res.status(400).json({
                mensaje: 'Query Error',
                error
            });
        }
    } else {
        return res.status(400).json({
            mensaje: 'No permitido'
        });
    }
});

router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    if (req.decoded.admin){
        try{
            
            delete_img(id);
            await db.query(`DELETE from producto where id = ${id}`)

            res.json({
                mensaje: 'PRODUCT_DELETED',
            });
        } catch (error) {
            return res.status(400).json({
                mensaje: 'Query Error',
                error
            });
        }
    } else {
        return res.status(400).json({
            mensaje: 'No permitido'
        });
    }
});



module.exports = router;