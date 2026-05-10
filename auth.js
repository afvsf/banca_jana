const express = require('express');

const router = express.Router();

const jwt = require('jsonwebtoken');

const pool = require('./db');


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
                erro: 'Usuário inválido'
            });

        }

        const user =
            usuario.rows[0];

        if(user.senha !== senha){

            return res.status(401).json({
                erro: 'Senha inválida'
            });

        }

        const token =
            jwt.sign(

                {
                    id: user.id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: '7d'
                }

            );

        res.json({

            token,

            usuario: {

                nome: user.nome,
                email: user.email

            }

        });

    }catch(error){

        res.status(500).json(error);

    }

});

module.exports = router;
