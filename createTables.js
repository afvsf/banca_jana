const pool = require('./db');

async function createTables(){

    try{

        // =====================================
        // TABELA USUÁRIOS
        // =====================================

        await pool.query(`

            CREATE TABLE IF NOT EXISTS usuarios (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(200),

                email VARCHAR(200) UNIQUE,

                senha VARCHAR(200),

                created_at TIMESTAMP DEFAULT NOW()

            )

        `);


        // =====================================
        // TABELA ALUNOS
        // =====================================

        await pool.query(`

            CREATE TABLE IF NOT EXISTS alunos (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(200) NOT NULL,

                data_matricula DATE,

                responsavel VARCHAR(200),

                telefone VARCHAR(50),

                valor_mensalidade NUMERIC(10,2),

                status VARCHAR(20)
                DEFAULT 'ATIVO',
            
                created_at TIMESTAMP
                DEFAULT NOW(),

                dia_vencimento INTEGER DEFAULT 10

            )

        `);

  

        // =====================================
        // TABELA MENSALIDADES
        // =====================================

        await pool.query(`

            CREATE TABLE IF NOT EXISTS mensalidades (

                id SERIAL PRIMARY KEY,

                aluno_id INTEGER
                REFERENCES alunos(id),

                referencia_mes INTEGER,

                referencia_ano INTEGER,

                valor NUMERIC(10,2),

                valor_pago NUMERIC(10,2),

                forma_pagamento VARCHAR(50),

                data_vencimento DATE,

                data_pagamento DATE,

                status VARCHAR(20)
                DEFAULT 'PENDENTE',

                created_at TIMESTAMP
                DEFAULT NOW()

            )

        `);


        console.log(
            'Tabelas criadas com sucesso'
        );

    }catch(error){

        console.log(error);

    }

}

module.exports = createTables;
