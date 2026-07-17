const express = require("express");
const router = express.Router();
const candidaturaController = require("../controllers/candidaturaController");
const loginExigido = require('../middlewares/authMiddleware');

// Criar ou Atualizar rascunho de candidatura (POST /api/candidaturas)
router.post('/', loginExigido, candidaturaController.criarOuAtualizarCandidatura);

// Obter a candidatura do estudante autenticado (GET /api/candidaturas/me)
router.get('/me', loginExigido, candidaturaController.obterMinhaCandidatura);

//Submeter uma candidatura definitiva (POST /api/candidaturas/:id/submeter)
router.post('/:id/submeter', loginExigido, candidaturaController.submeterCandidatura);

module.exports = router;