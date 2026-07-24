const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { db } = require('./env');

let sslConfig = null;

if (db.ssl) {
  sslConfig = {
    rejectUnauthorized: true,
  };

  // 1. Define o caminho do certificado (seja configurado no .env ou na pasta certs)
  const defaultCaPath = path.join(__dirname, 'certs', 'isrgrootx1.pem');
  const caPath = db.sslCaPath 
    ? (path.isAbsolute(db.sslCaPath) ? db.sslCaPath : path.resolve(process.cwd(), db.sslCaPath))
    : defaultCaPath;

  // 2. Lê o ficheiro apenas se ele realmente existir no disco
  if (caPath && fs.existsSync(caPath)) {
    try {
      sslConfig.ca = fs.readFileSync(caPath, 'utf8');
    } catch (err) {
      console.warn('⚠️ Não foi possível ler o ficheiro CA especificado, a usar SSL padrão.');
    }
  }
}

// Criar o Connection Pool
const pool = mysql.createPool({
  host: db.host,
  port: db.port || 4000,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
});

module.exports = pool;