const db = require('../../config/db');

// SUBMETER CANDIDATURA (Etapa 1: Dados Pessoais, Académicos e Agregado)
exports.submeterCandidatura = async (asyncReq, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 🛡️ Segurança: O id do utilizador vem encriptado do Token JWT (req.userId) 
    // e não do corpo do formulário, evitando que um aluno altere dados de outro.
    const user_id = asyncReq.userId; 

    // Extraímos os novos campos que movemos para a tabela candidato
    const {
      data_nascimento,
      num_cc,
      nif,
      morada,
      codigo_postal,
      telefone,
      instituicao_1,
      instituicao_2,
      instituicao_3,
      curso,
      ano_letivo,
      agregado_familiar
    } = asyncReq.body;

    // Validação preventiva atualizada com todos os novos campos obrigatórios
    if (
      !user_id || 
      !data_nascimento || 
      !num_cc || 
      !nif || 
      !morada || 
      !codigo_postal || 
      !telefone || 
      !instituicao_1 || 
      !curso || 
      !ano_letivo
    ) {
      await connection.rollback();
      return res.status(400).json({ ok: false, error: "Por favor, preencha todos os dados pessoais e académicos obrigatórios." });
    }

    // INSERIR NA TABELA 'CANDIDATO' (Query reestruturada com os novos campos civis)
    const sqlCandidato = `
      INSERT INTO candidato (
        user_id, data_nascimento, num_cc, nif, morada, codigo_postal, telefone, 
        instituicao_1, instituicao_2, instituicao_3, curso, ano_letivo, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho')
    `;
    
    const [resultadoCandidato] = await connection.query(sqlCandidato, [
      user_id,
      data_nascimento,
      num_cc,
      nif,
      morada,
      codigo_postal,
      telefone,
      instituicao_1,
      instituicao_2 || null,
      instituicao_3 || null,
      curso,
      ano_letivo
    ]);

    const candidatoId = resultadoCandidato.insertId;

    // INSERIR OS FAMILIARES NA TABELA 'AGREGADO_FAMILIAR'
    if (agregado_familiar && agregado_familiar.length > 0) {
      const sqlAgregado = `
        INSERT INTO agregado_familiar (candidato_id, nif, nome_completo, telefone, grau_parentesco)
        VALUES (?, ?, ?, ?, ?)
      `;

      for (const membro of agregado_familiar) {
        if (!membro.nif || !membro.nome_completo || !membro.telefone || !membro.grau_parentesco) {
          throw new Error("Dados de membro do agregado incompletos.");
        }
        
        await connection.query(sqlAgregado, [
          candidatoId,
          membro.nif,
          membro.nome_completo,
          membro.telefone,
          membro.grau_parentesco
        ]);
      }
    }

    await connection.commit();
    
    return res.status(201).json({ 
      ok: true, 
      mensagem: "Dados pessoais, académicos e agregado familiar guardados com sucesso!", 
      candidatoId 
    });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao submeter candidatura:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao processar a candidatura.", detalhe: error.message });
  } finally {
    connection.release();
  }
};

//BUSCAR MINHA CANDIDATURA 
exports.obterMinhaCandidatura = async (req, res) => {
  try {
    const user_id = req.userId; // Extraído de forma segura do Token JWT

    const querySQL = 'SELECT * FROM candidato WHERE user_id = ?';
    const [rows] = await db.query(querySQL, [user_id]);

    if (rows.length === 0) {
      // Se não houver linha, devolve candidato como null 
      return res.status(200).json({ ok: true, candidatura: null });
    }

    // Se houver, devolve o registo 
    return res.status(200).json({ ok: true, candidatura: rows[0] });

  } catch (error) {
    console.error('Erro ao obter a candidatura do utilizador:', error);
    return res.status(500).json({ ok: false, error: 'Erro interno ao verificar o estado do seu processo.' });
  }
};