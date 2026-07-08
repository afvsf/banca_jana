const express = require('express');
const router = express.Router();

const pool = require('./db');

const auth = require('./middleAuth');


// ======================================
// DASHBOARD GERAL
// ======================================

router.get('/', async (req, res) => {

    try {

        // TOTAL ALUNOS
        const totalAlunos = await pool.query(`
            SELECT COUNT(*) AS total
            FROM alunos
            WHERE status = 'ATIVO'
        `);

        // TOTAL RECEBIDO
        const totalRecebido = await pool.query(`
            SELECT
                COALESCE(SUM(valor_pago),0) AS total
            FROM mensalidades
            WHERE status = 'PAGO'
        `);

        // TOTAL PENDENTE
        const totalPendente = await pool.query(`
            SELECT
                COALESCE(SUM(valor),0) AS total
            FROM mensalidades
            WHERE status != 'PAGO'
        `);

        // INADIMPLENTES
        const inadimplentes = await pool.query(`
            SELECT COUNT(DISTINCT aluno_id) AS total
            FROM mensalidades
            WHERE status != 'PAGO'
        `);

        // PAGAMENTOS HOJE
        const pagamentosHoje = await pool.query(`
            SELECT
                COALESCE(SUM(valor_pago),0) AS total
            FROM mensalidades
            WHERE data_pagamento = CURRENT_DATE
        `);

        // ÚLTIMOS PAGAMENTOS
        const ultimosPagamentos = await pool.query(`
            SELECT
                a.nome,
                m.valor_pago,
                m.forma_pagamento,
                m.data_pagamento

            FROM mensalidades m

            INNER JOIN alunos a
            ON a.id = m.aluno_id

            WHERE m.status = 'PAGO'

            ORDER BY m.data_pagamento DESC

            LIMIT 10
        `);

        res.json({

            total_alunos:
                totalAlunos.rows[0].total,

            total_recebido:
                totalRecebido.rows[0].total,

            total_pendente:
                totalPendente.rows[0].total,

            inadimplentes:
                inadimplentes.rows[0].total,

            pagamentos_hoje:
                pagamentosHoje.rows[0].total,

            ultimos_pagamentos:
                ultimosPagamentos.rows

        });

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// ANIVERSARIANTES
// ======================================

router.get('/aniversariantes', auth, async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT
                id,
                nome,
                responsavel,
                telefone,
                data_nascimento,

                EXTRACT(DAY FROM data_nascimento) AS dia

            FROM alunos

            WHERE
                EXTRACT(MONTH FROM data_nascimento) =
                EXTRACT(MONTH FROM CURRENT_DATE)

            ORDER BY dia ASC

        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// GRÁFICO MENSAL
// ======================================

router.get('/grafico-mensal', async (req, res) => {

    try {

        const result = await pool.query(`

            SELECT

                referencia_mes,

                SUM(valor_pago) AS total

            FROM mensalidades

            WHERE status = 'PAGO'

            GROUP BY referencia_mes

            ORDER BY referencia_mes ASC

        `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});

module.exports = router;
