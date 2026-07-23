const path = require('path');

async function executar() {
  try {
    const bcrypt = require('bcryptjs');
    const db = require(path.join(__dirname, '../config/db'));

    const email = "superadmin@cm-ribeirabrava.pt";
    const passwordOriginal = "CMRBadmin_2026";

    // 1. Gerar Hash
    const hash = await bcrypt.hash(passwordOriginal, 10);
    console.log("--------------------------------------------------");
    console.log("🔑 A tua Hash gerada:", hash);
    console.log("--------------------------------------------------");

    // 2. Atualizar na Base de Dados
    const [result] = await db.query(
      "UPDATE user SET password = ?, tipo = 'superadmin' WHERE email = ?",
      [hash, email]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ SUCESSO: Palavra-passe atualizada no TiDB para '${email}'!`);
    } else {
      console.log(`⚠️ ATENÇÃO: O e-mail '${email}' não foi encontrado na tabela 'user'.`);
    }

  } catch (error) {
    console.error("❌ ERRO NO SCRIPT:", error.message);
  } finally {
    process.exit();
  }
}

executar();