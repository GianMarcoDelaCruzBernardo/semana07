require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, Role } = require('./src/db');
const routes = require('./src/routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', routes);

const PORT = process.env.PORT || 8080;

async function start() {
  await sequelize.sync();
  for (const name of ['user', 'moderator', 'admin']) {
    await Role.findOrCreate({ where: { name } });
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`Servidor JWT corriendo en el puerto ${PORT}`));
}

start().catch((err) => {
  console.error('Error al iniciar:', err);
  process.exit(1);
});