const express = require('express');

const router = express.Router();

const pool = require('./db');

const auth = require('./middleAuth');

router.get('/', auth, async(req,res)=>{

    try{

        const result = await pool.query(`

            SELECT *

            FROM turmas

            ORDER BY nome

        `);

        res.json(result.rows);

    }catch(error){

        res.status(500).json(error);

    }

});

module.exports = router;
