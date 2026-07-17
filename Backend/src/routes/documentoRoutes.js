const express = require("express");
const router = express.Router();
const documentoController = require("../controllers/documentoController");
const adminController = require("../controllers/adminController"); // Necessário para gerir aprovações

// Middlewares
const upload = require('../middlewares/uploadMiddleware');
const loginExigido = require('../middlewares/authMiddleware');
const adminExigido = require('../middlewares/adminMiddleware');

// ROTA: Obter a lista de documentos de um candidato específico (GET /api/documentos/candidato/:candidato_id)
router.get('/candidato/:candidato_id', loginExigido, documentoController.listarPorCandidato);

// ROTA: Upload inicial de um documento (POST /api/documentos/candidato/:candidato_id)
router.post(
  '/candidato/:candidato_id',
  loginExigido,
  upload.single('file'), // Alinhado com o form.append("file", file) do teu api.js
  documentoController.importarDocumento
);

// ROTA: Reenviar documento após rejeição (PUT /api/documentos/:documento_id)
router.put(
  '/:documento_id',
  loginExigido,
  upload.single('file'), 
  documentoController.reenviarDocumento
);

// ROTA: Aprovar ou Rejeitar um documento individual (PUT /api/documentos/:documento_id/estado)
router.put(
  '/:documento_id/estado',
  loginExigido,
  adminExigido, // Garante que só funcionários da câmara fazem validações
  adminController.atualizarEstadoDocumento
);

module.exports = router;