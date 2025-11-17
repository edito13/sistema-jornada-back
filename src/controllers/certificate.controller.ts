import { Request, Response } from "express";
import database from "../connection/database";
import { generateCertificate } from "../utils/generateCertificates";

export const getCertificate = async (req: Request, res: Response) => {
  const { id_inscricao } = req.params;

  try {
    const [rows] = await database.query(
      `
      SELECT 
        p.nome AS nome_participante,
        e.titulo AS titulo_evento,
        c.data_emissao,
        c.codigo_validacao
      FROM certificados c
      JOIN inscricoes i ON c.id_inscricao = i.id
      JOIN participantes p ON i.id_participante = p.id
      JOIN eventos e ON i.id_evento = e.id
      WHERE c.id_inscricao = ?
      `,
      [id_inscricao]
    );

    const [certificado] = rows as any[];

    if (!certificado) {
      return res.status(404).json({ message: "Certificado não encontrado" });
    }

    await generateCertificate(res, certificado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao gerar certificado" });
  }
};
