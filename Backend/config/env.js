const path = require('path');

require('@dotenvx/dotenvx').config({
  path: path.resolve(__dirname, '..', '.env'),
  override: true,
});

const dbUser = process.env.DB_USERNAME || process.env.DB_USER;
const dbName = process.env.DB_DATABASE || process.env.DB_NAME;
const dbSslCaPath = process.env.DB_SSL_CA_PATH || '';

const missingVars = [];

if (!process.env.DB_HOST || process.env.DB_HOST.trim() === '') missingVars.push('DB_HOST');
if (!dbUser || dbUser.trim() === '') missingVars.push('DB_USERNAME');
if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD.trim() === '') missingVars.push('DB_PASSWORD');
if (!dbName || dbName.trim() === '') missingVars.push('DB_DATABASE');

if (missingVars.length) {
  throw new Error(`Missing required env vars: ${missingVars.join(', ')}`);
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: dbUser,
    password: process.env.DB_PASSWORD,
    database: dbName,
    ssl: String(process.env.DB_SSL || '').trim().toLowerCase() === 'true',
    sslCaPath: dbSslCaPath.trim(),
  },
};