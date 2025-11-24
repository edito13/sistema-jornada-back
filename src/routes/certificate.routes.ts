import { Router } from "express";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import { getCertificate } from "../controllers/certificate.controller";

const router = Router();

router.get("/certificado/:id_inscricao", getCertificate);

router.get("/certificado", async (req, res) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 50,
  });

  // Criar stream para capturar os bytes do PDF
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  doc.pipe(stream);
  stream.on("data", (chunk) => chunks.push(chunk));

  const endPromise = new Promise<Buffer>((resolve) => {
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // --- Conteúdo do certificado ---
  doc.fontSize(30).fillColor("#333").text("Certificado de Participação", {
    align: "center",
  });

  doc.moveDown(2);
  doc
    .fontSize(20)
    .text("Certificamos que Edito Tchokoso", { align: "center" })
    .moveDown(1)
    .text('participou do evento "Node.js Express Workshop".', {
      align: "center",
    })
    .moveDown(1)
    .text(`Realizado em ${new Date().toLocaleDateString("pt-PT")}.`, {
      align: "center",
    });

  doc.moveDown(4);
  doc.text("_______________________", 150, 400);
  doc.text("Organizador", 180, 420);

  doc.end();

  // Esperar o PDF ser gerado
  const pdfBuffer = await endPromise;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=certificado_teste.pdf`
  );
  res.send(pdfBuffer);
});

export default router;
