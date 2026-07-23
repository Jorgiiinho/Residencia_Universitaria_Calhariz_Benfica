const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const { enviarEmailMudancaEstado } = require('../../config/mailer');

// Função auxiliar: Formatação de Código Postal (ex: 9000-000)
const formatarCodigoPostal = (val) => {
  if (!val) return null;
  const clean = String(val).replace(/\D/g, "");
  if (clean.length === 7) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return val;
};

// =============================================================================
// LISTAR TODAS AS CANDIDATURAS (Permitido: 'admin' e 'superadmin')
// =============================================================================
exports.listarTodasCandidaturas = async (req, res) => {
  try {
    const querySQL = `
      SELECT 
        candidato.id as candidatura_id, 
        CONCAT(user.nome, ' ', IFNULL(user.apelido, '')) as nome_completo, 
        user.email, 
        candidato.ano_letivo, 
        candidato.curso,
        candidato.estado
      FROM candidato
      JOIN user ON candidato.user_id = user.id
      ORDER BY candidato.id DESC
    `;

    const [rows] = await db.query(querySQL);
    return res.status(200).json({ ok: true, candidaturas: rows });
  } catch (error) {
    console.error('❌ Erro ao listar candidaturas:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno ao obter a listagem de candidaturas.' });
  }
};

// =============================================================================
// DOSSIÊ DETALHADO DO ALUNO (Permitido: 'admin' e 'superadmin')
// =============================================================================
exports.obterDetalhesCandidatura = async (req, res) => {
  const { id } = req.params;

  try {
    const queryCandidato = `
      SELECT 
        candidato.id as id, 
        candidato.user_id as userId,
        CONCAT(user.nome, ' ', IFNULL(user.apelido, '')) as nome_completo, 
        user.email, 
        candidato.ano_letivo as academicYear, 
        candidato.curso,
        candidato.instituicao_1 as institution, 
        candidato.instituicao_2 as institutionAlt2, 
        candidato.instituicao_3 as institutionAlt3,
        candidato.telefone as phone, 
        candidato.nif, 
        candidato.num_cc as ccNumber,  
        candidato.data_nascimento as birthdate, 
        candidato.codigo_postal as postalCode, 
        candidato.morada as address,
        candidato.estado as status
      FROM candidato
      JOIN user ON candidato.user_id = user.id
      WHERE candidato.id = ?
    `;

    const [candidatoDetalhes] = await db.query(queryCandidato, [id]);
    
    if (candidatoDetalhes.length === 0) {
      return res.status(404).json({ ok: false, error: 'Candidatura não encontrada.' });
    }

    // Agregado familiar associado à candidatura
    const [agregadoFamiliarDetalhes] = await db.query(
      `SELECT id, nif, nome_completo as fullName, telefone as phone, grau_parentesco as kinship 
       FROM agregado_familiar 
       WHERE candidato_id = ?`, 
      [id]
    );

    // Documentos submetidos na candidatura
    const [documentosDetalhes] = await db.query(
      `SELECT id, tipo_documento as type, url_ficheiro as fileName, criado_em as uploadedAt, estado as status, motivo as rejectionReason 
       FROM documentos 
       WHERE candidato_id = ?`, 
      [id]
    );

    return res.status(200).json({
      ok: true,
      candidatura: {
        ...candidatoDetalhes[0],
        postalCode: formatarCodigoPostal(candidatoDetalhes[0].postalCode)
      },
      agregado_familiar: agregadoFamiliarDetalhes,
      documentos: documentosDetalhes
    });

  } catch (error) {
    console.error("❌ Erro ao obter a ficha do candidato:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar os detalhes do processo." });
  }
};

// =============================================================================
// AVALIAÇÃO INDIVIDUAL DE DOCUMENTO (Permitido: 'admin' e 'superadmin')
// =============================================================================
exports.atualizarEstadoDocumento = async (req, res) => {
  const { documento_id } = req.params;
  const { estado, motivo } = req.body;

  const estadosValidos = ['pendente', 'aprovado', 'rejeitado'];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ ok: false, error: "Estado inválido. Use 'pendente', 'aprovado' ou 'rejeitado'." });
  }

  try {
    const atualizarEstadoDoc = `UPDATE documentos SET estado = ?, motivo = ? WHERE id = ?`;
    const [resultado] = await db.query(atualizarEstadoDoc, [estado, motivo || null, documento_id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Documento não encontrado na base de dados." });
    }
    return res.status(200).json({ ok: true, mensagem: "Estado do documento atualizado com sucesso!" });
  } catch (error) {
    console.error("❌ Erro ao atualizar o estado do documento:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao atualizar o estado do documento." });
  }
};

