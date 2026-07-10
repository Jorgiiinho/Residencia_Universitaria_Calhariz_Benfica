const db = require('../config/db');

exports.submeterCandidatura = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      user_id, // O React envia apenas o ID do utilizador logado
      instituicao_1,
      instituicao_2,
      instituicao_3,
      curso,
      ano_letivo,
      agregado_familiar
    } = req.body;

    // Validação preventiva
    if (!user_id || !instituicao_1 || !curso || !ano_letivo) {
      await connection.rollback();
      return res.status(400).json({ error: "Por favor, preencha os dados académicos obrigatórios." });
    }

    // INSERIR NA TABELA 'CANDIDATO'
    const sqlCandidato = `
      INSERT INTO candidato (user_id, instituicao_1, instituicao_2, instituicao_3, curso, ano_letivo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [resultadoCandidato] = await connection.query(sqlCandidato, [
      user_id,
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
      mensagem: "Dados académicos e agregado familiar guardados com sucesso!", 
      candidatoId 
    });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao submeter candidatura:", error);
    return res.status(500).json({ error: "Erro interno ao processar a candidatura.", detalhe: error.message });
  } finally {
    connection.release();
  }
};