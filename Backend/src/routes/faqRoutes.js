const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const { verificarToken, eAdmin, eSuperAdmin } = require('../middlewares/authMiddleware');

//Rota Pública (Consultar FAQs) — colocar antes do verificarToken!
router.get('/faqs', faqController.listarFaqs);

//Rotas Protegidas (Gestão pelo SuperAdmin)
router.post('/faqs', verificarToken, eSuperAdmin, faqController.criarFaq);
router.put('/faqs/:id', verificarToken, eSuperAdmin, faqController.atualizarFaq);
router.delete('/faqs/:id', verificarToken, eSuperAdmin, faqController.eliminarFaq);

exports = router;