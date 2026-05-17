import { Response } from "express";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";

interface CertificateData extends RowDataPacket {
  nome_participante: string;
  titulo_evento: string;
  nome_palestrante: string;
  duracao_horas: number;
  nome_edicao: string;
  data_emissao: string;
  codigo_validacao: string;
}

const ASSETS = path.join(__dirname, "../assets/certificate");

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  const day = d.getDate();
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return { day, month: months[d.getMonth()], year: d.getFullYear() };
};

export const generateCertificate = async (
  res: Response,
  data: CertificateData,
) => {
  // A4 portrait: 595.28 x 841.89 pt
  const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 0 });
  const fileName = `certificado-${data.codigo_validacao}.pdf`;
  const tempDir = path.join(__dirname, "../../temp");
  const filePath = path.join(tempDir, fileName);

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const W = 595.28;
  const H = 841.89;
  const MARGIN = 32;
  const bw = 12;
  const borderColor = "#c0392b";

  // ── Fundo branco ──
  doc.rect(0, 0, W, H).fill("#ffffff");

  // ── Borda externa ──
  doc
    .rect(MARGIN, MARGIN, W - MARGIN * 2, H - MARGIN * 2)
    .lineWidth(bw)
    .strokeColor(borderColor)
    .stroke();

  // ── Borda interna fina ──
  const inner = MARGIN + bw + 5;
  doc
    .rect(inner, inner, W - inner * 2, H - inner * 2)
    .lineWidth(1)
    .strokeColor(borderColor)
    .stroke();

  // ── Logo UNIC topo centro ──
  const unicLogo = path.join(ASSETS, "unic_logo.png");
  if (fs.existsSync(unicLogo)) {
    const logoW = 170;
    doc.image(unicLogo, (W - logoW) / 2, inner + 16, { width: logoW });
  }

  // ── Título ──
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#c0392b")
    .text("CERTIFICADO DE PARTICIPAÇÃO", 0, inner + 92, { align: "center" });

  // ── Certificamos que ──
  doc
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#333333")
    .text("Certificamos que", 0, inner + 132, { align: "center" });

  // ── Nome do participante ──
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#111111")
    .text(data.nome_participante, 0, inner + 158, { align: "center" });

  // ── Corpo do texto ──
  const textLeft = inner + 28;
  const textWidth = W - (inner + 28) * 2;
  let y = inner + 208;
  const lh = 26;

  // participou no curso
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#222222")
    .text("Participou no evento ", textLeft, y, {
      continued: true,
      lineBreak: false,
    });
  doc
    .font("Helvetica-Bold")
    .text(data.titulo_evento, { width: textWidth, lineBreak: true });

  y += lh - 2;

  // ministrado por
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#222222")
    .text("Ministrado por ", textLeft, y, {
      continued: true,
      lineBreak: false,
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(data.nome_palestrante || "—", { lineBreak: true });

  y += lh - 2;

  // duração + âmbito
  const edicaoNome = data.nome_edicao + " - Jornada Científica";
  const jornada = `"Academia, Ciência e Extensão: o seu contributo para o Desenvolvimento Humano,"  `;

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#222222")
    .text("com a duração de ", textLeft, y, {
      continued: true,
      lineBreak: false,
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(`${data.duracao_horas ?? "—"} horas`, {
      continued: true,
      lineBreak: false,
    });
  doc
    .font("Helvetica")
    .text(", no âmbito da ", { continued: true, lineBreak: false });
  doc
    .font("Helvetica-Bold")
    .fillColor("#c0392b")
    .text(edicaoNome, { lineBreak: false });

  y += lh - 2;

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#c0392b")
    .text(jornada, textLeft + 2, y, {
      width: textWidth,
      continued: true,
      lineGap: 11,
    });

  y += lh + 2;

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#222222")
    .text(
      "na Universidade Internacional do Cuanza, Cuito, Bié, Angola.",
      textLeft,
      y,
      { width: textWidth },
    );

  y += lh + 10;

  // ── Parágrafo de reconhecimento ──
  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#333333")
    .text(
      "Este certificado reconhece a sua participação no curso, a qual constituiu um contributo relevante para o seu desenvolvimento académico e profissional.",
      textLeft,
      y,
      { width: textWidth, align: "justify", lineGap: 6 },
    );

  y += lh * 2;

  // ── Data de emissão ──
  const { day, month, year } = formatDate(data.data_emissao);
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#666")
    .text(
      `Dado em Cuito, aos ${day} dias do mês de ${month} de ${year}.`,
      0,
      y,
      { align: "center" },
    );

  y += lh;

  // ── Selo central ──
  const seloPath = path.join(ASSETS, "selo_logo.png");
  if (fs.existsSync(seloPath)) {
    const seloSize = 140;
    doc.image(seloPath, (W - seloSize) / 2, y, { width: seloSize });
    y += seloSize;
  }

  // ── Assinaturas (3 colunas iguais) ──
  const sigH = 65;
  const sigW = 105;
  const colW = (W - MARGIN * 2) / 3;
  const sig1X = MARGIN + (colW - sigW) / 2 + 20;
  const sig2X = MARGIN + colW + (colW - sigW) / 2;
  const sig3X = MARGIN + colW * 2 + (colW - sigW) / 2 - 20;
  const sigY = y - 6;

  const sig1Path = path.join(ASSETS, "assinatura_carlos_roberto.png");
  if (fs.existsSync(sig1Path)) {
    doc.image(sig1Path, sig1X, sigY, { width: sigW, height: sigH });
  }

  const sig2Path = path.join(ASSETS, "assinatura_maria_elena.png");
  if (fs.existsSync(sig2Path)) {
    doc.image(sig2Path, sig2X + 15, sigY + 12, { width: 75, height: 52 });
  }

  const sig3Path = path.join(ASSETS, "assinatura_carmen_velasco.png");
  if (fs.existsSync(sig3Path)) {
    doc.image(sig3Path, sig3X, sigY + 6, { width: sigW, height: 58 });
  }

  const nameY = sigY + sigH + 6;
  const ns = 9;

  // Nome 1
  doc
    .font("Helvetica-Bold")
    .fontSize(ns)
    .fillColor("#222222")
    .text("Dr. Carlos Roberto Jelvez Martínez", MARGIN, nameY, {
      width: colW + 20,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(ns)
    .text("Reitor", MARGIN, nameY + 13, { width: colW + 20, align: "center" });

  // Nome 2
  doc
    .font("Helvetica-Bold")
    .fontSize(ns)
    .text("Dra. María Elena Castro Rodríguez", MARGIN + colW, nameY, {
      width: colW,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(ns)
    .text("Vice-Reitora para Assuntos", MARGIN + colW, nameY + 13, {
      width: colW,
      align: "center",
    })
    .text("Científicos e Pós-Graduação", MARGIN + colW, nameY + 26, {
      width: colW,
      align: "center",
    });

  // Nome 3
  doc
    .font("Helvetica-Bold")
    .fontSize(ns)
    .text("Dra. Carmen Lilí Rodríguez Velasco", MARGIN + colW * 2, nameY, {
      width: colW - 20,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(ns)
    .text("Vice-Reitora para os", MARGIN + colW * 2, nameY + 13, {
      width: colW - 20,
      align: "center",
    })
    .text("Assuntos Académicos", MARGIN + colW * 2, nameY + 26, {
      width: colW - 20,
      align: "center",
    });

  // ── Rodapé: UNIC + FUNIBER centradas, lado a lado ──
  const footerY = H - MARGIN - bw - 70;
  const logoUnicW = 150;
  const logoFuniberW = 110;
  const logoGap = 24;
  const totalLogoW = logoUnicW + logoGap + logoFuniberW;
  const logoStartX = (W - totalLogoW) / 2;

  if (fs.existsSync(unicLogo)) {
    doc.image(unicLogo, logoStartX, footerY, { width: logoUnicW });
  }
  const funiberPath = path.join(ASSETS, "funiber_logo.png");
  if (fs.existsSync(funiberPath)) {
    doc.image(funiberPath, logoStartX + logoUnicW + logoGap, footerY + 4, {
      width: logoFuniberW,
    });
  }

  // ── Código de validação ──
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#aaaaaa")
    .text(
      `Código de validação: ${data.codigo_validacao}`,
      0,
      H - MARGIN - bw - 18,
      { align: "center" },
    );

  doc.end();

  stream.on("finish", () => {
    res.download(filePath, fileName, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filePath);
    });
  });
};
