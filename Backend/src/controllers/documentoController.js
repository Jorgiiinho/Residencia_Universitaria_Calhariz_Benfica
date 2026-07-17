const db = require('../../config/db');

// IMPORTAR DOCUMENTO GENÉRICO (POST /api/documentos/candidato/:candidato_id)
exports.importarDocumento = async (req, res) => {
  const candidatoId = req.params.candidato_id;
  const tipoDocumento = req.body.tipo_documento; // O tipo (CC, IRS...) vem no corpo do pedido
  const file = req.file; // Capturado pelo Multer via upload.single('file')

  try {
    if (!file) {
      return res.status(400).json({ ok: false, error: "Nenhum ficheiro PDF anexado." });
    }

    // Procura se já existe um PDF desse tipo para este candidato
    const [existe] = await db.query(
      'SELECT id FROM documentos WHERE candidato_id = ? AND tipo_documento = ?', 
      [candidatoId, tipoDocumento]
    );

    if (existe.length > 0) {
      // Faz o UPDATE do documento antigo
      const queryUpdate = `UPDATE documentos SET url_ficheiro = ?, estado = 'pendente', motivo = NULL WHERE id = ?`;
      await db.query(queryUpdate, [file.path, existe[0].id]);
    } else {
      // Faz o INSERT do novo documento
      const queryInsert = `
        INSERT INTO documentos (candidato_id, tipo_documento, url_ficheiro, estado) 
        VALUES (?, ?, ?, 'pendente')
      `;
      await db.query(queryInsert, [candidatoId, tipoDocumento, file.path]);
    }

    return res.status(200).json({ ok: true, mensagem: "Documento carregado com sucesso." });

  } catch (error) {
    console.error("Erro no upload do ficheiro:", error);
    return res.status(500).json({ ok: false, error: "Falha de gravação de ficheiros." });
  }
};

// REENVIAR DOCUMENTO CHUMBADO (PUT /api/documentos/:documento_id)
exports.reenviarDocumento = async (req, res) => {
  const { documento_id } = req.params;
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ ok: false, error: "Ficheiro em falta." });
    }

    // Substitui o caminho físico e limpa a rejeição passada
    const query = `UPDATE documentos SET url_ficheiro = ?, estado = 'pendente', motivo = NULL WHERE id = ?`;
    const [result] = await db.query(query, [file.path, documento_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Registo documental não localizado." });
    }

    return res.json({ ok: true, mensagem: "Documento retificado enviado para análise." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Falha no reenvio do documento." });
  }
};

// LISTAR DOCUMENTOS DE UM CANDIDATO (GET /api/documentos/candidato/:candidato_id)
exports.listarPorCandidato = async (req, res) => {
  const { candidato_id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, tipo_documento as type, url_ficheiro as fileName, criado_em as uploadedAt, estado as status, motivo as rejectionReason FROM documentos WHERE candidato_id = ?', 
      [candidato_id]
    );
    return res.json({ ok: true, documentos: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Erro ao carregar ficheiros." });
  }
};