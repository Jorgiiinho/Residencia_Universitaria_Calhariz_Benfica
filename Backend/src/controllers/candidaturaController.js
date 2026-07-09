const db = require('../config/db');

exports.submeterCandidatura = async (req, res) => {
  // Pedimos uma conexão dedicada à pool para isolar a nossa transação
  const connection = await db.getConnection();

  try {
    // 🚀 Iniciar a Transação SQL
    await connection.beginTransaction();

    const {
      user_id, 
      instituicao_1,
      instituicao_2,
      instituicao_3,
      curso,
      ano_letivo,
      agregado_familiar 
    } = req.body;

    // 1. Validação básica de campos obrigatórios do candidato
    if (!user_id || !instituicao_1 || !curso || !ano_letivo) {
      await connection.rollback();
      return res.status(400).json({ erro: "Por favor, preencha os dados académicos obrigatórios." });
    }

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

    if (agregado_familiar && agregado_familiar.length > 0) {
      const sqlAgregado = `
        INSERT INTO agregado_familiar (candidato_id, nif, nome_completo, telefone, grau_parentesco)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Percorremos o array e executamos um INSERT por cada familiar
      for (const membro of agregado_familiar) {

        if (!membro.nif || !membro.nome_completo || !membro.telefone || !membro.grau_parentesco) {
          throw new Error("Dados de membro do agregado incompletos (NIF, nome, telefone e grau_parentesco são obrigatórios).");
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
    return res.status(201).json({ ok: true, mensagem: "Etapa 1 concluída! Dados guardados.", candidatoId });
    
    } catch (error) {
    // Se houver qualquer falha, desfazemos tudo para não corromper a BD
    await connection.rollback();
    console.error("Erro ao submeter candidatura:", error);
    return res.status(500).json({ erro: "Erro interno ao processar a candidatura.", detalhe: error.message });
    
    } finally {
    // Libertar obrigatoriamente a conexão de volta para a pool
    connection.release();
  }
};
