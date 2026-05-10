const express = require('express');
const cors = require('cors');
require('dotenv').config();

const auth = require('./middleAuth');

const createAdmin =
require('./createAdmin');

const alunosRoutes =
require('./alunos');

const mensalidadesRoutes =
require('./mensalidades');

const dashboardRoutes =
require('./dashboard');

const authRoutes =
require('./auth');

const relatoriosRoutes =
require('./relatorios');

const app = express();

app.use(cors());

app.use(express.json());

// CRIAR TABELAS

const createTables =
require('./createTables');

createTables();


// ROTAS

app.use('/auth', authRoutes);

app.use('/alunos', alunosRoutes);

app.use('/mensalidades', mensalidadesRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/relatorios', relatoriosRoutes);


// TESTE API

app.get('/', (req, res) => {

    res.send('API ONLINE');

});


const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Servidor rodando porta ${PORT}`
    );

});
