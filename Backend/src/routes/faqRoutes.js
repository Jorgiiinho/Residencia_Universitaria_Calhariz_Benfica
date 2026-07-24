const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { verificarToken, eSuperAdmin } = require('../middlewares/authMiddleware');

//  Rota Pública (Qualquer pessoa pode consultar)
router.get('/', faqController.listarFaqs);

// Rotas Protegidas (EXCLUSIVAS DE SUPERADMIN)
router.post('/', verificarToken, eSuperAdmin, faqController.criarFaq);
router.put('/:id', verificarToken, eSuperAdmin, faqController.atualizarFaq);
router.delete('/:id', verificarToken, eSuperAdmin, faqController.eliminarFaq);

module.exports = router;