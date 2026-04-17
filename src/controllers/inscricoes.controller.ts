import { Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import database from "../connection/database";
import { AuthRequest } from "../interfaces/request";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

export const inscrever_se = async (req: AuthRequest, res: Response) => {
  const { user } = req;
  const { id_evento, id_edicao } = req.body;

  if (user?.role === "admin") {
    return res.status(403).json({
      error: true,
      message: "Administradores não podem se inscrever em eventos",
    });
  }

  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    /* 1. Validar usuário */
    const [users] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [user?.id],
    );

    if (users.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        error: true,
        message: "Usuário não encontrado",
      });
    }

    /* 2. Validar evento + edição */
    const [eventos] = await conn.query<RowDataPacket[]>(
      `SELECT id, vagas_disponiveis 
       FROM eventos 
       WHERE id = ? AND id_edicao = ?`,
      [id_evento, id_edicao],
    );

    if (eventos.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        error: true,
        message: "Evento não encontrado para esta edição",
      });
    }

    if (eventos[0].vagas_disponiveis <= 0) {
      await conn.rollback();
      return res.status(400).json({
        error: true,
        message: "Sem vagas disponíveis",
      });
    }

    /* 3. Buscar ou criar participante */
    const [participantes] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM participantes WHERE id_user = ?",
      [user?.id],
    );

    let id_participante: number;

    if (participantes.length === 0) {
      const [result] = await conn.query<ResultSetHeader>(
        "INSERT INTO participantes (id_user) VALUES (?)",
        [user?.id],
      );
      id_participante = result.insertId;
    } else {
      id_participante = participantes[0].id;
    }

    /* 4. Verificar inscrição duplicada */
    const [inscricaoExistente] = await conn.query<RowDataPacket[]>(
      `SELECT id FROM inscricoes
       WHERE id_participante = ? AND id_evento = ? AND id_edicao = ?`,
      [id_participante, id_evento, id_edicao],
    );

    if (inscricaoExistente.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        error: true,
        message: "Usuário já está inscrito neste evento",
      });
    }

    /* 5. Criar inscrição */
    await conn.query(
      "INSERT INTO inscricoes (id_participante, id_evento, id_edicao, data_inscricao) VALUES (?, ?, ?, NOW())",
      [id_participante, id_evento, id_edicao],
    );

    /* 6. Atualizar vagas */
    await conn.query(
      "UPDATE eventos SET vagas_disponiveis = vagas_disponiveis - 1 WHERE id = ?",
      [id_evento],
    );

    await conn.commit();

    const jornadaUrl = `http://localhost:5173/jornada/${user?.id}/${eventos[0].id}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const qrCodeBuffer = await QRCode.toBuffer(jornadaUrl);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "ricardocarlos1306@gmail.com",
      subject: "Inscrição confirmada 🎉",
      html: `
    <p>Olá, ${participantes[0]?.nome ?? "Não tem nome"}</p>
    <p>Use o QR Code abaixo:</p>
    <img src="cid:qrcode" />
  `,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrCodeBuffer,
          cid: "qrcode", // liga com o img
        },
      ],
    });

    return res.json({ message: "Inscrição realizada com sucesso" });
  } catch (error) {
    await conn.rollback();
    console.log(error);
    return res.status(500).json({
      error: true,
      message: "Erro no servidor",
    });
  } finally {
    conn.release();
  }
};

export const cancelarInscricao = async (req: AuthRequest, res: Response) => {
  const { user } = req;
  const { id } = req.params;

  const conn = await database.getConnection();

  try {
    await conn.beginTransaction();

    if (id) {
      // Admin canceling by inscription ID
      if (user?.role !== "admin") {
        await conn.rollback();
        return res.status(403).json({
          error: true,
          message: "Acesso negado",
        });
      }

      // Get the inscription to find id_evento for updating vagas
      const [inscricoes] = await conn.query<RowDataPacket[]>(
        "SELECT id_evento FROM inscricoes WHERE id = ?",
        [id],
      );

      if (inscricoes.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          error: true,
          message: "Inscrição não encontrada",
        });
      }

      const idEvento = inscricoes[0].id_evento;

      /* Cancelar inscrição */
      await conn.query("DELETE FROM inscricoes WHERE id = ?", [id]);

      /* Atualizar vagas */
      await conn.query(
        "UPDATE eventos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?",
        [idEvento],
      );

      await conn.commit();
      return res.json({ message: "Inscrição cancelada com sucesso" });
    } else {
      const { id_evento, id_edicao } = req.body;
      // User canceling by id_evento and id_edicao
      if (!id_evento || !id_edicao) {
        return res.status(400).json({
          error: true,
          message: "id_evento e id_edicao são obrigatórios",
        });
      }

      /* 1. Buscar participante */
      const [participantes] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM participantes WHERE id_user = ?",
        [user?.id],
      );

      if (participantes.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          error: true,
          message: "Participante não encontrado",
        });
      }

      const id_participante = participantes[0].id;

      /* 2. Buscar inscrição */
      const [inscricoes] = await conn.query<RowDataPacket[]>(
        `SELECT id FROM inscricoes
         WHERE id_participante = ? AND id_evento = ? AND id_edicao = ?`,
        [id_participante, id_evento, id_edicao],
      );

      if (inscricoes.length === 0) {
        await conn.rollback();
        return res.status(409).json({
          error: true,
          message: "O usuário não está inscrito neste evento",
        });
      }

      /* 3. Cancelar inscrição */
      await conn.query("DELETE FROM inscricoes WHERE id = ?", [
        inscricoes[0].id,
      ]);

      /* 4. Atualizar vagas */
      await conn.query(
        "UPDATE eventos SET vagas_disponiveis = vagas_disponiveis + 1 WHERE id = ?",
        [id_evento],
      );

      await conn.commit();
      return res.json({ message: "Inscrição cancelada com sucesso" });
    }
  } catch (error) {
    await conn.rollback();
    return res.status(500).json({
      error: true,
      message: "Erro no servidor",
    });
  } finally {
    conn.release();
  }
};

export const listaInscricoes = async (req: AuthRequest, res: Response) => {
  const { user } = req;

  try {
    if (user?.role === "admin") {
      const [rows] = await database.query<RowDataPacket[]>(
        `SELECT 
          u.id AS id_usuario,
          u.nome AS nome_usuario,
          u.email AS email_usuario,
          e.id AS id_evento,
          e.titulo AS titulo_evento,
          ed.nome AS nome_edicao,
          ed.id AS id_edicao,
          i.data_inscricao,
          i.id,
          i.presenca
        FROM inscricoes i
        JOIN participantes p ON i.id_participante = p.id
        JOIN users u ON p.id_user = u.id
        JOIN eventos e ON i.id_evento = e.id
        JOIN edicoes ed ON i.id_edicao = ed.id
        ORDER BY i.data_inscricao DESC`,
      );

      const inscricoes = rows.map((row: any) => ({
        id: row.id,
        evento: {
          id: row.id_evento,
          titulo: row.titulo_evento,
        },
        edicao: {
          id: row.id_edicao,
          nome: row.nome_edicao,
        },
        usuario: {
          id: row.id_usuario,
          nome: row.nome_usuario,
          email: row.email_usuario,
        },
        data_inscricao: row.data_inscricao,
        presenca: row.presenca === 0 ? false : true,
      }));

      return res.json(inscricoes);
    }

    const [participantes] = await database.query<RowDataPacket[]>(
      "SELECT id FROM participantes WHERE id_user = ?",
      [user?.id],
    );

    if (participantes.length === 0) {
      return res.status(404).json({
        error: true,
        message: "Usuário não possui inscrições",
      });
    }

    const [inscricoes] = await database.query<RowDataPacket[]>(
      `SELECT
        i.id,
        e.id AS id_evento,
        ed.id AS id_edicao,
        e.titulo AS titulo_evento,
        e.local AS local_evento,
        e.data_inicio AS data_evento,
        e.vagas_disponiveis AS vagas_disponiveis,
        ed.nome AS nome_edicao,
        ed.ano AS ano_edicao,
        i.data_inscricao,
        i.presenca
      FROM inscricoes i
      JOIN eventos e ON i.id_evento = e.id
      JOIN edicoes ed ON i.id_edicao = ed.id
      WHERE i.id_participante = ?
      ORDER BY i.data_inscricao DESC`,
      [participantes[0].id],
    );

    return res.json(inscricoes);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Erro no servidor",
    });
  }
};
