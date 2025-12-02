import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/request";
import database from "../connection/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const getPalestrantes = async (req: AuthRequest, res: Response) => {
  try {
    const [palestrantes] = await database.query<RowDataPacket[]>(
      "SELECT * FROM palestrantes"
    );

    res.status(200).json(palestrantes);
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Erro ao pegar os palestrantes" });
  }
};

const getPalestrante = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [palestrante] = await database.query<RowDataPacket[]>(
      "SELECT * FROM palestrantes WHERE id = ?",
      [id]
    );

    res.status(200).json(palestrante);
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Erro ao pegar o palestrante" });
  }
};

const createPalestrante = async (req: AuthRequest, res: Response) => {
  const { nome, email, especialidade } = req.body;

  try {
    const [result] = await database.query<ResultSetHeader>(
      "INSERT INTO palestrantes (nome, email, especialidade) VALUES (?, ?, ?)",
      [nome, email, especialidade]
    );

    if (result.insertId) {
      return res
        .status(201)
        .json({ message: "Palestrante criado com sucesso" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Erro ao criar o palestrante" });
  }
};

const editPalestrante = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { nome, email, especialidade } = req.body;

  try {
    const [result] = await database.query<ResultSetHeader>(
      `UPDATE palestrantes SET 
        nome = ?, 
        email = ?, 
        especialidade = ?
      WHERE id = ?`,
      [nome, email, especialidade, id]
    );

    if (result.affectedRows > 0) {
      return res
        .status(200)
        .json({ message: "Palestrante editado com sucesso" });
    }

    return res
      .status(404)
      .json({ error: true, message: "Palestrante não encontrado" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Erro ao atualizar o palestrante",
    });
  }
};

const deletePalestrante = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await database.query<ResultSetHeader>(
      "DELETE FROM palestrantes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Palestrante não encontrado" });
    }

    res.status(200).json({ message: "Palestrante deletado com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Erro ao deletar o palestrante" });
  }
};

export {
  getPalestrantes,
  getPalestrante,
  createPalestrante,
  editPalestrante,
  deletePalestrante,
};
