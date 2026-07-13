const db = require('../../config/db');
const bcrypt = require('bcryptjs');

// 📊 1. LISTAR TODAS AS CANDIDATURAS (Para a tabela do Dashboard Geral)
exports.listarTodasCandidaturas = async (req, res) => {
  try {
    // Adicionado candidato.estado para alimentar as badges coloridas no React
    const querySQL = `
      SELECT 
        candidato.id as candidatura_id, 
        CONCAT(user.nome, ' ', user.apelido) as nome_completo, 
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

// 🔍 2. DOSSIÊ DETALHADO DO ALUNO (Ficha completa, Agregado e PDFs)
exports.obterDetalhesCandidatura = async (req, res) => {
  const { id } = req.params;

  try {
    // 👈 Correção: Campos civis (nif, num_cc, morada...) movidos para o prefixo 'candidato.'
    // 👈 Correção: Removida a vírgula incorreta que estava antes do FROM
    const queryCandidato = `
      SELECT 
        candidato.id as candidatura_id, 
        CONCAT(user.nome, ' ', user.apelido) as nome_completo, 
        user.email, 
        candidato.ano_letivo, 
        candidato.curso,
        candidato.instituicao_1, 
        candidato.instituicao_2, 
        candidato.instituicao_3,
        candidato.telefone, 
        candidato.nif, 
        candidato.num_cc,  
        candidato.data_nascimento, 
        candidato.codigo_postal, 
        candidato.morada,
        candidato.estado
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
      `SELECT id, nif, nome_completo, telefone, grau_parentesco FROM agregado_familiar WHERE candidato_id = ?`, 
      [id]
    );

    // Procura a lista de PDFs e os respetivos estados de aprovação individual
    const [documentosDetalhes] = await db.query(
      `SELECT tipo_documento, url_ficheiro, criado_em, estado FROM documentos WHERE candidato_id = ?`, 
      [id]
    );

    return res.status(200).json({
      ok: true,
      candidatura: candidatoDetalhes[0],
      agregado_familiar: agregadoFamiliarDetalhes,
      documentos: documentosDetalhes
    });

  } catch (error) {
    console.error("Erro ao obter a ficha do candidato:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar os detalhes do processo." });
  }
};

// 📄 3. AVALIAÇÃO INDIVIDUAL DE DOCUMENTO (Aprovar / Rejeitar um PDF específico)
exports.atualizarEstadoDocumento = async (req, res) => {
  const { candidato_id } = req.params;
  const { tipo_documento, novo_estado } = req.body;

  const estadosValidos = ['pendente', 'aprovado', 'rejeitado'];

  if (!estadosValidos.includes(novo_estado)) {
    return res.status(400).json({ ok: false, error: "Estado inválido. Use 'pendente', 'aprovado' ou 'rejeitado'." });
  }

  try {
    const atualizarEstadoDoc = `UPDATE documentos SET estado = ? WHERE candidato_id = ? AND tipo_documento = ?`;
    const [resultado] = await db.query(atualizarEstadoDoc, [novo_estado, candidato_id, tipo_documento]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Documento não encontrado para este candidato." });
    }
    return res.status(200).json({ ok: true, mensagem: "Estado do documento atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar o estado do documento:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao atualizar o estado do documento." });
  }
};

// 🏛️ 4. GESTÃO DE EQUIPA (Criar conta profissional para outro funcionário da Câmara)
exports.criarFuncionarioAdmin = async (req, res) => {
  const { nome, apelido, email, password } = req.body;

  try {
    if (!email || !password || !nome || !apelido) {
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
      INSERT INTO user (nome, apelido, email, password, tipo) 
      VALUES (?, ?, ?, ?, 'admin')
    `;
    const [resultInsercaoUserAdmin] = await db.query(inserirUserAdmin, [nome, apelido, email, hashedPassword]);
    
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

//  MAQUINA DE ESTADOS DO PROCESSO
exports.atualizarEstadoCandidatura = async (req, res) => {
  const { id } = req.params; 
  const { novo_estado } = req.body; 

  const estadosValidos = ['rascunho', 'aguarda_documentos', 'aguarda_validacao', 'em_analise', 'pendente_correcao', 'aprovado', 'rejeitado', 'arquivado', 'desistencia'];  
  
  if (!estadosValidos.includes(novo_estado)) {
    return res.status(400).json({ ok: false, error: "Estado de processo inválido." });
  }

  try {
    const query = 'UPDATE candidato SET estado = ? WHERE id = ?';
    const [result] = await db.query(query, [novo_estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Candidatura não encontrada." });
    }

    const nomesEstados = {
      'rascunho': 'Rascunho',
      'aguarda_documentos': 'Aguardar Envio de Documentos',
      'aguarda_validacao': 'Aguarda Validação',
      'em_analise': 'Em Análise',
      'pendente_correcao': 'Pendente de Correção',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'arquivado': 'Arquivado',
      'desistencia': 'Desistência Declarada'
    };

    return res.json({ 
      ok: true, 
      message: `O processo foi alterado para: ${nomesEstados[novo_estado]}.` 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Erro interno ao modificar o estado." });
  }
};