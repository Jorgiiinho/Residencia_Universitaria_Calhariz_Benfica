const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('../config/db'); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Imports de Rotas
const authRoutes = require('./routes/authRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const adminRoutes = require('./routes/adminRoutes');
const faqRoutes = require('./routes/faqRoutes');

// Diagnóstico no arranque
console.log("🔍 [Debug Server.js] Estado dos imports de rotas:");
console.log("  - /api/auth:", typeof authRoutes);
console.log("  - /api/candidaturas:", typeof candidaturaRoutes);
console.log("  - /api/documentos:", typeof documentoRoutes);
console.log("  - /api/admin:", typeof adminRoutes);
console.log("  - /api/faqs:", typeof faqRoutes);

// Registar Rotas em segurança
if (typeof authRoutes === 'function') app.use('/api/auth', authRoutes);
if (typeof candidaturaRoutes === 'function') app.use('/api/candidaturas', candidaturaRoutes);
if (typeof documentoRoutes === 'function') app.use('/api/documentos', documentoRoutes);
if (typeof adminRoutes === 'function') app.use('/api/admin', adminRoutes);

// REGISTAR AS FAQS TANTO PARA O ACESSO PÚBLICO COMO ADMINISTRATIVO
if (typeof faqRoutes === 'function') {
  app.use('/api/faqs', faqRoutes);
  app.use('/api/admin/faqs', faqRoutes);
}

// Rota de Diagnóstico (Health Check)
app.get('/health', async (_, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'unavailable' });
  }
});

const PORT = process.env.PORT || 5000;

// Inicialização segura do Servidor e da Base de Dados (TiDB Cloud)
async function start() {
  try {
    const connection = await db.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    console.log('✅ Conexão à base de dados (TiDB Cloud) estabelecida com sucesso!');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor a rodar com sucesso na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Falha ao iniciar o backend:', error && error.stack ? error.stack : error);
    process.exit(1);
  }
}

start();

module.exports = app;