const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Sistema Banca Alunos');


const alunosRoutes = require('./routes/alunos');

app.use('/alunos', alunosRoutes);

const mensalidadesRoutes = require('./routes/mensalidades');

app.use('/mensalidades', mensalidadesRoutes);
  
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});
