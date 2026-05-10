const pool = require('./db');

async function createAdmin(){

    try{

        const usuario =
            await pool.query(

                `
                SELECT *
                FROM usuarios
                WHERE email = $1
                `,

                ['admin@admin.com']

            );

        if(usuario.rows.length === 0){

            await pool.query(`

                INSERT INTO usuarios
                (
                    nome,
                    email,
                    senha
                )

                VALUES
                ($1,$2,$3)

            `,

            [
                'Administrador',
                'admin@admin.com',
                '123456'
            ]);

            console.log(
                'Admin criado'
            );

        }else{

            console.log(
                'Admin já existe'
            );

        }

    }catch(error){

        console.log(error);

    }

}

module.exports = createAdmin;
