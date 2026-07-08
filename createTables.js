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
        // TABELA TURMAS
        // =====================================

        await pool.query(`

            CREATE TABLE IF NOT EXISTS turmas (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(100) UNIQUE NOT NULL,

                descricao TEXT,

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


                // Adiciona turma_id
            await pool.query(`
            
                ALTER TABLE alunos
            
                ADD COLUMN IF NOT EXISTS turma_id INTEGER
            
            `);


                    // Adiciona data_nascimento
            await pool.query(`
            
                ALTER TABLE alunos
            
                ADD COLUMN IF NOT EXISTS data_nascimento DATE
            
            `);


            await pool.query(`
    
            ALTER TABLE alunos
        
            DROP CONSTRAINT IF EXISTS alunos_turma_id_fkey;
        
            ALTER TABLE alunos
        
            ADD CONSTRAINT alunos_turma_id_fkey
        
            FOREIGN KEY (turma_id)
        
            REFERENCES turmas(id);
        
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


        // =====================================
        // CADASTRA AS TURMAS
        // =====================================

        await pool.query(`

            INSERT INTO turmas(nome)
            VALUES
            ('Turma 01'),
            ('Turma 02'),
            ('Turma 03'),
            ('Turma 04'),
            ('Turma 05')

            ON CONFLICT (nome) DO NOTHING

        `);

        console.log("Tabelas criadas com sucesso.");

    }catch(error){

        console.log(error);

    }

}

module.exports = createTables;
