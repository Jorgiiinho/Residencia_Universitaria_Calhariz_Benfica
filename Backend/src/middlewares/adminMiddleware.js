module.exports = (req, res, next) => {
  // Verifica o 'tipo' injetado pelo authMiddleware
  if (!req.user || req.user.tipo !== 'admin') {
    return res.status(403).json({ 
      error: "Acesso negado: Esta área é exclusiva para funcionários administrativos." 
    });
  }
  
  return next();
};