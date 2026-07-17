const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');

// PROCESSO DE REGISTO
exports.registar = async (req, res) => {
  console.log("🚨 RECEBI UM PEDIDO DE REGISTO:", req.body);
  
  // Adicionamos 'apelido' aqui
  const { nome, apelido, email, password } = req.body; 

  try {
    // Adicionamos 'apelido' na validação
    if (!nome || !apelido || !email || !password) {
      return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios." });
    }

    const [utilizadorExiste] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (utilizadorExiste.length > 0) {
      return res.status(400).json({ error: "Este email já se encontra registado." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    //Adicionamos a coluna 'apelido' e o valor correspondente na query
    const [resultado] = await db.query(
      'INSERT INTO user (nome, apelido, email, password, tipo) VALUES (?, ?, ?, ?, "candidato")',
      [nome, apelido, email, passwordHashed] // Adicionamos 'apelido' no array
    );

    const novoUtilizadorId = resultado.insertId;

    const token = jwt.sign(
      { id: novoUtilizadorId, tipo: 'candidato' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      ok: true,
      mensagem: "Conta criada com sucesso!",
      token,
      user: { id: novoUtilizadorId, nome, apelido, email, tipo: 'candidato' }
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

    const passwordCorreta = await bcrypt.compare(password, utilizador.password);
    if (!passwordCorreta) {
      return res.status(400).json({ ok: false, error: 'E-mail ou palavra-passe incorretos.' });
    }

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
        email: utilizador.email,
        tipo: utilizador.tipo
      }
    });

  } catch (error) {
    console.error('Erro no processo de login:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno do servidor ao fazer login.' });
  }
};

// VALIDAR SESSÃO DO UTILIZADOR EM TEMPO REAL (GET /api/auth/me)
exports.me = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, email, tipo FROM user WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Sessão expirada." });
    }
    return res.json({ ok: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Erro ao validar sessão." });
  }
};