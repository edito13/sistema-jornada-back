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
    res.json({ error: error.message });
  }
};

export const getFaculdades = async (req: Request, res: Response) => {
  try {
    const [data] = await database.query<RowDataPacket[]>(
      "SELECT * FROM faculdades"
    );

    res.json(data);
  } catch (error: any) {
    res.json({ error: error.message });
  }
};
