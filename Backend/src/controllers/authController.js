const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');

//PROCESSO DE REGISTO (Apenas dados básicos de conta)
exports.registar = async (req, res) => {
  const { nome, apelido, email, password } = req.body;

  try {
    // Validações básicas
    if (!nome || !apelido || !email || !password) {
      return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios." });
    }

    // Verifica se o email já existe
    const [utilizadorExiste] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (utilizadorExiste.length > 0) {
      return res.status(400).json({ error: "Este email já se encontra registado." });
    }

    // Encripta a password
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Cria o utilizador com o tipo padrão 'candidato'
    const [resultado] = await db.query(
      'INSERT INTO user (nome, apelido, email, password, tipo) VALUES (?, ?, ?, ?, "candidato")',
      [nome, apelido, email, passwordHashed]
    );

    const novoUtilizadorId = resultado.insertId;

    const token = jwt.sign(
      { id: novoUtilizadorId, tipo: 'candidato' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Devolvemos o token e os dados para o React
    return res.status(201).json({
      ok: true,
      mensagem: "Conta criada com sucesso!",
      token,
      user: {
        id: novoUtilizadorId,
        nome,
        apelido,
        email,
        tipo: 'candidato'
      }
    });

  } catch (error) {
    console.error('Erro registando utilizador:', error);
    return res.status(500).json({ error: "Erro interno ao processar o registo da conta." });
  }
};

// PROCESSO DE LOGIN UNIFICADO (Admin e Candidato)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email e password são obrigatórios.' });
    }

    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ ok: false, error: 'E-mail ou palavra-passe incorretos.' });
    }

    const utilizador = rows[0];

    // Compara a password digitada com o hash encriptado no banco de dados
    const passwordCorreta = await bcrypt.compare(password, utilizador.password);
    if (!passwordCorreta) {
      return res.status(400).json({ ok: false, error: 'E-mail ou palavra-passe incorretos.' });
    }

    // Gera o Token JWT contendo o ID e o Tipo ('admin' ou 'candidato')
    const token = jwt.sign(
      { id: utilizador.id, tipo: utilizador.tipo }, 
      jwtSecret, 
      { expiresIn: '1d' }
    );

    return res.json({
      ok: true,
      message: 'Login bem-sucedido!',
      token,
      user: {
        id: utilizador.id,
        nome: utilizador.nome,
        apelido: utilizador.apelido,
        email: utilizador.email,
        tipo: utilizador.tipo // Envia se é 'admin' ou 'candidato'
      }
    });

  } catch (error) {
    console.error('Erro no processo de login:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno do servidor ao fazer login.' });
  }
};