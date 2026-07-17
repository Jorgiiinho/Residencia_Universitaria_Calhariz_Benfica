const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Importação dos middlewares de segurança do teu sistema
const loginExigido = require('../middlewares/authMiddleware');
const adminExigido = require('../middlewares/adminMiddleware');

// Todas as rotas administrativas exigem autenticação e privilégios de Admin
router.use(loginExigido, adminExigido);

// ROTA: Listar todas as candidaturas (GET /api/admin/candidaturas)
router.get('/candidaturas', adminController.listarTodasCandidaturas);

// ROTA: Obter detalhes de uma candidatura específica (GET /api/admin/candidaturas/:id)
router.get('/candidaturas/:id', adminController.obterDetalhesCandidatura);

// ROTA: Atualizar o estado global da candidatura (PUT /api/admin/candidaturas/:id/estado)

router.put('/candidaturas/:id/estado', adminController.atualizarEstadoCandidatura);

// ROTA: Criar um novo funcionário administrador (POST /api/admin/funcionarios)

router.post('/funcionarios', adminController.criarFuncionarioAdmin);

module.exports = router;