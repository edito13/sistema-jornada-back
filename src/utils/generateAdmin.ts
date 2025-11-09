import bcrypt from "bcrypt";
import dotenv from "dotenv";
import database from "../connection/database";

dotenv.config();

const generateAdmin = async () => {
  const email = "admin@sistema.com";
  const nome = "Administrador";
  const senha = process.env.ADMIN_PWD as string;
  const saltRounds = 10;
  const hash = await bcrypt.hash(senha, saltRounds);

  await database.query(
    `INSERT INTO users (nome, email, senha, role)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha = VALUES(senha), role = VALUES(role)`,
    [nome, email, hash, "admin"]
  );
};

export default generateAdmin;
