import { Response } from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface CertificateData extends RowDataPacket {
  nome_participante: string;
  titulo_evento: string;
  data_emissao: string;
  codigo_validacao: string;
}

export const generateCertificate = async (
  res: Response,
  data: CertificateData
) => {
  const doc = new PDFDocument({ size: "A4", layout: "landscape" });
  const fileName = `certificado-${data.codigo_validacao}.pdf`;
  const filePath = path.join(__dirname, "../../temp", fileName);

  // Cria a pasta temp se não existir
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Cabeçalho
  doc.fontSize(30).text("Certificado de Participação", { align: "center" });
  doc.moveDown();

  // Corpo
  doc
    .fontSize(18)
    .text(
      `Certificamos que ${data.nome_participante} participou do evento "${data.titulo_evento}"`,
      { align: "center" }
    );

  doc.moveDown(2);
  doc
    .fontSize(14)
    .text(`Emitido em: ${new Date(data.data_emissao).toLocaleDateString()}`, {
      align: "center",
    });
  doc.text(`Código de validação: ${data.codigo_validacao}`, {
    align: "center",
  });

  doc.end();

  // Envia o PDF após terminar
  stream.on("finish", () => {
    res.download(filePath, fileName, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filePath); // apaga o arquivo após o download
    });
  });
};
