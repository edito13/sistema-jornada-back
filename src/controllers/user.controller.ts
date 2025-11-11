import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";
import { Request, Response } from "express";
import database from "../connection/database";
import { AuthRequest } from "../interfaces/request";

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [data] = await database.query<RowDataPacket[]>(
      `SELECT 
          id, 
          users.nome, 
          email, 
          role, 
          faculdades.nome AS faculdade 
        FROM users 
        LEFT JOIN faculdades 
        ON users.id_faculdade = faculdades.id_faculdade 
        WHERE users.id = ?`,
      [id]
    );

    if (data.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = data[0];

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const [data] = await database.query<RowDataPacket[]>(
      "SELECT id, users.nome, email, role, faculdades.nome AS faculdade FROM users LEFT JOIN faculdades ON users.id_faculdade = faculdades.id_faculdade"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};

export const editar_perfil = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id; // pegar o usuário autenticado
    const { nome, id_faculdade } = req.body;

    //pegar o usuario com esse id
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (rows[0].nome != nome) {
      await database.query("UPDATE users SET nome = ? WHERE id = ?", [
        nome,
        id,
      ]);
    }

    if (rows[0].id_faculdade != id_faculdade) {
      await database.query("UPDATE users SET id_faculdade = ? WHERE id = ?", [
        id_faculdade,
        id,
      ]);
    }
    return res.json({ message: "Perfil atualizado com sucesso" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
};

export const editar_senha = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.user?.id;
    const { senhaantiga, senhanova } = req.body;

    //pegar o usuario
    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const SALT_ROUNDS = 10;
    const match = await bcrypt.compare(senhaantiga, rows[0].senha);
    if (!match) {
      return res.status(400).json({
        error: true,
        message: "A senha antiga incorreta.",
      });
    }

    const hash = await bcrypt.hash(senhanova, SALT_ROUNDS);
    await database.query("UPDATE users SET senha = ? WHERE id = ?", [hash, id]);

    return res.json({ message: "Senha alterada com sucesso" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: true, message: "Erro ao atualizar perfil" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Usuário não encontrado" });
    }

    await database.query("DELETE FROM users WHERE id = ? ", [id]);

    return res.json({ message: "Conta eliminada com sucesso" });
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro no servidor" });
  }
};
