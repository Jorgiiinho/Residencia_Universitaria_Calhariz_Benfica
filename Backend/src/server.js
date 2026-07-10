const express = require('express');
const cors = require('cors');

const { port, corsOrigin } = require('../config/env');
const db = require('../config/db');

// IMPORTAÇÃO DAS ROTAS 
const cantidaturaRoutes = require('./routes/candidaturaRoutes');
const authRoutes = require('./routes/authRoutes');
const documentoRoutes = require('./routes/documentoRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();

// Middlewares globais
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin }));
app.use(express.json());

// ATIVAÇÃO DOS ENDPOINTS DA API 
app.use('/api/auth', authRoutes);
app.use('/api/candidatura', cantidaturaRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/admin', adminRoutes);

// Rota de Diagnóstico (Health Check)
app.get('/health', async (_, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

// Inicialização segura do Servidor e da Base de Dados (TiDB Cloud)
async function start() {
  const connection = await db.getConnection();

  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }

  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error && error.stack ? error.stack : error);
  process.exit(1);
});

module.exports = app;