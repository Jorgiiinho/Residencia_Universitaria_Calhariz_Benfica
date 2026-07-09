const db = require('../../config/db');

exports.importarDocumento = async (req, res) => {
  const { candidatoId } = req.params;

    try {
        //valida se o multer capturou o  ficheiro
        if(!req.file || Object.keys(req.file).length === 0){
            return res.status(400).json({ erro: "Nenhum documento foi anexado para envio." });
        }
        
        const inserirDocumento=`INSERT INTO documentos (candidato_id, tipo_documento,url_ficheiro,estado) VALUES (?,?,?,?)`;
        
        const promessas = [];

        //O loop percorre os campos enviados

        for (const campo in req.files) {
            const ficheiro = req.files[campo][0];

            promessas.push(db.query(inserirDocumento, [candidatoId, campo, ficheiro.path]));    
        }
        
        await Promise.all(promessas);

        return res.status(200).json({
            ok: true,
            mensagem: "Todos os documentos obrigatórios foram anexados. Candidatura finalizada com sucesso!"
        });

    } catch (error) {
        console.error("Erro no upload de documentos:", error);
        return res.status(500).json({ erro: "Erro interno ao importar os documentos.", detalhe: error.message });
    }
};
