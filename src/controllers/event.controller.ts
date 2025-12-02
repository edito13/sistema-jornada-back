import { Request, Response } from "express";
import { AuthRequest } from "../interfaces/request";
import database from "../connection/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

const getEvents = async (req: Request, res: Response) => {
  try {
    const [rows] = await database.query<RowDataPacket[]>(`
      SELECT 
        e.id AS evento_id,
        e.titulo,
        e.descricao,
        e.local,
        e.data_inicio,
        e.data_fim,
        e.vagas_totais,
        e.vagas_disponiveis,

        p.id AS palestrante_id,
        p.nome AS palestrante_nome,
        p.email AS palestrante_email,
        p.especialidade AS palestrante_especialidade,

        f.id AS faculdade_id,
        f.nome AS faculdade_nome,

        ed.id AS edicao_id,
        ed.nome AS edicao_nome,
        ed.ano AS edicao_ano,
        ed.data_inicio AS edicao_data_inicio,
        ed.data_fim AS edicao_data_fim,
        ed.status AS edicao_status
      FROM eventos e
      JOIN palestrantes p ON e.id_palestrante = p.id
      JOIN faculdades f ON e.id_faculdade = f.id
      JOIN edicoes ed ON e.id_edicao = ed.id;
    `);

    const eventos = rows.map((row: any) => ({
      id: row.evento_id,
      titulo: row.titulo,
      descricao: row.descricao,
      local: row.local,
      data_inicio: row.data_inicio,
      data_fim: row.data_fim,
      vagas_totais: row.vagas_totais,
      vagas_disponiveis: row.vagas_disponiveis,

      palestrante: {
        id: row.palestrante_id,
        nome: row.palestrante_nome,
        email: row.palestrante_email,
        especialidade: row.palestrante_especialidade,
      },

      faculdade: {
        id: row.faculdade_id,
        nome: row.faculdade_nome,
      },

      edicao: {
        id: row.edicao_id,
        nome: row.edicao_nome,
        ano: row.edicao_ano,
        data_inicio: row.edicao_data_inicio,
        data_fim: row.edicao_data_fim,
        status: row.edicao_status,
      },
    }));

    return res.json(eventos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: true,
      message: "Erro ao buscar eventos",
    });
  }
};

const getEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [rows] = await database.query<RowDataPacket[]>(
      `
      SELECT 
        e.id AS evento_id,
        e.titulo,
        e.descricao,
        e.local,
        e.data_inicio,
        e.data_fim,
        e.vagas_totais,
        e.vagas_disponiveis,

        p.id AS palestrante_id,
        p.nome AS palestrante_nome,
        p.email AS palestrante_email,
        p.especialidade AS palestrante_especialidade,

        f.id AS faculdade_id,
        f.nome AS faculdade_nome,

        ed.id AS edicao_id,
        ed.nome AS edicao_nome,
        ed.ano AS edicao_ano,
        ed.data_inicio AS edicao_data_inicio,
        ed.data_fim AS edicao_data_fim,
        ed.status AS edicao_status

      FROM eventos e
      JOIN palestrantes p ON e.id_palestrante = p.id
      JOIN faculdades f ON e.id_faculdade = f.id
      JOIN edicoes ed ON e.id_edicao = ed.id
      WHERE e.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Evento não encontrado" });
    }

    const row = rows[0];

    const evento = {
      id: row.evento_id,
      titulo: row.titulo,
      descricao: row.descricao,
      local: row.local,
      data_inicio: row.data_inicio,
      data_fim: row.data_fim,
      vagas_totais: row.vagas_totais,
      vagas_disponiveis: row.vagas_disponiveis,

      palestrante: {
        id: row.palestrante_id,
        nome: row.palestrante_nome,
        email: row.palestrante_email,
        especialidade: row.palestrante_especialidade,
      },

      faculdade: {
        id: row.faculdade_id,
        nome: row.faculdade_nome,
      },

      edicao: {
        id: row.edicao_id,
        nome: row.edicao_nome,
        ano: row.edicao_ano,
        data_inicio: row.edicao_data_inicio,
        data_fim: row.edicao_data_fim,
        status: row.edicao_status,
      },
    };

    return res.status(200).json(evento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Erro ao pegar o evento" });
  }
};

const createEvent = async (req: AuthRequest, res: Response) => {
  const {
    titulo,
    descricao,
    local,
    data_inicio,
    data_fim,
    vagas_totais,
    vagas_disponiveis,
    id_palestrante,
    id_faculdade,
    id_edicao,
  } = req.body;

  try {
    const [result] = await database.query<ResultSetHeader>(
      `INSERT INTO eventos (titulo,
    descricao,
    local,
    data_inicio,
    data_fim,
    vagas_totais,
    vagas_disponiveis,
    id_palestrante,
    id_faculdade,
    id_edicao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descricao,
        local,
        data_inicio,
        data_fim,
        vagas_totais,
        vagas_disponiveis,
        id_palestrante,
        id_faculdade,
        id_edicao,
      ]
    );

    if (result.insertId) {
      return res.status(201).json({ message: "Evento criado com sucesso" });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao criar o evento" });
  }
};

const editEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const {
    titulo,
    descricao,
    local,
    data_inicio,
    data_fim,
    vagas_totais,
    vagas_disponiveis,
    id_palestrante,
    id_faculdade,
    id_edicao,
  } = req.body;

  try {
    const [result] = await database.query<ResultSetHeader>(
      `UPDATE eventos SET 
        titulo = ?, 
        descricao = ?, 
        local = ?, 
        data_inicio = ?, 
        data_fim = ?, 
        vagas_totais = ?, 
        vagas_disponiveis = ?, 
        id_palestrante = ?, 
        id_faculdade = ?, 
        id_edicao = ?
      WHERE id = ?`,
      [
        titulo,
        descricao,
        local,
        data_inicio,
        data_fim,
        vagas_totais,
        vagas_disponiveis,
        id_palestrante,
        id_faculdade,
        id_edicao,
        id,
      ]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Evento editado com sucesso" });
    }

    return res
      .status(404)
      .json({ error: true, message: "Evento não encontrado" });
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: "Erro ao atualizar o evento" });
  }
};

const deleteEvent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const [result] = await database.query<ResultSetHeader>(
      "DELETE FROM eventos WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: "Evento não encontrado",
      });
    }

    return res.status(200).json({
      message: "Evento deletado com sucesso",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Erro ao deletar o evento" });
  }
};

export { getEvents, getEvent, createEvent, editEvent, deleteEvent };
