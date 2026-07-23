const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const faqController = require('../controllers/faqController');
const { verificarToken, eAdmin, eSuperAdmin } = require('../middlewares/authMiddleware');

// 🔍 Log de depuração para verificar o adminController
console.log("🔍 [Debug Admin] Funções carregadas no adminController:", {
  obterEstadoCandidaturas: typeof adminController.obterEstadoCandidaturas,
  listarTodasCandidaturas: typeof adminController.listarTodasCandidaturas,
  obterAnosLetivosDisponiveis: typeof adminController.obterAnosLetivosDisponiveis,
  obterDetalhesCandidatura: typeof adminController.obterDetalhesCandidatura,
  atualizarEstadoCandidatura: typeof adminController.atualizarEstadoCandidatura,
  atualizarEstadoDocumento: typeof adminController.atualizarEstadoDocumento,
  criarFuncionarioAdmin: typeof adminController.criarFuncionarioAdmin,
  togglePeriodoCandidaturas: typeof adminController.togglePeriodoCandidaturas,
  verificarToken: typeof verificarToken,
  eAdmin: typeof eAdmin
});

// Helper para evitar crash caso alguma função não exista
const safeHandler = (fn, name) => {
  if (typeof fn === 'function') return fn;
  return (req, res) => res.status(501).json({ ok: false, error: `Função ${name} não implementada no controller.` });
};

// 🌍 Rotas Públicas
router.get('/periodo-candidaturas/estado', safeHandler(adminController.obterEstadoCandidaturas, 'obterEstadoCandidaturas'));
if (faqController && faqController.listarFaqs) {
  router.get('/faqs', faqController.listarFaqs);
}

// 🔒 Bloqueio de Autenticação
if (verificarToken) {
  router.use(verificarToken);
}

// 👨‍💼 Rotas de Staff
const middlewareAdmin = eAdmin || ((req, res, next) => next());
router.get('/candidaturas', middlewareAdmin, safeHandler(adminController.listarTodasCandidaturas, 'listarTodasCandidaturas'));
router.get('/anos-letivos', middlewareAdmin, safeHandler(adminController.obterAnosLetivosDisponiveis, 'obterAnosLetivosDisponiveis'));
router.get('/candidaturas/:id', middlewareAdmin, safeHandler(adminController.obterDetalhesCandidatura, 'obterDetalhesCandidatura'));
router.put('/candidaturas/:id/estado', middlewareAdmin, safeHandler(adminController.atualizarEstadoCandidatura, 'atualizarEstadoCandidatura'));
router.put('/documentos/:documento_id/estado', middlewareAdmin, safeHandler(adminController.atualizarEstadoDocumento, 'atualizarEstadoDocumento'));

// 👑 Rotas de SuperAdmin
const middlewareSuper = eSuperAdmin || ((req, res, next) => next());
router.post('/criar-admin', middlewareSuper, safeHandler(adminController.criarFuncionarioAdmin, 'criarFuncionarioAdmin'));
router.put('/periodo-candidaturas', middlewareSuper, safeHandler(adminController.togglePeriodoCandidaturas, 'togglePeriodoCandidaturas'));

module.exports = router;