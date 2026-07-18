const path = require('path');

// Tenta importar o bcryptjs
try {
    const bcrypt = require('bcryptjs');
    console.log("✅ bcryptjs importado com sucesso.");
    
    const password = "CMRBadmin_2026";
    const hash = bcrypt.hashSync(password, 10);
    
    console.log("--------------------------------------------------");
    console.log("A TUA HASH PARA SQL:", hash);
    console.log("--------------------------------------------------");
} catch (e) {
    console.error("❌ ERRO AO IMPORTAR BCRYPTJS:");
    console.error(e.message);
    console.error("Dica: Corre 'npm install bcryptjs' na pasta backend.");
}

// Tenta importar o db (com caminho corrigido para subir um nível)
try {
    const db = require(path.join(__dirname, '../config/db'));
    console.log("✅ db.js importado com sucesso de:", path.join(__dirname, '../config/db'));
} catch (e) {
    console.error("❌ ERRO AO IMPORTAR DB.JS:");
    console.error("O Node não encontrou o ficheiro em:", path.join(__dirname, '../config/db'));
    console.error("Verifica se o ficheiro existe nesta pasta.");
}