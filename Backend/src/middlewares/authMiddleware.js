const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');

// Middleware principal de verificação de Token
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado: Token não fornecido." });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: "Erro no formato do Token de autenticação." });
  } 
  
  const token = partes[1];

  try {
    const decodificado = jwt.verify(token, jwtSecret);

    req.userId = decodificado.id;
    req.user = {
      id: decodificado.id,
      tipo: decodificado.tipo
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// Middleware para verificar se o utilizador é Administrador
const eAdmin = (req, res, next) => {
  if (req.user?.tipo !== 'admin' && req.user?.tipo !== 'superadmin') {
    return res.status(403).json({ error: "Acesso negado: Requer privilégios de Administrador." });
  }
  return next();
};

// Middleware para verificar se o utilizador é Super Administrador
const eSuperAdmin = (req, res, next) => {
  if (req.user?.tipo !== 'superadmin') {
    return res.status(403).json({ error: "Acesso negado: Requer privilégios de Super Administrador." });
  }
  return next();
};

//  Permite 'const loginExigido = require(...)'
// E TAMBÉM 'const { verificarToken, eAdmin } = require(...)'
verificarToken.verificarToken = verificarToken;
verificarToken.eAdmin = eAdmin;
verificarToken.eSuperAdmin = eSuperAdmin;

module.exports = verificarToken;