const express = require("express");
const router = express.Router();
const candidaturaController = require("../controllers/candidaturaController");
const loginExigido = require('../middlewares/authMiddleware');

router.post('/submeter', loginExigido, candidaturaController.submeterCandidatura);

module.exports = router;