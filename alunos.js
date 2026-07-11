const express = require('express');
const router = express.Router();

const pool = require('./db');
const auth = require('./middleAuth');

router.get('/', auth, async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
            
                a.*,
            
                t.nome AS turma
            
            FROM alunos a
            
            LEFT JOIN turmas t
            ON t.id = a.turma_id
            
            ORDER BY a.nome ASC
                    `);

        res.json(result.rows);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.get('/:id', async (req, res) => {

    try {

        const result = await pool.query(`

        SELECT
        
            a.*,
        
            t.nome AS turma
        
        FROM alunos a
        
        LEFT JOIN turmas t
        ON t.id = a.turma_id
        
        WHERE a.id = $1
        
        `,[
            req.params.id
        ]);

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.post('/', async (req, res) => {

    try {

        console.log("=== NOVO CADASTRO ===");
        console.log(req.body);
    
        let {
    
        nome,
        responsavel,
        telefone,
        valor_mensalidade,
        data_matricula,
        data_nascimento,
        dia_vencimento,
        turma_id
    
    } = req.body;
        
        if (turma_id === "") {
            turma_id = null;
        }

        // CADASTRA ALUNO

        const result = await pool.query(`

            INSERT INTO alunos
            (
                nome,
                responsavel,
                telefone,
                valor_mensalidade,
                data_matricula,
                data_nascimento,
                dia_vencimento,
                turma_id
            )
            
            VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8)

            RETURNING *

        `, [
            nome,
            responsavel,
            telefone,
            valor_mensalidade,
            data_matricula,
            data_nascimento,
            dia_vencimento,
            turma_id
        ]);

        const aluno =
            result.rows[0];

        console.log("Aluno salvo:", aluno);
        console.log("Data matrícula:", aluno.data_matricula);
        console.log("Dia vencimento:", aluno.dia_vencimento);

        // GERA MENSALIDADES

        const matricula =
            new Date(
                aluno.data_matricula
            );

        let mes =
            matricula.getMonth() + 1;

        let ano =
            matricula.getFullYear();

        // REGRA INTELIGENTE

        if(
            matricula.getDate()
            >
            aluno.dia_vencimento
        ){

            mes++;

        }


        console.log("Mês inicial:", mes);
        console.log("Ano:", ano);
        // GERA ATÉ DEZEMBRO

        while(mes <= 12){

            const vencimento =

                `${ano}-${
                    String(mes)
                    .padStart(2,'0')
                }-${
                    String(aluno.dia_vencimento)
                    .padStart(2,'0')
                }`;

            console.log(`Gerando mensalidade ${mes}/${ano}`);

              // 👇 COLOQUE AQUI
                console.log({
                    aluno_id: aluno.id,
                    mes,
                    ano,
                    valor: aluno.valor_mensalidade,
                    vencimento,
                    status: 'PENDENTE'
                        });
            
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

            `, [

                aluno.id,

                mes,

                ano,

                aluno.valor_mensalidade,

                vencimento,

                'PENDENTE'

            ]);

            mes++;

        }

        res.json(aluno);

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

        console.error(error);
        console.error(error.stack);

    }

});

router.put('/:id', async (req, res) => {

    try {

        const {
            nome,
            responsavel,
            telefone,
            valor_mensalidade,
            data_matricula,
            dia_vencimento,
            turma_id
        } = req.body;

        const result = await pool.query(`

            UPDATE alunos

            SET

                nome = $1,
                responsavel = $2,
                telefone = $3,
                valor_mensalidade = $4,
                data_matricula = $5,
                dia_vencimento = $6,
                turma_id = $7

            WHERE id = $8

            RETURNING *

        `, [

            nome,
            responsavel,
            telefone,
            valor_mensalidade,
            data_matricula,
            dia_vencimento,
            turma_id,
            req.params.id
        ]);

        res.json(result.rows[0]);

    } catch (error) {

        res.status(500).json(error);

    }

});

router.delete('/:id', auth, async (req, res) => {

    try {

        // remove mensalidades do aluno

        await pool.query(`

            DELETE FROM mensalidades

            WHERE aluno_id = $1

        `, [

            req.params.id

        ]);

        // remove aluno

        await pool.query(`

            DELETE FROM alunos

            WHERE id = $1

        `, [

            req.params.id

        ]);

        res.json({

            sucesso: true

        });

    } catch (error) {

        console.log(error);

        res.status(500).json(error);

    }

});

module.exports = router;
