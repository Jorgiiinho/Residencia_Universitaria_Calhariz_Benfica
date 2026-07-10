const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Importação dos middlewares de segurança do teu sistema
const loginExigido = require('../middlewares/authMiddleware');
const adminExigido = require('../middlewares/adminMiddleware');

// ROTA: Listar todas as candidaturas (apenas para administradores)
router.use(loginExigido, adminExigido);

//Rota para listar todas as candidaturas e obter detalhes de uma candidatura específica
router.get('/candidaturas', adminController.listarTodasCandidaturas);
router.get('/candidaturas/:id', adminController.obterDetalhesCandidatura);

//Rotas para atualizar o estado de documentos e candidaturas
router.patch('/candidaturas/:candidato_id/documentos', adminController.atualizarEstadoDocumento);
router.patch('/candidaturas/:id/estado', adminController.atualizarEstadoCandidatura);

// Rota para criar um novo funcionário administrador
router.post('/criar-admin', adminController.criarFuncionarioAdmin);

module.exports = router;