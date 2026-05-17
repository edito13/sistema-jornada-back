import { Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";

import database from "../connection/database";
import { AuthRequest } from "../interfaces/request";
import { generateCertificate } from "../utils/generateCertificates";

const createValidationCode = () =>
  Math.random().toString(36).slice(2, 12).toUpperCase();

const ensureCertificate = async (id_inscricao: number) => {
  const [existingRows] = await database.query<RowDataPacket[]>(
    "SELECT id, codigo_validacao, data_emissao FROM certificados WHERE id_inscricao = ? LIMIT 1",
    [id_inscricao],
  );

  if (existingRows.length > 0) {
    return existingRows[0];
  }

  let certificate = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = createValidationCode();

    try {
      const [result] = await database.query<ResultSetHeader>(
        "INSERT INTO certificados (id_inscricao, codigo_validacao) VALUES (?, ?)",
        [id_inscricao, code],
      );

      certificate = {
        id: result.insertId,
        codigo_validacao: code,
        data_emissao: new Date(),
      };
      break;
    } catch (error: any) {
      if (error?.code !== "ER_DUP_ENTRY") {
        throw error;
      }
    }
  }

  if (!certificate) {
    throw new Error("Não foi possível gerar o código do certificado");
  }

  return certificate;
};

export const listCertificates = async (_req: AuthRequest, res: Response) => {
  try {
    const [rows] = await database.query<RowDataPacket[]>(
      `
      SELECT
        c.id,
        c.id_inscricao,
        c.codigo_validacao,
        c.data_emissao,
        i.presenca,
        p.id AS id_participante,
        p.id_user,
        u.nome AS nome_participante,
        u.email AS email_participante,
        e.id AS id_evento,
        e.titulo AS titulo_evento,
        e.data_fim AS data_evento,
        ed.nome AS nome_edicao,
        ed.ano AS ano_edicao
      FROM certificados c
      JOIN inscricoes i ON c.id_inscricao = i.id
      JOIN participantes p ON i.id_participante = p.id
      JOIN users u ON u.id = p.id_user
      JOIN eventos e ON i.id_evento = e.id
      JOIN edicoes ed ON i.id_edicao = ed.id
      ORDER BY c.data_emissao DESC
      `,
    );

    return res.json(
      rows.map((row) => ({
        id: row.id,
        id_inscricao: row.id_inscricao,
        id_participante: row.id_participante,
        id_user: row.id_user,
        nome_participante: row.nome_participante,
        email_participante: row.email_participante,
        id_evento: row.id_evento,
        titulo_evento: row.titulo_evento,
        data_evento: row.data_evento,
        nome_edicao: row.nome_edicao,
        ano_edicao: row.ano_edicao,
        codigo_validacao: row.codigo_validacao,
        data_emissao: row.data_emissao,
        presenca: row.presenca === 0 ? false : true,
      })),
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar certificados" });
  }
};

export const listUserCertificates = async (req: AuthRequest, res: Response) => {
  const { id_user } = req.params;
  const userId = Number(id_user);

  if (!userId) {
    return res.status(400).json({ message: "Usuário inválido" });
  }

  if (req.user?.role !== "admin" && req.user?.id !== userId) {
    return res.status(403).json({ message: "Acesso negado" });
  }

  try {
    const [rows] = await database.query<RowDataPacket[]>(
      `
      SELECT
        i.id AS id_inscricao,
        p.id AS id_participante,
        p.id_user,
        e.id AS id_evento,
        e.titulo AS titulo_evento,
        e.data_fim AS data_evento,
        c.id,
        c.codigo_validacao,
        c.data_emissao
      FROM inscricoes i
      JOIN participantes p ON i.id_participante = p.id
      JOIN eventos e ON i.id_evento = e.id
      LEFT JOIN certificados c ON c.id_inscricao = i.id
      WHERE p.id_user = ?
        AND i.presenca = TRUE
        AND e.data_fim < NOW()
      ORDER BY e.data_fim DESC
      `,
      [userId],
    );

    const certificates = await Promise.all(
      rows.map(async (row) => {
        const certificate =
          row.codigo_validacao && row.data_emissao
            ? row
            : await ensureCertificate(row.id_inscricao);

        return {
          id: row.id ?? certificate.id ?? row.id_inscricao,
          id_inscricao: row.id_inscricao,
          id_participante: row.id_participante,
          id_user: row.id_user,
          id_evento: row.id_evento,
          evento_nome: row.titulo_evento,
          titulo_evento: row.titulo_evento,
          data_evento: row.data_evento,
          data_emissao: certificate.data_emissao,
          codigo_validacao: certificate.codigo_validacao,
          status: "Disponível",
        };
      }),
    );

    return res.json(certificates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao listar certificados" });
  }
};

export const getCertificate = async (req: AuthRequest, res: Response) => {
  const { id_inscricao } = req.params;

  try {
    const [rows] = await database.query(
      `
      SELECT 
        u.nome AS nome_participante,
        e.titulo AS titulo_evento,
        e.data_fim,
        i.presenca,
        p.id_user
      FROM inscricoes i
      JOIN participantes p ON i.id_participante = p.id
      JOIN users u ON u.id = p.id_user
      JOIN eventos e ON i.id_evento = e.id
      WHERE i.id = ?
      `,
      [id_inscricao],
    );

    const [inscricao] = rows as any[];

    if (!inscricao) {
      return res.status(404).json({ message: "Inscrição não encontrada" });
    }

    if (req.user?.role !== "admin" && req.user?.id !== inscricao.id_user) {
      return res.status(403).json({ message: "Acesso negado" });
    }

    if (!inscricao.presenca) {
      return res.status(403).json({
        message: "Certificado disponível apenas para presença confirmada",
      });
    }

    if (new Date(inscricao.data_fim).getTime() >= Date.now()) {
      return res.status(403).json({
        message: "Certificado disponível apenas após a realização do evento",
      });
    }

    const certificate = await ensureCertificate(Number(id_inscricao));

    await generateCertificate(res, {
      ...inscricao,
      data_emissao: certificate.data_emissao,
      codigo_validacao: certificate.codigo_validacao,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao gerar certificado" });
  }
};
