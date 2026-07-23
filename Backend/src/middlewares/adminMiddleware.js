module.exports = (req, res, next) => {
  // Permite o acesso se o utilizador for 'admin' OU 'superadmin'
  if (!req.user || (req.user.tipo !== 'admin' && req.user.tipo !== 'superadmin')) {
    return res.status(403).json({ 
      error: "Acesso negado: Esta área é exclusiva para funcionários administrativos." 
    });
  }
  
  return next();
};