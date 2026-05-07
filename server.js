const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', auth, (req, res) => {
  res.send('API Sistema Banca Alunos');


const alunosRoutes = require('./routes/alunos');

app.use('/alunos', auth, alunosRoutes);

const mensalidadesRoutes = require('./routes/mensalidades');

app.use('/mensalidades', auth, mensalidadesRoutes);

const dashboardRoutes = require('./routes/dashboard');

app.use('/dashboard', auth, dashboardRoutes);

const authRoutes =
require('./routesAuth');

app.use('/auth', authRoutes);



  
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});
