import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/request";
import database from "../connection/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const getEditions = async (req: AuthRequest, res: Response) => {
  try {
    const [editions] = await database.query<RowDataPacket[]>(
      "SELECT * FROM edicoes"
    );

    return res.status(200).json(editions);
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao pegar os Edições" });
  }
};

const getEdition = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [edition] = await database.query<RowDataPacket[]>(
      "SELECT * FROM edicoes WHERE id = ?",
      [id]
    );

    return res.status(200).json(edition);
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao pegar o edition" });
  }
};

const createEdition = async (req: AuthRequest, res: Response) => {
  const { nome, ano, data_inicio, data_fim, status } = req.body;
  try {
    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO edicoes (nome, ano, data_inicio, data_fim, status) VALUES (?, ?, ?, ?, ?)",
      [nome, ano, data_inicio, data_fim, status]
    );

    if (result.insertId) {
      return res.status(201).json({ message: "Edição criado com sucesso" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao criar a edição" });
  }
};

const editEdition = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    res.status(200).json({ message: `Edição ${id} editado com sucesso` });
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao editar edição" });
  }
};

const deleteEdition = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    res.status(200).json({ message: `Edição ${id} deletado com sucesso` });
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao deletar a Edição" });
  }
};

export { getEditions, getEdition, createEdition, editEdition, deleteEdition };
