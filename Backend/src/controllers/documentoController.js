const db = require('../../config/db');

exports.importarDocumento = async (req, res) => {
  try {
    // Segurança: Pegamos o user_id seguro do Token JWT
    const user_id = req.userId;

    // Procura o ID interno do candidato associado a este utilizador
    const [candidatoRows] = await db.query('SELECT id FROM candidato WHERE user_id = ?', [user_id]);
    
    if (candidatoRows.length === 0) {
      return res.status(404).json({ ok: false, error: "Inscrição não encontrada. Inicie a Etapa 1 primeiro." });
    }
    
    const candidatoId = candidatoRows[0].id;

    // Validar corretamente usando 'req.files' (plural) vindo do upload.fields()
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ ok: false, error: "Nenhum documento foi anexado para envio." });
    }

    // Query corrigida e preparada
    const inserirDocumento = `
      INSERT INTO documentos (candidato_id, tipo_documento, url_ficheiro, estado) 
      VALUES (?, ?, ?, 'pendente')
    `;
    
    const promessas = [];

    // O loop percorre os campos enviados (Ex: req.files['CC'], req.files['IRS'])
    for (const campo in req.files) {
      const ficheiro = req.files[campo][0];

      // Agora a query e os parâmetros batem certo.
      // Salvamos o caminho do ficheiro (ficheiro.path ou ficheiro.filename dependendo do teu multer)
      promessas.push(
        db.query(inserirDocumento, [candidatoId, campo, ficheiro.path])
      );
    }
    
    // Executa todos os inserts em simultâneo na base de dados
    await Promise.all(promessas);

    // Como o aluno acabou de enviar os ficheiros, alteramos 
    // o estado da candidatura dele de 'aguarda_documentos' para 'aguarda_validacao'
    // Assim o processo salta automaticamente para a fila de espera da Câmara!
    await db.query(
      "UPDATE candidato SET estado = 'aguarda_validacao' WHERE id = ?", 
      [candidatoId]
    );

    return res.status(200).json({
      ok: true,
      mensagem: "Todos os documentos obrigatórios foram submetidos! A sua candidatura foi enviada para validação municipal."
    });

  } catch (error) {
    console.error("Erro no upload de documentos:", error);
    return res.status(500).json({ ok: false, error: "Erro interno ao importar os documentos.", detalhe: error.message });
  }
};