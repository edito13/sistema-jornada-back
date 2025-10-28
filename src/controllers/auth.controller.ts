import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";
import { Request, Response } from "express";
import database from "../connection/database";

const SALT_ROUNDS = 10;

database
  .getConnection()
  .then((conn) => {
    console.log("Conexão com o banco OK!");
    conn.release(); // libera a conexão de volta pro pool
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco:", err);
  });

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Email ou senha incorretos" });
    }

    // Aqui você pode criar token JWT se quiser
    return res.status(200).json({
      message: "Login bem-sucedido",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email e password são obrigatórios" });
    }

    // checar se email já existe
    const [existingUser] = await database.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // hash da senha
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await database.query<RowDataPacket[]>(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash]
    );

    return res.status(201).json({
      user: { id: (result as any).insertId, name, email },
      message: "Usuário registrado com sucesso",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
