const db = require ('../config/db');
const bcrypt = require('bcrypt');

exports.listarTodasCandidaturas = async (req, res) => {
    try{
        const candidaturas =` SELECT candidato.id as candidatura_id, CONCAT(user.nome, ' ', user.apelido) as nome_completo, user.email, candidato.ano_letivo, candidato.curso
         FROM candidato
         JOIN user ON candidato.user_id = user.id `;

        const [rows] = await db.query(candidaturas);
        
        return res.status(200).json({ok : true, candidaturas: rows});
    } catch (error) {
        console.error('Erro ao listar candidaturas:', error);
        return res.status(500).json({ ok: false, error: 'Erro interno ao obter a listagem de candidaturas' });
    }

};

exports.obterDetalhesCandidatura = async (req, res) => {
    const { id } = req.params;

    try {
        const [candidatoDetalhes] = await db.query(
            `SELECT candidato.id as candidatura_id, CONCAT(user.nome, ' ', user.apelido) as nome_completo, user.email, candidato.ano_letivo, candidato.curso,candidato.instituicao_1, candidato.instituicao_2, candidato.instituicao_3,user.telefone, user.nif, user.num_cc,  user.data_nascimento, user.codigo_postal, user.morada,
             FROM candidato
             JOIN user ON candidato.user_id = user.id
             WHERE candidato.id = ?`, [id]
        );
        
        if (candidatoDetalhes.length === 0) {
            return res.status(404).json({ ok: false, error: 'Candidatura não encontrada' });
        }

        const [agregadoFamiliarDetalhes] = await db.query(
            `SELECT nif, nome_completo, telefone, grau_parentesco
             FROM agregado_familiar
             WHERE candidato_id = ?`, [id]
        );

        const [documentosDetalhes] = await db.query(
            `SELECT tipo_documento, url_ficheiro, criado_em,estado
             FROM documentos
             WHERE candidato_id = ?`, [id]
        );

        return res.status(200).json({
            ok: true,
            candidatura: candidatoDetalhes[0],
            agregado_familiar: agregadoFamiliarDetalhes,
            documentos: documentosDetalhes
        });
    }catch (error) {
    console.error("Erro ao obter a ficha do candidato:", error);
    return res.status(500).json({ error: "Erro interno ao processar os detalhes do processo." });
    }
}

exports.atualizarEstadoDocumento = async (req, res) => {
    const {candidato_id} = req.params;
    const {tipo_documento, novo_estado} = req.body;

    const estadoValidos = ['pendente', 'aprovado', 'rejeitado'];

    if(!estadoValidos.includes(novo_estado)){
        return res.status(400).json({error: "Estado inválido. Os estados válidos são: 'pendente', 'aprovado', 'rejeitado'."});
    }

    try{
        const atualizarEstadoDoc = `UPDATE documentos SET estado = ? WHERE candidato_id = ? AND tipo_documento = ? `;

        const [estadoatualizado] = await db.query(atualizarEstadoDoc, [novo_estado, candidato_id, tipo_documento]);

        if(estadoatualizado.affectedRows === 0){
            return res.status(404).json({error: "Documento não encontrado"});
        }
        return res.status(200).json({ok: true, mensagem: "Estado do documento atualizado com sucesso!"});
    }catch (error) {
        console.error("Erro ao atualizar o estado do documento:", error);
        return res.status(500).json({error: "Erro interno ao atualizar o estado do documento."});
    }
}

exports.criarFuncionarioAdmin = async (req, res) => {
  const { nome, apelido, email, password, telefone, nif, num_cc, data_nascimento, morada, codigo_postal } = req.body;

    try {
        if (!email || !password || !nome || !nif) {
            return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios." });
        }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const inserirUserAdmin = `
      INSERT INTO user (nome, apelido, data_nascimento, num_cc, nif, morada, codigo_postal, telefone, email, password, tipo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')
    `;
    const [resultInsercaoUserAdmin] = await db.query(inserirUserAdmin, [nome, apelido, data_nascimento, num_cc, nif, morada, codigo_postal, telefone, email, hashedPassword]);
    
    const novoAdminId = resultInsercaoUserAdmin.insertId;

    const inserirAdmin = `
      INSERT INTO admin (user_id, nome_completo) 
      VALUES (?, ?)
    `;
    await db.query(inserirAdmin, [novoAdminId, `${nome} ${apelido}`]);

    return res.status(201).json({ ok: true, message: "Novo funcionário administrativo registado com sucesso!" });

  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    return res.status(500).json({ error: "Erro interno ao gerar a conta administrativa." });
  }
};

exports.atualizarEstadoCandidatura = async (req, res) => {
  const { id } = req.params; 
  const { novo_estado } = req.body; 

    const estadosValidos = ['rascunho', 'aguarda_documentos', 'aguarda_validacao', 'em_analise', 'pendente_correcao', 'aprovado', 'rejeitado', 'arquivado', 'desistencia'];  
  
    if (!estadosValidos.includes(novo_estado)) {
    return res.status(400).json({ error: "Estado de processo inválido." });
    }

    try {
    const query = 'UPDATE candidato SET estado = ? WHERE id = ?';
    const [result] = await db.query(query, [novo_estado, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Candidatura não encontrada." });
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
        return res.status(500).json({ error: "Erro interno ao modificar o estado." });
    }
};