import { Request, Response } from "express";
import database from "../connection/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const createFaculdade = async (req: Request, res: Response) => {
  const { nome } = req.body;

  try {
    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO faculdades (nome) VALUES (?)",
      [nome]
    );

    if (result.insertId) {
      res.status(201).json({ message: "Faculdade cadastrada com sucesso!" });
    }
  } catch (error: any) {
    res.json({ error: true, message: error.message });
  }
};

export const getFaculdades = async (req: Request, res: Response) => {
  try {
    const [data] = await database.query<RowDataPacket[]>(
      "SELECT * FROM faculdades ORDER BY id ASC"
    );

    res.json(data);
  } catch (error: any) {
    res.json({ error: true, message: error.message });
  }
};

export const deleteFaculdade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result] = await database.query<ResultSetHeader>(
      "DELETE FROM faculdades WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Faculdade não encontrada" });
    }

    res.json({ message: "Faculdade deletada com sucesso" });
  } catch (error: any) {
    res.json({ error: true, message: error.message });
  }
};
