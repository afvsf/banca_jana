const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const pool = require('../db');


// ======================================
// LOGIN
// ======================================

router.post('/login', async (req, res) => {

    try{

        const {
            email,
            senha
        } = req.body;

        const usuario =
            await pool.query(

                `
                SELECT *
                FROM usuarios
                WHERE email = $1
                `,

                [email]

            );

        if(usuario.rows.length === 0){

            return res.status(401).json({
                erro: 'Usuário não encontrado'
            });

        }

        const dadosUsuario =
            usuario.rows[0];

        // TEMPORÁRIO
        // futuramente usar bcrypt

        if(senha !== dadosUsuario.senha){

            return res.status(401).json({
                erro: 'Senha inválida'
            });

        }

        const token =
            jwt.sign(

                {
                    id: dadosUsuario.id,
                    email: dadosUsuario.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: '7d'
                }

            );

        res.json({

            token,

            usuario: {

                id: dadosUsuario.id,
                nome: dadosUsuario.nome,
                email: dadosUsuario.email

            }

        });

    }catch(error){

        res.status(500).json(error);

    }

});

module.exports = router;
