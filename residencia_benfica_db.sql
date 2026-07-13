SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS mydb.documentos;
DROP TABLE IF EXISTS mydb.agregado_familiar;
DROP TABLE IF EXISTS mydb.admin;
DROP TABLE IF EXISTS mydb.candidato;
DROP TABLE IF EXISTS mydb.user;
--  TABELA USER (Dados gerais e credenciais de login)
CREATE TABLE IF NOT EXISTS mydb.user (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(45) NOT NULL,
  apelido VARCHAR(100) NOT NULL,
  email VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('admin', 'candidato') NOT NULL DEFAULT 'candidato',
  PRIMARY KEY (id),
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE
) ENGINE = InnoDB;
--  TABELA CANDIDATO (Dados pessoais e académicos exclusivos do Aluno)
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
  curso VARCHAR(100) NOT NULL,
  ano_letivo VARCHAR(20) NOT NULL,
  estado ENUM(
    'rascunho',
    'aguarda_documentos',
    'aguarda_validacao',
    'em_analise',
    'pendente_correcao',
    'aprovado',
    'rejeitado',
    'arquivado',
    'desistencia'
  ) NOT NULL DEFAULT 'rascunho',
  PRIMARY KEY (id),
  UNIQUE INDEX user_id_UNIQUE (user_id ASC) VISIBLE,
  UNIQUE INDEX num_cc_UNIQUE (num_cc ASC) VISIBLE,
  UNIQUE INDEX nif_UNIQUE (nif ASC) VISIBLE,
  CONSTRAINT fk_candidato_user1 FOREIGN KEY (user_id) REFERENCES mydb.user (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
--  TABELA ADMIN (Vínculo do Staff da Câmara - Sem dados redundantes)
CREATE TABLE IF NOT EXISTS mydb.admin (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE INDEX user_id_admin_UNIQUE (user_id ASC) VISIBLE,
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES mydb.user (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
-- TABELA AGREGADO FAMILIAR (Com ID corrigido e sem o UNIQUE do NIF para suportar irmãos)
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
--  TABELA DOCUMENTOS (Controlo de ficheiros PDF)
CREATE TABLE IF NOT EXISTS mydb.documentos (
  candidato_id INT NOT NULL,
  tipo_documento ENUM(
    'Formulario_candidatura',
    'CC',
    'Declaracao_Residencia',
    'Declaracao_Domicilio_Fiscal',
    'Comprovativo_Inscricao_Matricula',
    'Documento_bolsa_estudo',
    'IRS',
    'Comprovativos_Rendimento_Anuais'
  ) NOT NULL,
  url_ficheiro VARCHAR(255) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
  INDEX fk_table2_candidato1_idx (candidato_id ASC) VISIBLE,
  CONSTRAINT fk_table2_candidato1 FOREIGN KEY (candidato_id) REFERENCES mydb.candidato (id) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;
INSERT INTO mydb.user (id, nome, apelido, email, password, tipo)
VALUES (
    99,
    'Administrador',
    'Principal',
    'admin@ribeirabrava.pt',
    '$2a$10$7zBCl29qG3kK/7Q2Zl3g/O5UqZ0zS3U1v3b9x9k9e9r9y9o9u9m9i',
    'admin'
  );
INSERT INTO mydb.admin (user_id)
VALUES (99);
SET FOREIGN_KEY_CHECKS = 1;