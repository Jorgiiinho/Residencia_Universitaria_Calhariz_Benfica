const express = require("express");
const router = express.Router();
const candidaturaController = require("../controllers/candidaturaController");
const loginExigido = require('../middlewares/authMiddleware');

// ROTA: Submeter uma candidatura (estudante autenticado)
router.post('/submeter', loginExigido, candidaturaController.submeterCandidatura);
//ROTA: Obter a candidatura do estudante autenticado
router.get('/minha', loginExigido, candidaturaController.obterMinhaCandidatura);

module.exports = router;