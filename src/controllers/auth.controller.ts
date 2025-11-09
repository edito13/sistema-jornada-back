import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { UserData } from "../interfaces";
import database from "../connection/database";
import generateToken from "../utils/generateToken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
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

    const token = generateToken(user as UserData);

    return res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        faculdade,
      },
      token,
      message: "Login feito com sucesso",
    });
  } catch (error: any) {
    console.error(error);
    res.json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, id_faculdade = null } = req.body;

    // checar se email já existe
    const [existingUser] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0)
      return res.status(409).json({ error: "Email já cadastrado" });

    // hash da senha
    const hash = await bcrypt.hash(senha, Number(process.env.SALT_ROUNDS));

    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO users (nome, email, senha, id_faculdade, role) VALUES (?, ?, ?, ?, 'user')",
      [nome, email, hash, id_faculdade]
    );

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    const user = rows[0];

    const token = generateToken(user as UserData);

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

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { nome, email, senha } = req.body;

    // checar se email já existe
    const [existingUser] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0)
      return res.status(409).json({ error: "Email já cadastrado" });

    const hash = await bcrypt.hash(senha, Number(process.env.SALT_ROUNDS));

    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO users (nome, email, senha, role) VALUES (?, ?, ?, 'admin')",
      [nome, email, hash]
    );

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    const user = rows[0];

    const token = generateToken(user as UserData);

    return res.status(201).json({
      user,
      token,
      message: "Administrador criado com sucesso",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Erro no servidor" });
  }
};
