const express = require("express");
const router = express.Router();
const documentoController = require("../controllers/documentoController");
const upload = require('../middlewares/uploadMiddleware');

router.post(
  '/upload/:candidato_id', 
  upload.fields([
    { name: 'Formulario_candidatura', maxCount: 1 },
    { name: 'CC', maxCount: 2 },
    { name: 'Declaracao_Residencia', maxCount: 1 },
    { name: 'Declaracao_Domicilio_Fiscal', maxCount: 1 },
    { name: 'Comprovativo_Inscricao_Matricula', maxCount: 1 },
    { name: 'Documento_bolsa_estudo', maxCount: 1 },
    { name: 'IRS', maxCount: 1 },
    { name: 'Comprovativos_Rendimento_Anuais', maxCount: 1 }
  ]), 
  documentoController.importarDocumentos
);

module.exports = router;


module.exports = router;
