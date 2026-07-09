const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const { db } = require('./env');

let sslConfig;

if (db.ssl) {
  sslConfig = {
    rejectUnauthorized: true,
  };

  const caPath = db.sslCaPath || path.join(__dirname, 'certs', 'isrgrootx1.pem');

  if (caPath && fs.existsSync(caPath)) {
    sslConfig.ca = fs.readFileSync(caPath, 'utf8');
  }

  if (caPath) {
    const resolvedCaPath = path.isAbsolute(caPath)
      ? caPath
      : path.resolve(__dirname, '..', caPath);

    sslConfig.ca = fs.readFileSync(resolvedCaPath, 'utf8');
  }
}

const pool = mysql.createPool({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
});

module.exports = pool;