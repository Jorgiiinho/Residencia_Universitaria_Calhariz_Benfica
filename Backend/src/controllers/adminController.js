const db = require('../../config/db');
const bcrypt = require('bcryptjs');

const formatarCodigoPostal = (val) => {
  if (!val) return null;
  const clean = String(val).replace(/\D/g, "");
  if (clean.length === 7) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return val;
};

// LISTAR TODAS AS CANDIDATURAS (Para a tabela do Dashboard Geral)
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
    `;

    const [rows] = await db.query(querySQL);
    return res.status(200).json({ ok: true, candidaturas: rows });
  } catch (error) {
    console.error('Erro ao listar candidaturas:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno ao obter a listagem de candidaturas.' });
  }
};

// DOSSIÊ DETALHADO DO ALUNO (Ficha completa, Agregado e PDFs)
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

    // Procura os membros do agregado familiar vinculados a este candidato
    const [agregadoFamiliarDetalhes] = await db.query(
      `SELECT id, nif, nome_completo as fullName, telefone as phone, grau_parentesco as kinship FROM agregado_familiar WHERE candidato_id = ?`, 
      [id]
    );

    // Procura a lista de PDFs e os respetivos estados de aprovação individual
    const [documentosDetalhes] = await db.query(
      `SELECT id, tipo_documento as type, url_ficheiro as fileName, criado_em as uploadedAt, estado as status, motivo as rejectionReason FROM documentos WHERE candidato_id = ?`, 
      [id]
    );

    return res.status(200).json({
        ok: true,
        candidatura: {
        ...candidatoDetalhes[0],
        postalCode: formatarCodigoPostal(candidatoDetalhes[0].postalCode) // 🌟 Formata o código postal para o admin ver com o hífen!
            },
        agregado_familiar: agregadoFamiliarDetalhes,
        documentos: documentosDetalhes
    });

  } catch (error) {
    console.error("Erro ao obter a ficha do candidato:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar os detalhes do processo." });
  }
};

// AVALIAÇÃO INDIVIDUAL DE DOCUMENTO (Aprovar / Rejeitar um PDF específico)
exports.atualizarEstadoDocumento = async (req, res) => {
  const { documento_id } = req.params;
  const { estado, motivo } = req.body; // 🌟 Sincronizado com o payload enviado pelo frontend

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
    console.error("Erro ao atualizar o estado do documento:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao atualizar o estado do documento." });
  }
};

// GESTÃO DE EQUIPA (Criar conta profissional para outro funcionário da Câmara)
exports.criarFuncionarioAdmin = async (req, res) => {
  const { nome, email, password, telefone } = req.body; // 🌟 Adaptado para receber o payload unificado do frontend

  try {
    if (!email || !password || !nome) {
      return res.status(400).json({ ok: false, error: "Por favor, preencha todos os campos obrigatórios." });
    }

    // Verifica se o e-mail institucional já existe
    const [emailExists] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (emailExists.length > 0) {
      return res.status(400).json({ ok: false, error: 'Este e-mail já está registado na plataforma.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Grava as credenciais básicas na tabela 'user' com o cargo 'admin'
    const inserirUserAdmin = `
      INSERT INTO user (nome, email, password, telefone, tipo) 
      VALUES (?, ?, ?, ?, 'admin')
    `;
    const [resultInsercaoUserAdmin] = await db.query(inserirUserAdmin, [nome, email, hashedPassword, telefone || null]);
    
    const novoAdminId = resultInsercaoUserAdmin.insertId;

    // Vincula o ID gerado na tabela 'admin' de controlo interno
    const inserirAdmin = `INSERT INTO admin (user_id) VALUES (?)`;
    await db.query(inserirAdmin, [novoAdminId]);

    return res.status(201).json({ ok: true, message: "Novo funcionário administrativo registado com sucesso!" });

  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao gerar a conta administrativa." });
  }
};

// MÁQUINA DE ESTADOS DO PROCESSO
exports.atualizarEstadoCandidatura = async (req, res) => {
  const { id } = req.params; 
  const { estado, observacoes } = req.body; // 🌟 Sincronizado com os parâmetros de decisão do administrador

  const estadosValidos = ['rascunho', 'incompleta', 'aguarda_documentos', 'aguarda_validacao', 'em_analise', 'pendente_correcao', 'aprovada', 'rejeitada', 'arquivada', 'desistencia'];  
  
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ ok: false, error: "Estado de processo inválido." });
  }

  try {
    const query = 'UPDATE candidato SET estado = ?, observacoes = ? WHERE id = ?';
    const [result] = await db.query(query, [estado, observacoes || null, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Candidatura não encontrada." });
    }

    return res.json({ 
      ok: true, 
      message: `O processo foi alterado com sucesso.` 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Erro interno ao modificar o estado." });
  }
};