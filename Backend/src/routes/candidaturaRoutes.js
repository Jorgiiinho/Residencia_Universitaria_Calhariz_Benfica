const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Todas as rotas de candidatura exigem autenticação
router.use(verificarToken);

// Funções ajustadas com os nomes exatos do candidaturaController.js
router.get('/me', candidaturaController.obterMinhaCandidatura);
router.post('/', candidaturaController.criarOuAtualizarCandidatura);
router.post('/agregado', candidaturaController.adicionarAgregado || ((req, res) => res.status(501).json({ error: "Não implementado" })));
router.post('/:id/submeter', candidaturaController.submeterCandidatura);

module.exports = router;