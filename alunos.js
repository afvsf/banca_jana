const express = require('express');
const router = express.Router();

const pool = require('./db');

router.get('/', auth, async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT * FROM alunos
            ORDER BY nome ASC
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.get('/:id', async (req, res) => {

    try {

        const result = await pool.query(
            'SELECT * FROM alunos WHERE id = $1',
            [req.params.id]
        );

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.post('/', async (req, res) => {

    try {

        const {
            nome,
            data_matricula,
            responsavel,
            telefone,
            valor_mensalidade
        } = req.body;

        const result = await pool.query(`
            INSERT INTO alunos (
                nome,
                data_matricula,
                responsavel,
                telefone,
                valor_mensalidade
            )
            VALUES ($1,$2,$3,$4,$5)
            RETURNING *
        `, [
            nome,
            data_matricula,
            responsavel,
            telefone,
            valor_mensalidade
        ]);

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.put('/:id', async (req, res) => {

    try {

        const {
            nome,
            responsavel,
            telefone,
            valor_mensalidade
        } = req.body;

        const result = await pool.query(`
            UPDATE alunos
            SET
                nome = $1,
                responsavel = $2,
                telefone = $3,
                valor_mensalidade = $4
            WHERE id = $5
            RETURNING *
        `, [
            nome,
            responsavel,
            telefone,
            valor_mensalidade,
            req.params.id
        ]);

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.delete('/:id', async (req, res) => {

    try {

        await pool.query(
            'DELETE FROM alunos WHERE id = $1',
            [req.params.id]
        );

        res.json({
            mensagem: 'Aluno removido'
        });

    } catch (error) {

        res.status(500).json(error);

    }

});

module.exports = router;
