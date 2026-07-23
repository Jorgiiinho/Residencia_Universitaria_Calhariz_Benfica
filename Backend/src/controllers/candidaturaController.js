const db = require('../../config/db');

// Lista oficial de documentos estritamente obrigatórios para submissão
const DOCS_OBRIGATORIOS = [
  'CC_frente',
  'CC_verso',
  'Declaracao_Residencia_Fiscal',
  'Comprovativo_Inscricao_Matricula',
  'IRS_Nota_Liquidacao'
];

const limparCampo = (valor) => {
  if (valor === undefined || valor === null) return null;
  const str = String(valor).trim();
  return str === "" ? null : str;
};

const formatarCodigoPostal = (val) => {
  if (!val) return null;
  const clean = String(val).replace(/\D/g, "");
  if (clean.length === 7) {
    return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  }
  return val;
};

// 1. CRIAR OU ATUALIZAR RASCUNHO (POST /api/candidaturas)
exports.criarOuAtualizarCandidatura = async (req, res) => {
  const connection = await db.getConnection();
  const user_id = req.userId || (req.user && req.user.id);

  if (!user_id) {
    connection.release();
    return res.status(401).json({ ok: false, error: "Sessão expirada." });
  }

  try {
    await connection.beginTransaction();

    const candidatoData = req.body.candidato || req.body || {};
    const agregado_familiar = req.body.agregado_familiar || req.body.agregado || [];

    const data_nascimento = limparCampo(candidatoData.data_nascimento);
    const num_cc         = limparCampo(candidatoData.num_cc);
    const nif            = limparCampo(candidatoData.nif);
    const morada         = limparCampo(candidatoData.morada);
    const freguesia      = limparCampo(candidatoData.freguesia);
    const telefone       = limparCampo(candidatoData.telefone);
    const instituicao_1  = limparCampo(candidatoData.instituicao_1);
    const instituicao_2  = limparCampo(candidatoData.instituicao_2);
    const instituicao_3  = limparCampo(candidatoData.instituicao_3);
    const curso          = limparCampo(candidatoData.curso);
    const ano_letivo     = limparCampo(candidatoData.ano_letivo);

    let codigo_postal = limparCampo(candidatoData.codigo_postal);
    if (codigo_postal) {
      codigo_postal = codigo_postal.replace(/\D/g, "");
    }

    const [existe] = await connection.query('SELECT id FROM candidato WHERE user_id = ?', [user_id]);
    let candidatoId;

    if (existe.length > 0) {
      candidatoId = existe[0].id;
      const sqlUpdate = `
        UPDATE candidato SET 
          data_nascimento = ?, num_cc = ?, nif = ?, morada = ?, codigo_postal = ?, freguesia = ?,
          telefone = ?, instituicao_1 = ?, instituicao_2 = ?, instituicao_3 = ?, 
          curso = ?, ano_letivo = ?
        WHERE id = ?
      `;
      await connection.query(sqlUpdate, [
        data_nascimento, num_cc, nif, morada, codigo_postal, freguesia,
        telefone, instituicao_1, instituicao_2, instituicao_3,
        curso, ano_letivo, candidatoId
      ]);
    } else {
      const sqlInsert = `
        INSERT INTO candidato (
          user_id, data_nascimento, num_cc, nif, morada, codigo_postal, freguesia, telefone, 
          instituicao_1, instituicao_2, instituicao_3, curso, ano_letivo, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho')
      `;
      const [resultadoCandidato] = await connection.query(sqlInsert, [
        user_id, data_nascimento, num_cc, nif, morada, codigo_postal, freguesia, telefone, 
        instituicao_1, instituicao_2, instituicao_3, curso, ano_letivo
      ]);
      candidatoId = resultadoCandidato.insertId;
    }

    await connection.query('DELETE FROM agregado_familiar WHERE candidato_id = ?', [candidatoId]);

    if (agregado_familiar && agregado_familiar.length > 0) {
      const sqlAgregado = `
        INSERT INTO agregado_familiar (candidato_id, nif, nome_completo, telefone, grau_parentesco)
        VALUES (?, ?, ?, ?, ?)
      `;
      for (const m of agregado_familiar) {
        const nomeMembro = limparCampo(m.fullName || m.nome_completo);
        if (nomeMembro) {
          await connection.query(sqlAgregado, [
            candidatoId,
            limparCampo(m.nif) || '',
            nomeMembro,
            limparCampo(m.phone || m.telefone) || '',
            limparCampo(m.kinship || m.grau_parentesco) || 'Outro'
          ]);
        }
      }
    }

    await connection.commit();
    return res.status(200).json({ ok: true, mensagem: "Candidatura guardada com sucesso!", candidatoId });

  } catch (error) {
    await connection.rollback();
    console.error("Erro ao guardar candidatura:", error);
    return res.status(500).json({ ok: false, error: "Erro interno no servidor." });
  } finally {
    connection.release();
  }
};

