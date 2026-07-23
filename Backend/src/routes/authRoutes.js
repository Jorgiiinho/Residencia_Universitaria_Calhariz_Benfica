const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Rotas Públicas
router.post('/register', authController.registar);
router.post('/login', authController.login);
router.post('/reenviar-verificacao', authController.reenviarVerificacao);
router.post('/recuperar-password', authController.recuperarPassword);
router.post('/redefinir-password', authController.redefinirPassword);

// Rotas Protegidas
router.get('/me', verificarToken, authController.me);

module.exports = router;