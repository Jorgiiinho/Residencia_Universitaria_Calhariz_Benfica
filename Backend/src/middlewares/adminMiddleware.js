module.exports = (req, res, next) => {
    if(!req.user || req.user.isAdmin !== 'admin'){
        return res.status(401).json({error:"Acesso negado: Token não fornecido"});
    }
    return next();
}