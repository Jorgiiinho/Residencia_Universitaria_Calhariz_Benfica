const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware para validar sessões se usares a rota /me
const loginExigido = require('../middlewares/authMiddleware');

// ROTA: Registo de candidatos (POST /api/auth/register)
router.post('/register', authController.registar);

// ROTA: Login geral (POST /api/auth/login)
router.post('/login', authController.login);

// ROTA: Obter dados do utilizador logado pelo Token (GET /api/auth/me)
router.get('/me', loginExigido, authController.me);

module.exports = router;