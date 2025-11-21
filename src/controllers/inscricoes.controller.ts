import { RowDataPacket } from "mysql2";
import { Request, Response } from "express";
import database from "../connection/database";
import { AuthRequest } from "../interfaces/request";

export const inscrever_se = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {id_evento, id_edicao} = req.body;

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Usuário não encontrado" });
    }

    const [rows1] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_user=?",
      [id]
    );

    if (rows1.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Participante não encontrado" });
    }

    const [rows2] = await database.query<RowDataPacket[]>(
      "SELECT * FROM inscricoes WHERE id_participante = ? AND id_evento = ? AND id_edicao = ?",
      [rows1[0].id, id_evento, id_edicao]
    );

    if (rows2.length > 0) {
      return res
        .status(409)
        .json({ error: true, message: "Usuário já está inscrito" });
    }

    const [eventoRows] = await database.query<RowDataPacket[]>(
      "SELECT vagas_disponiveis FROM eventos WHERE id = ?",
      [id_evento]
    );

    if(eventoRows[0].vagas_disponiveis<=0){
      return res.json({ message: "Sem vagas disponíveis" });
    }else{
        await database.query("INSERT INTO inscricoes (id_participante, id_evento, id_edicao) VALUES (?, ?, ?)",
          [rows1[0].id, id_evento, id_edicao]
        );
        await database.query(
          "UPDATE eventos SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?",
          [id_evento]
        );

        return res.json({ message: "Inscrição realizada com sucesso" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro no servidor" });
  }
};

export const cancelarInscricao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {id_evento, id_edicao} = req.body;

    const [rows] = await database.query<RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Usuário não encontrado" });
    }

    const [rows1] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_user=?",
      [id]
    );

    if (rows1.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Participante não encontrado" });
    }

    const [rows2] = await database.query<RowDataPacket[]>(
      "SELECT * FROM inscricoes WHERE id_participante = ? AND id_evento = ? AND id_edicao = ?",
      [rows1[0].id, id_evento, id_edicao]
    );

    if (rows2.length === 0) {
      return res
        .status(409)
        .json({ error: true, message: "O Usuário não está inscrito" });
    }

    await database.query("DELETE FROM inscricoes WHERE id = ? ", [rows2[0].id]);

    await database.query(
      "UPDATE eventos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?",
      [id_evento]
    );

    return res.json({ message: "Inscrição Cancelada com sucesso" });
    
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro no servidor" });
  }
};

export const listaInscricoes = async (req: AuthRequest, res: Response) => {
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

    const [rows1] = await database.query<RowDataPacket[]>(
      "SELECT * FROM participantes WHERE id_user=?",
      [id]
    );

    if (rows1.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Participante não encontrado" });
    }

    const [inscricoesRows] = await database.query<RowDataPacket[]>(
      `SELECT e.titulo AS titulo_evento, ed.ano AS ano_edicao, ed.nome AS nome_edicao, i.data_inscricao, i.presenca
      FROM inscricoes i
      JOIN eventos e ON i.id_evento = e.id
      JOIN edicoes ed ON i.id_edicao = ed.id
      WHERE i.id_participante = ?`,
      [rows1[0].id]
    );

    if (inscricoesRows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "O Usuário não está inscrito em nenhum evento" });
    }

    return res.json({ 
      message: "Minhas Inscrições",
      minhasInscricoes: inscricoesRows
    });
    
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro no servidor" });
  }
};
