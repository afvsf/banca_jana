const express = require('express');
const router = express.Router();

const pool = require('./db');

const auth = require('./middleAuth');

// ======================================
// LISTAR TODAS
// ======================================

router.get('/', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                m.*,
                a.nome AS aluno
            FROM mensalidades m
            INNER JOIN alunos a
            ON a.id = m.aluno_id
            ORDER BY m.referencia_ano DESC,
                     m.referencia_mes ASC
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// LISTAR POR ALUNO
// ======================================

router.get('/aluno/:id', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM mensalidades
            WHERE aluno_id = $1
            ORDER BY referencia_mes ASC
        `, [req.params.id]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// GERAR 12 MENSALIDADES
// ======================================

router.post('/gerar/:aluno_id', auth, async (req, res) => {

    try {

        const aluno = await pool.query(`
            SELECT *
            FROM alunos
            WHERE id = $1
        `, [req.params.aluno_id]);

        if (aluno.rows.length === 0) {

            return res.status(404).json({
                erro: 'Aluno não encontrado'
            });

        }

        const dadosAluno = aluno.rows[0];

        const anoAtual = new Date().getFullYear();

        for (let mes = 1; mes <= 12; mes++) {

            const vencimento =
                `${anoAtual}-${String(mes).padStart(2,'0')}-${String(dadosAluno.vencimento_dia).padStart(2,'0')}`;

            await pool.query(`
                INSERT INTO mensalidades (
                    aluno_id,
                    referencia_mes,
                    referencia_ano,
                    data_vencimento,
                    valor,
                    status
                )
                VALUES ($1,$2,$3,$4,$5,$6)
            `, [
                req.params.aluno_id,
                mes,
                anoAtual,
                vencimento,
                dadosAluno.valor_mensalidade,
                'PENDENTE'
            ]);

        }

        res.json({
            mensagem: '12 mensalidades geradas'
        });

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// PAGAR MENSALIDADE
// ======================================

router.put('/pagar/:id', async (req, res) => {

    try {

        const {
            forma_pagamento,
            valor_pago
        } = req.body;

        const result = await pool.query(`
            UPDATE mensalidades
            SET
                status = 'PAGO',
                forma_pagamento = $1,
                valor_pago = $2,
                data_pagamento = CURRENT_DATE
            WHERE id = $3
            RETURNING *
        `, [
            forma_pagamento,
            valor_pago,
            req.params.id
        ]);

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// RELATÓRIO DEVEDORES
// ======================================

router.get('/devedores', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                a.nome,
                a.responsavel,
                a.telefone,

                COUNT(m.id) AS total_pendente,

                SUM(m.valor) AS valor_devido

            FROM mensalidades m

            INNER JOIN alunos a
            ON a.id = m.aluno_id

            WHERE m.status != 'PAGO'

            GROUP BY
                a.nome,
                a.responsavel,
                a.telefone

            ORDER BY valor_devido DESC
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// RELATÓRIO PAGOS
// ======================================

router.get('/pagos', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                a.nome,
                m.valor_pago,
                m.forma_pagamento,
                m.data_pagamento,
                m.referencia_mes,
                m.referencia_ano

            FROM mensalidades m

            INNER JOIN alunos a
            ON a.id = m.aluno_id

            WHERE m.status = 'PAGO'

            ORDER BY m.data_pagamento DESC
        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});

module.exports = router;