// 2. BUSCAR MINHA CANDIDATURA (GET /api/candidaturas/me)
exports.obterMinhaCandidatura = async (req, res) => {
  const user_id = req.userId || (req.user && req.user.id);

  if (!user_id) {
    return res.status(401).json({ ok: false, error: "Utilizador não autenticado." });
  }

  try {
    const [rows] = await db.query('SELECT * FROM candidato WHERE user_id = ?', [user_id]);
    if (rows.length === 0) {
      return res.status(200).json({ ok: true, candidatura: null });
    }

    const candidato = rows[0];

    const [family] = await db.query(
      'SELECT id, nif, nome_completo as fullName, telefone as phone, grau_parentesco as kinship FROM agregado_familiar WHERE candidato_id = ?', 
      [candidato.id]
    );

    const [docs] = await db.query(
      'SELECT id, tipo_documento as type, url_ficheiro as fileName, criado_em as uploadedAt, estado as status, motivo as rejectionReason FROM documentos WHERE candidato_id = ?', 
      [candidato.id]
    );

    return res.status(200).json({ 
      ok: true, 
      candidatura: {
        id: candidato.id,
        userId: candidato.user_id,
        status: candidato.estado,
        personal: {
          birthdate: candidato.data_nascimento,
          ccNumber: candidato.num_cc,
          nif: candidato.nif,
          address: candidato.morada,
          parish: candidato.freguesia, 
          postalCode: formatarCodigoPostal(candidato.codigo_postal),
          phone: candidato.telefone,
          institution: candidato.instituicao_1,
          institutionAlt2: candidato.instituicao_2,
          institutionAlt3: candidato.instituicao_3,
          course: candidato.curso,
          academicYear: candidato.ano_letivo
        },
        family: family,
        documents: docs
      } 
    });

  } catch (error) {
    console.error('Erro ao obter candidatura:', error);
    return res.status(500).json({ ok: false, error: "Erro interno de sincronização." });
  }
};

// 3. SUBMETER CANDIDATURA FINAL (POST /api/candidaturas/:id/submeter)
exports.submeterCandidatura = async (req, res) => {
  const { id } = req.params;

  try {
    // Busca os tipos de documentos já guardados na base de dados
    const [docs] = await db.query(
      'SELECT tipo_documento FROM documentos WHERE candidato_id = ?',
      [id]
    );

    const tiposExistentes = docs.map((d) => d.tipo_documento);

    // Valida se falta algum documento obrigatório
    const emFalta = DOCS_OBRIGATORIOS.filter(
      (tipo) => !tiposExistentes.includes(tipo)
    );

    if (emFalta.length > 0) {
      return res.status(400).json({ 
        ok: false, 
        error: `Faltam anexar documentos obrigatórios: ${emFalta.join(', ')}` 
      });
    }

    // Transita o estado do candidato para 'aguarda_validacao'
    const [result] = await db.query(
      "UPDATE candidato SET estado = 'aguarda_validacao' WHERE id = ?", 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: "Candidatura não localizada." });
    }

    return res.status(200).json({ ok: true, mensagem: "Candidatura submetida com sucesso!" });

  } catch (error) {
    console.error('Erro ao submeter candidatura:', error);
    return res.status(500).json({ ok: false, error: "Erro interno ao submeter candidatura." });
  }
};