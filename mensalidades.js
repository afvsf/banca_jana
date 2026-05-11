const express = require('express');
const router = express.Router();

const pool = require('./db');

const auth = require('./middleAuth');

// ======================================
// LISTAR TODAS
// ======================================

router.get('/', auth, async (req, res) => {

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
            SELECT

            mensalidades.*,

            alunos.nome AS aluno

            FROM mensalidades

            INNER JOIN alunos
            ON alunos.id = mensalidades.aluno_id

            ORDER BY mensalidades.id DESC
            WHERE aluno_id = $1
            ORDER BY referencia_mes ASC
        `, [req.params.id]);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});


// ======================================
// GERAR MENSALIDADES ANUAL
// ======================================

router.post('/gerar-anual', auth, async (req, res) => {

    try{

        const alunos =
            await pool.query(`

                SELECT *
                FROM alunos

                WHERE status = 'ATIVO'

            `);

        for(const aluno of alunos.rows){

            const matricula =
                new Date(
                    aluno.data_matricula
                );

            let mes =
                matricula.getMonth() + 1;

            let ano =
                matricula.getFullYear();

            // regra inteligente

            if(
                matricula.getDate()
                >
                aluno.dia_vencimento
            ){

                mes++;

            }

            // gera até dezembro

            while(mes <= 12){

                const existe =
                    await pool.query(`

                        SELECT id
                        FROM mensalidades

                        WHERE aluno_id = $1

                        AND referencia_mes = $2

                        AND referencia_ano = $3

                    `,

                    [
                        aluno.id,
                        mes,
                        ano
                    ]);

                if(existe.rows.length === 0){

                    const vencimento =

                        `${ano}-${
                            String(mes)
                            .padStart(2,'0')
                        }-${
                            String(aluno.dia_vencimento)
                            .padStart(2,'0')
                        }`;

                    await pool.query(`

                        INSERT INTO mensalidades
                        (

                            aluno_id,

                            referencia_mes,

                            referencia_ano,

                            valor,

                            data_vencimento,

                            status

                        )

                        VALUES
                        ($1,$2,$3,$4,$5,$6)

                    `,

                    [

                        aluno.id,

                        mes,

                        ano,

                        aluno.valor_mensalidade,

                        vencimento,

                        'PENDENTE'

                    ]);

                }

                mes++;

            }

        }

        res.json({

            sucesso: true,
            mensagem:
            'Mensalidades anuais geradas'

        });

    }catch(error){

        console.log(error);

        res.status(500).json(error);

    }

});


router.post('/renovar-anual', auth, async (req, res) => {

    try{

        const alunos =
            await pool.query(`

                SELECT *
                FROM alunos

                WHERE status = 'ATIVO'

            `);

        const novoAno =
            new Date().getFullYear() + 1;

        for(const aluno of alunos.rows){

            for(let mes = 1; mes <= 12; mes++){

                // evita duplicar

                const existe =
                    await pool.query(`

                        SELECT id
                        FROM mensalidades

                        WHERE aluno_id = $1

                        AND referencia_mes = $2

                        AND referencia_ano = $3

                    `,

                    [
                        aluno.id,
                        mes,
                        novoAno
                    ]);

                if(existe.rows.length === 0){

                    const vencimento =

                        `${novoAno}-${
                            String(mes)
                            .padStart(2,'0')
                        }-${
                            String(aluno.dia_vencimento)
                            .padStart(2,'0')
                        }`;

                    await pool.query(`

                        INSERT INTO mensalidades
                        (

                            aluno_id,

                            referencia_mes,

                            referencia_ano,

                            valor,

                            data_vencimento,

                            status

                        )

                        VALUES
                        ($1,$2,$3,$4,$5,$6)

                    `,

                    [

                        aluno.id,

                        mes,

                        novoAno,

                        aluno.valor_mensalidade,

                        vencimento,

                        'PENDENTE'

                    ]);

                }

            }

        }

        res.json({

            sucesso: true,

            mensagem:
            `Mensalidades ${novoAno} geradas`

        });

    }catch(error){

        console.log(error);

        res.status(500).json(error);

    }

});

// ======================================
// PAGAR MENSALIDADE
// ======================================

router.put('/pagar/:id', auth, async (req, res) => {

    try{

        const {
            valor_pago,
            forma_pagamento
        } = req.body;

        await pool.query(`

            UPDATE mensalidades

            SET

                valor_pago = $1,

                forma_pagamento = $2,

                data_pagamento = NOW(),

                status = 'PAGO'

            WHERE id = $3

        `,

        [
            valor_pago,
            forma_pagamento,
            req.params.id
        ]);

        res.json({
            sucesso: true
        });

    }catch(error){

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
