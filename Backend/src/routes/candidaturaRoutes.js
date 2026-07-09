const express = require("express");
const router = express.Router();
const candidaturaController = require("../controllers/candidaturaController");

router.post('/submeter', candidaturaController.submeterCandidatura);

module.exports = router;