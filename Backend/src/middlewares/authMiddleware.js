const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado: Token não fornecido." });
  }

  // O formato padrão é "Bearer <TOKEN>"
  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: "Erro no formato do Token de autenticação." });
  } 
  
  const token = partes[1];

  try {
    // Verifica se o token é legítimo
    const decodificado = jwt.verify(token, jwtSecret);

    // Injeta os dados no pedido para serem consumidos pelos controllers e pelo adminMiddleware
    req.userId = decodificado.id;
    req.user = {
      id: decodificado.id,
      tipo: decodificado.tipo // 'admin' ou 'candidato'
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};