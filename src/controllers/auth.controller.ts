import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import { UserData } from "../interfaces";
import database from "../connection/database";
import generateToken from "../utils/generateToken";

// import dotenv from "dotenv";

// dotenv.config();

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

    if (!match) {
      return res.status(401).json({ error: "Email ou senha incorrecta" });
    }

    const [faculdadeRows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM faculdades WHERE id = ?",
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

export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Verifica se o email existe
    const [users] = await database.query<RowDataPacket[]>(
      "SELECT id, nome FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const user = users[0];

    // Gera o token de reset com validade curta (15min)
    const resetToken = generateToken({ id: user.id, email }, "15m");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Salva o token na tabela password_resets
    await database.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, resetToken, expiresAt]
    );

    // Envia o link de redefinição
    const resetUrl = `http://localhost:5173/resetar-senha/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "ricardocarlos1306@gmail.com",
      subject: "Redefinição de Senha",
      html: `
        <p>Olá, ${user.nome}</p>
        <p>Clique no link abaixo para redefinir sua senha (válido por 15 minutos):</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `,
    });

    res.json({ message: "Link foi enviado no seu email!" });
  } catch (err) {
    console.error("Erro completo: ", err);
    res.status(500).json({ message: "Erro ao enviar e-mail de redefinição" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    // 1️⃣ Verifica se o token é válido
    const decoded = Jwt.verify(token, process.env.JWT_SECRET as string);

    // 2️⃣ Verifica se o token ainda está válido no banco
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    const resetEntry = rows[0];

    // 3️⃣ Criptografa a nova senha e atualiza
    const hash = await bcrypt.hash(
      newPassword,
      Number(process.env.SALT_ROUNDS)
    );
    await database.query("UPDATE users SET senha = ? WHERE id = ?", [
      hash,
      resetEntry.user_id,
    ]);

    // 4️⃣ Marca o token como usado
    await database.query(
      "UPDATE password_resets SET used = TRUE WHERE id = ?",
      [resetEntry.id]
    );

    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Token inválido ou expirado" });
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
