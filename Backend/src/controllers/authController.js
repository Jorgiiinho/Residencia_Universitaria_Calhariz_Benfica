const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {jwtsecret} = require('../config/env');


exports.registar = async (req,res) => {
    try{
        const{
            primeiro_nome,
            apelido,
            email,
            telefone,
            num_cc,
            nif,
            password,
            morada_completa,
            codigo_postal,
            data_nascimento
        } = req.body;

        // validação básica
         if(!email || !password || !primeiro_nome || !apelido || !num_cc || !nif || !morada_completa || !codigo_postal || !data_nascimento){
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        //Verifica se o email já está registado
        const emailExists = await db.query('SELECT * FROM user WHERE email= ?', [email]);
        if (emailExists[0].length > 0 ) {
            return res.status(400).json({ error: 'Email já registado' });
        }
     
        //Verifica se o número de cartão de cidadão já está registado
        const numCCExists = await db.query('SELECT * FROM user WHERE num_cc= ?', [num_cc]);
        if (numCCExists[0].length > 0 ) {
            return res.status(400).json({ error: 'Número de cartão de cidadão já registado' });
        }

        //Verifica se o NIF já está registado
        const nifExists = await db.query('SELECT * FROM user WHERE nif= ?', [nif]);
        if (nifExists[0].length > 0 ) {
            return res.status(400).json({ error: 'NIF já registado' });
        }

        //Verifica se o número de telefone já está registado
        const telefoneExists = await db.query('SELECT * FROM user WHERE telefone= ?', [telefone]);
        if (telefoneExists[0].length > 0 ) {
            return res.status(400).json({ error: 'Número de telefone já registado' });
        }

        //Encriptacão da password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        //Inserção do utilizador na base de dados

        const inserirCandidato = 'INSERT INTO user (primeiro_nome, apelido, data_nascimento, num_cc, nif, morada_completa, codigo_postal, telefone, email, password, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'candidato\')';
        await db.query(inserirCandidato, [primeiro_nome, apelido, data_nascimento, num_cc, nif, morada_completa, codigo_postal, telefone, email, hashedPassword]);
        res.status(201).json({ message: 'Utilizador registado com sucesso' });
        }
        catch (error) {
            console.error('Erro registando utilizador:', error);
            res.status(500).json({ error: 'Erro interno do servidor ao criar utilizador' });
        }
}

exports.login = async (req,res) => {
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return  res.status(400).json({ error: 'Email e password são obrigatórios' });
        }

        const {rows} = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ error: 'Email ou password inválidos' });
        }

        const utilizador = rows[0];

        const passwordCorreta = await bcrypt.compare(password, utilizador.password);
        if(!passwordCorreta){
            return res.status(400).json({error: 'Email ou password inválidos'});
        }

        const token = jwt.sign({ id: utilizador.id, tipo:utilizador.tipo_usuario }, jwtsecret, { expiresIn: '1d' });
        res.json({ token });

        return res.json({ok: true, message: 'Login bem sucedido', token, user: { id:utilizador.id, primeiro_nome: utilizador.primeiro_nome, apelido: utilizador.apelido, email: utilizador.email, tipo_usuario: utilizador.tipo_usuario }});
    }catch{
        console.error('Erro no processo de login:', error);
        return res.status(500).json({ error: 'Erro interno do servidor ao fazer login' });
    }
}
