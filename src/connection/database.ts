import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const database = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "sistema_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default database;

//TABELAS

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS faculdades (
  id_faculdade INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  id_faculdade INT NULL,
  senha VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  FOREIGN KEY (id_faculdade) REFERENCES faculdades(id_faculdade) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS participantes (
  id_participante INT AUTO_INCREMENT PRIMARY KEY,
  id_user NOT NULL,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS edicoes (
  id_edicao INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  ano INT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status ENUM('preparacao', 'aberta', 'encerrada') DEFAULT 'preparacao'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS palestrantes (
  id_palestrante INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  especialidade VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eventos (
  id_evento INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  local VARCHAR(100),
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME NOT NULL,
  vagas_totais INT NOT NULL,
  vagas_disponiveis INT NOT NULL,
  id_palestrante INT NOT NULL,
  id_faculdade INT NOT NULL,
  id_edicao INT NOT NULL,
  FOREIGN KEY (id_palestrante) REFERENCES palestrantes(id_palestrante) ON DELETE RESTRICT,
  FOREIGN KEY (id_faculdade) REFERENCES faculdades(id_faculdade) ON DELETE CASCADE,
  FOREIGN KEY (id_edicao) REFERENCES edicoes(id_edicao) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inscricoes (
  id_inscricao INT AUTO_INCREMENT PRIMARY KEY,
  id_participante INT NOT NULL,
  id_evento INT NOT NULL,
  id_edicao INT NOT NULL,
  data_inscricao DATETIME DEFAULT CURRENT_TIMESTAMP,
  presenca BOOLEAN DEFAULT FALSE,
  UNIQUE (id_participante, id_evento, id_edicao),
  FOREIGN KEY (id_participante) REFERENCES participantes(id_participante) ON DELETE CASCADE,
  FOREIGN KEY (id_evento) REFERENCES eventos(id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_edicao) REFERENCES edicoes(id_edicao) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS certificados (
  id_certificado INT AUTO_INCREMENT PRIMARY KEY,
  id_inscricao INT NOT NULL,
  codigo_validacao CHAR(10) UNIQUE NOT NULL,
  data_emissao DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_inscricao) REFERENCES inscricoes(id_inscricao) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id_admin INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

export async function setupDatabase() {
  let connection;
  try {
    connection = await database.getConnection();
    console.log("Conectado ao MySQL");

    const statements = createTablesSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      if (statement) {
        await connection.query(statement);
        const tableName = statement.match(
          /CREATE TABLE IF NOT EXISTS (\w+)/
        )?.[1];
        if (tableName) {
          console.log(` Tabela '${tableName}' criada/verificada`);
        }
      }
    }

    console.log("Todas as tabelas foram criadas com sucesso!");
  } catch (error) {
    console.error("Erro ao criar tabelas:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// chamando setupDatabase
setupDatabase()
  .then(() => {
    console.log("conexao concluída!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("conexao migração:", error);
    process.exit(1);
  });
