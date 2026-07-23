SET FOREIGN_KEY_CHECKS = 0;
-- -----------------------------------------------------
-- 1. TABELA USER 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.user (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  apelido VARCHAR(100) NOT NULL,
  email VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('admin', 'candidato', 'superadmin') NOT NULL DEFAULT 'candidato',
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 2. TABELA CANDIDATO 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.candidato (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  data_nascimento DATE NOT NULL,
  num_cc VARCHAR(9) NOT NULL,
  nif VARCHAR(9) NOT NULL,
  morada VARCHAR(150) NOT NULL,
  codigo_postal VARCHAR(7) NOT NULL,
  telefone VARCHAR(9) NOT NULL,
  instituicao_1 VARCHAR(45) NOT NULL,
  instituicao_2 VARCHAR(45) NULL,
  instituicao_3 VARCHAR(45) NULL,
  freguesia VARCHAR(100) NOT NULL,
  curso VARCHAR(100) NOT NULL,
  observacoes VARCHAR(255) NULL,
  ano_letivo VARCHAR(20) NOT NULL,
  estado ENUM(
    'rascunho',
    'incompleta',
    'aguarda_documentos',
    'aguarda_validacao',
    'em_analise',
    'pendente_correcao',
    'aprovada',
    'rejeitada',
    'arquivada',
    'desistencia'
  ) NOT NULL DEFAULT 'rascunho',
  PRIMARY KEY (id),
  UNIQUE INDEX user_id_UNIQUE (user_id ASC) VISIBLE,
  UNIQUE INDEX num_cc_UNIQUE (num_cc ASC) VISIBLE,
  UNIQUE INDEX nif_UNIQUE (nif ASC) VISIBLE,
  CONSTRAINT fk_candidato_user1 FOREIGN KEY (user_id) REFERENCES mydb.user (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 3. TABELA ADMIN 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.admin (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX user_id_admin_UNIQUE (user_id ASC) VISIBLE,
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES mydb.user (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 4. TABELA AGREGADO FAMILIAR
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.agregado_familiar (
  id INT NOT NULL AUTO_INCREMENT,
  candidato_id INT NOT NULL,
  nif VARCHAR(9) NOT NULL,
  nome_completo VARCHAR(100) NOT NULL,
  telefone VARCHAR(9) NOT NULL,
  grau_parentesco ENUM(
    'Pai',
    'Mãe',
    'Irmão',
    'Irmã',
    'Avô',
    'Avó',
    'Tio',
    'Tia',
    'Primo',
    'Prima',
    'Outro'
  ) NOT NULL,
  PRIMARY KEY (id),
  INDEX fk_table1_candidato1_idx (candidato_id ASC) VISIBLE,
  CONSTRAINT fk_table1_candidato1 FOREIGN KEY (candidato_id) REFERENCES mydb.candidato (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 5. TABELA DOCUMENTOS
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.documentos (
  id INT NOT NULL AUTO_INCREMENT,
  candidato_id INT NOT NULL,
  tipo_documento ENUM(
    'CC_frente',
    'CC_verso',
    'Declaracao_Residencia_Fiscal',
    'Comprovativo_Inscricao_Matricula',
    'IRS_Nota_Liquidacao',
    'Documento_bolsa_estudo',
    'Comprovativo_rendimento_atual'
  ) NOT NULL,
  motivo VARCHAR(255) NULL,
  url_ficheiro VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
  INDEX fk_table2_candidato1_idx (candidato_id ASC) VISIBLE,
  CONSTRAINT fk_table2_candidato1 FOREIGN KEY (candidato_id) REFERENCES mydb.candidato (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 6. TABELA CONFIGURACAO 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.configuracao (
  chave VARCHAR(50) NOT NULL,
  valor VARCHAR(255) NOT NULL,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (chave)
) ENGINE = InnoDB;
-- -----------------------------------------------------
-- 7. TABELA FAQ
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS mydb.faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(50) NOT NULL DEFAULT 'candidatura',
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  ordem INT DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;
SET FOREIGN_KEY_CHECKS = 1;