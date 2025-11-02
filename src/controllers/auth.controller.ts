import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import database from "../connection/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

// database
//   .getConnection()
//   .then((conn) => {
//     console.log("Conexão com o banco OK!");
//     conn.release(); // libera a conexão de volta pro pool
//   })
//   .catch((err) => {
//     console.error("Erro ao conectar no banco:", err);
//   });

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Email ou senha incorrecta" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(senha, user.senha);

    if (!match)
      return res.status(401).json({ error: "Email ou senha incorrecta" });

    const [faculdadeRows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM faculdades WHERE id_faculdade = ?",
      [user.id_faculdade]
    );

    const faculdade = faculdadeRows[0] || null;

    const token = jwt.sign(
      { id: user.id_participante },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    // Aqui você pode criar token JWT se quiser
    return res.json({
      user: {
        id_participante: user.id_participante,
        nome: user.nome,
        email: user.email,
        faculdade,
      },
      token,
      message: "Login feito com sucesso",
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, id_faculdade = null } = req.body;

    // checar se email já existe
    const [existingUser] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0)
      return res.status(409).json({ error: "Email já cadastrado" });

    // hash da senha
    const hash = await bcrypt.hash(senha, Number(process.env.SALT_ROUNDS));

    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO participantes (nome, email, senha, id_faculdade) VALUES (?, ?, ?, ?)",
      [nome, email, hash, id_faculdade]
    );

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_participante = ?",
      [result.insertId]
    );

    const user = rows[0];

    const token = jwt.sign(
      { id: user.id_participante },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      user,
      token,
      message: "Usuário registrado com sucesso",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
