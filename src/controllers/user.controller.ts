import { RowDataPacket } from "mysql2";
import { Request, Response } from "express";
import database from "../connection/database";

export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [data] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_participante = ?",
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
      "SELECT * FROM participantes"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
};