// =============================================================================
// MÁQUINA DE ESTADOS DO PROCESSO + E-MAIL (Permitido: 'admin' e 'superadmin')
// =============================================================================
exports.atualizarEstadoCandidatura = async (req, res) => {
  const { id } = req.params; 
  const { estado, observacoes } = req.body;

  const estadosValidos = [
    'rascunho', 
    'incompleta', 
    'aguarda_documentos', 
    'aguarda_validacao', 
    'em_analise', 
    'pendente_correcao', 
    'aprovada', 
    'rejeitada', 
    'arquivada', 
    'desistencia'
  ];  
  
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ ok: false, error: "Estado de processo inválido." });
  }

  try {
    const query = 'UPDATE candidato SET estado = ?, observacoes = ? WHERE id = ?';
    const [result] = await db.query(query, [estado, observacoes || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Candidatura não encontrada." });
    }

    // Notificar candidato por e-mail sobre a alteração de estado
    const [userInfo] = await db.query(
      `SELECT user.email, CONCAT(user.nome, ' ', IFNULL(user.apelido, '')) as nome_completo 
       FROM candidato 
       JOIN user ON candidato.user_id = user.id 
       WHERE candidato.id = ?`,
      [id]
    );

    if (userInfo.length > 0) {
      const candidato = userInfo[0];

      enviarEmailMudancaEstado(
        candidato.email,
        candidato.nome_completo,
        estado,
        observacoes
      ).catch((err) => console.error("❌ Erro ao enviar e-mail de notificação de estado:", err));
    }

    return res.json({ 
      ok: true, 
      message: `O processo foi alterado para '${estado}' com sucesso.` 
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar estado da candidatura:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao modificar o estado." });
  }
};

// =============================================================================
// CRIAR NOVO ADMINISTRADOR (Exclusivo: 'superadmin')
// =============================================================================
exports.criarFuncionarioAdmin = async (req, res) => {
  const { nome, apelido, email, password, telefone } = req.body;

  try {
    if (!email || !password || !nome) {
      return res.status(400).json({ ok: false, error: "Por favor, preencha todos os campos obrigatórios." });
    }

    const [emailExists] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (emailExists.length > 0) {
      return res.status(400).json({ ok: false, error: 'Este e-mail já está registado na plataforma.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserir Utilizador na tabela principal com tipo = 'admin'
    const inserirUserAdmin = `
      INSERT INTO user (nome, apelido, email, password, telefone, tipo) 
      VALUES (?, ?, ?, ?, ?, 'admin')
    `;
    const [resultInsercao] = await db.query(inserirUserAdmin, [
      nome, 
      apelido || '', 
      email, 
      hashedPassword, 
      telefone || null
    ]);
    
    const novoAdminId = resultInsercao.insertId;

    // Registo de suporte na tabela 'admin' (se existir na base de dados)
    try {
      await db.query(`INSERT INTO admin (user_id) VALUES (?)`, [novoAdminId]);
    } catch (e) {
      // Ignora caso a tabela 'admin' não esteja em uso
    }

    return res.status(201).json({ ok: true, message: "Novo administrador registado com sucesso!" });

  } catch (error) {
    console.error("❌ Erro ao criar administrador:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao gerar a conta de administrador." });
  }
};

// =============================================================================
// ABRIR / FECHAR PERÍODO DE CANDIDATURAS (Exclusivo: 'superadmin')
// =============================================================================
exports.togglePeriodoCandidaturas = async (req, res) => {
  const { candidaturasAbertas, anoLetivo } = req.body; // ex: true/false, "2026/2027"

  try {
    // 1. Guarda estado de abertura
    await db.query(
      `INSERT INTO configuracao (chave, valor) VALUES ('candidaturas_abertas', ?)
       ON DUPLICATE KEY UPDATE valor = ?`,
      [candidaturasAbertas ? '1' : '0', candidaturasAbertas ? '1' : '0']
    );

    // 2. Guarda o ano letivo ativo
    if (anoLetivo) {
      await db.query(
        `INSERT INTO configuracao (chave, valor) VALUES ('ano_letivo_ativo', ?)
         ON DUPLICATE KEY UPDATE valor = ?`,
        [anoLetivo, anoLetivo]
      );
    }

    return res.json({ 
      ok: true, 
      message: `Período de candidaturas atualizado com sucesso!`,
      candidaturasAbertas,
      anoLetivo 
    });

  } catch (error) {
    console.error("❌ Erro ao alterar período de candidaturas:", error);
    return res.status(500).json({ ok: false, error: "Erro ao atualizar estado do período de candidaturas." });
  }
};
// =============================================================================
// CONSULTAR ESTADO E ANO LETIVO (Acesso Público)
// =============================================================================
exports.obterEstadoCandidaturas = async (req, res) => {
  try {
    const [rowsAbertas] = await db.query("SELECT valor FROM configuracao WHERE chave = 'candidaturas_abertas'");
    const [rowsAno] = await db.query("SELECT valor FROM configuracao WHERE chave = 'ano_letivo_ativo'");
    
    const abertas = rowsAbertas.length > 0 ? rowsAbertas[0].valor === '1' : true;
    const anoLetivo = rowsAno.length > 0 ? rowsAno[0].valor : "2026/2027";

    return res.json({ ok: true, candidaturasAbertas: abertas, anoLetivo });
  } catch (error) {
    return res.json({ ok: true, candidaturasAbertas: true, anoLetivo: "2026/2027" });
  }
};
exports.obterAnosLetivosDisponiveis = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT ano_letivo FROM candidato WHERE ano_letivo IS NOT NULL ORDER BY ano_letivo DESC'
    );
    const anos = rows.map((r) => r.ano_letivo);
    if (!anos.includes('2026/2027')) anos.unshift('2026/2027');
    return res.status(200).json({ ok: true, anosLetivos: anos });
  } catch (error) {
    console.error('❌ Erro ao obter anos letivos:', error);
    return res.status(500).json({ ok: false, error: 'Erro ao obter anos letivos.' });
  }
};