const db = require('../../config/db');

// 1. LISTAR FAQS (Acesso Público)
exports.listarFaqs = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM faq ORDER BY ordem ASC, id ASC');
    return res.status(200).json({ ok: true, faqs: rows });
  } catch (error) {
    console.error('❌ Erro ao obter FAQs:', error);
    return res.status(500).json({ ok: false, error: 'Erro ao obter as perguntas frequentes.' });
  }
};

// 2. CRIAR FAQ (Exclusivo SuperAdmin)
exports.criarFaq = async (req, res) => {
  const { categoria, pergunta, resposta, ordem } = req.body;

  if (!pergunta || !resposta) {
    return res.status(400).json({ ok: false, error: 'Pergunta e resposta são obrigatórias.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO faq (categoria, pergunta, resposta, ordem) VALUES (?, ?, ?, ?)',
      [categoria || 'candidatura', pergunta, resposta, ordem || 0]
    );

    return res.status(201).json({
      ok: true,
      mensagem: 'FAQ criada com sucesso!',
      faqId: result.insertId
    });
  } catch (error) {
    console.error('❌ Erro ao criar FAQ:', error);
    return res.status(500).json({ ok: false, error: 'Erro ao registar a nova FAQ.' });
  }
};

// 3. ATUALIZAR FAQ (Exclusivo SuperAdmin)
exports.atualizarFaq = async (req, res) => {
  const { id } = req.params;
  const { categoria, pergunta, resposta, ordem } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE faq SET categoria = ?, pergunta = ?, resposta = ?, ordem = ? WHERE id = ?',
      [categoria, pergunta, resposta, ordem || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'FAQ não encontrada.' });
    }

    return res.status(200).json({ ok: true, mensagem: 'FAQ atualizada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao atualizar FAQ:', error);
    return res.status(500).json({ ok: false, error: 'Erro ao modificar a FAQ.' });
  }
};

// 4. ELIMINAR FAQ (Exclusivo SuperAdmin)
exports.eliminarFaq = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM faq WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'FAQ não encontrada.' });
    }

    return res.status(200).json({ ok: true, mensagem: 'FAQ eliminada com sucesso!' });
  } catch (error) {
    console.error('❌ Erro ao eliminar FAQ:', error);
    return res.status(500).json({ ok: false, error: 'Erro ao apagar a FAQ.' });
  }
};