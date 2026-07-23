const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');
const { enviarEmailRecuperacao, enviarEmailVerificacao } = require('../../config/mailer');

// 1. REGISTO DE CANDIDATO
exports.registar = async (req, res) => {
  console.log("🚨 [Auth] Pedido de registo recebido:", req.body);
  
  const { nome, firstName, apelido, lastName, email, password } = req.body; 
  const nomeFinal = (nome || firstName || '').trim();
  const apelidoFinal = (apelido || lastName || '').trim();

  try {
    if (!nomeFinal || !email || !password) {
      return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios." });
    }

    // Verificar se o utilizador já existe
    const [utilizadorExiste] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (utilizadorExiste.length > 0) {
      return res.status(400).json({ error: "Este e-mail já se encontra registado." });
    }

    // Encriptar palavra-passe
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Inserir utilizador na BD
    const [resultado] = await db.query(
      'INSERT INTO user (nome, apelido, email, password, tipo) VALUES (?, ?, ?, ?, "candidato")',
      [nomeFinal, apelidoFinal, email, passwordHashed]
    );

    const novoUtilizadorId = resultado.insertId;

    // Gerar Token JWT
    const token = jwt.sign(
      { id: novoUtilizadorId, tipo: 'candidato' },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // ✉️ E-mail de verificação (variáveis corrigidas)
    await enviarEmailVerificacao(email, nomeFinal, token);

    return res.status(201).json({
      ok: true,
      mensagem: "Conta criada com sucesso! Verifique a sua caixa de e-mail.",
      token,
      user: { 
        id: novoUtilizadorId, 
        nome: nomeFinal, 
        apelido: apelidoFinal, 
        email, 
        tipo: 'candidato' 
      }
    });

  } catch (error) {
    console.error('❌ Erro no registo do utilizador:', error);
    return res.status(500).json({ error: "Erro interno ao processar o registo da conta." });
  }
};

// 2. LOGIN UNIFICADO (Admin e Candidato)
exports.login = async (req, res) => {
  try {
    // 🔍 LOG DE DIAGNÓSTICO
  console.log("📥 [Backend] Pedido de login recebido!");
  console.log("📦 [Backend] Dados recebidos no body:", req.body);
    const { email, password, senha } = req.body;
    const passwordFinal = password || senha;

    if (!email || !passwordFinal) {
      return res.status(400).json({ ok: false, error: 'E-mail e palavra-passe são obrigatórios.' });
    }

    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ ok: false, error: 'E-mail ou palavra-passe incorretos.' });
    }

    const utilizador = rows[0];

    const passwordCorreta = await bcrypt.compare(passwordFinal, utilizador.password);
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
        apelido: utilizador.apelido || "",
        email: utilizador.email,
        tipo: utilizador.tipo
      }
    });

  } catch (error) {
    console.error('❌ Erro no processo de login:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno do servidor ao fazer login.' });
  }
};

// 3. VALIDAR SESSÃO EM TEMPO REAL (GET /api/auth/me)
exports.me = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, apelido, email, tipo FROM user WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Sessão expirada ou utilizador não encontrado." });
    }
    return res.json({ ok: true, user: rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Erro ao validar sessão." });
  }
};

// 4. RECUPERAR PALAVRA-PASSE (SOLICITAR LINK)
exports.recuperarPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ ok: false, error: "Por favor, introduza o seu e-mail." });
    }

    const [rows] = await db.query('SELECT id, nome FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Resposta genérica para evitar enumeração de utilizadores
      return res.json({ ok: true, message: "Se o e-mail estiver registado, enviámos o link de recuperação." });
    }

    const user = rows[0];
    const resetToken = jwt.sign({ id: user.id, finalidade: 'reset' }, jwtSecret, { expiresIn: '1h' });
    const resetLink = `http://localhost:5173/redefinir-password?token=${resetToken}`;

    await enviarEmailRecuperacao(email, user.nome, resetLink);

    return res.json({ ok: true, message: "E-mail de recuperação enviado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao recuperar palavra-passe:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar a recuperação de password." });
  }
};

// 5. REDEFINIR PALAVRA-PASSE COM TOKEN (ADICIONADA QUE FALTAVA)
// 5. REDEFINIR PALAVRA-PASSE COM TOKEN
exports.redefinirPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ ok: false, error: "Dados incompletos." });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "A palavra-passe deve ter no mínimo 6 caracteres." });
    }

    // Decodificar Token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (jwtErr) {
      return res.status(400).json({ ok: false, error: "A ligação de recuperação expirou ou é inválida." });
    }

    if (decoded.finalidade !== 'reset') {
      return res.status(400).json({ ok: false, error: "Token inválido para esta operação." });
    }

    // Encriptar nova palavra-passe
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);

    // Atualizar na base de dados TiDB
    const [result] = await db.query('UPDATE user SET password = ? WHERE id = ?', [passwordHashed, decoded.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Utilizador não localizado." });
    }

    return res.status(200).json({ ok: true, mensagem: "Palavra-passe redefinida com sucesso!" });

  } catch (error) {
    console.error("❌ Erro ao redefinir palavra-passe:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao redefinir a palavra-passe." });
  }
};

// 6. REENVIAR E-MAIL DE VERIFICAÇÃO
exports.reenviarVerificacao = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ ok: false, error: "E-mail é obrigatório." });
    }

    const [rows] = await db.query('SELECT id, nome FROM user WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Conta não encontrada." });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' });

    await enviarEmailVerificacao(email, user.nome, token);

    return res.json({ ok: true, message: "E-mail de verificação reenviado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao reenviar e-mail de verificação:", error);
    return res.status(500).json({ ok: false, error: "Erro ao reenviar e-mail de verificação." });
  }
};