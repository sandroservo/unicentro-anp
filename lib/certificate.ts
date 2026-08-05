import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type CertificateData = {
  studentName: string;
  courseName: string;
  code: string;
  dateStr: string;
};

// Gera um PDF de certificado (A4 paisagem). Retorna os bytes.
export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 paisagem (pt)
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.12, 0.23, 0.44);
  const gray = rgb(0.4, 0.4, 0.4);

  // Borda
  page.drawRectangle({
    x: 24, y: 24, width: width - 48, height: height - 48,
    borderColor: navy, borderWidth: 3,
  });

  const center = (text: string, y: number, size: number, f = font, color = rgb(0, 0, 0)) => {
    const w = f.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font: f, color });
  };

  center("CERTIFICADO DE CONCLUSÃO", height - 130, 28, bold, navy);
  center("Certificamos que", height - 200, 16, font, gray);
  center(data.studentName, height - 250, 30, bold);
  center("concluiu com aproveitamento o curso", height - 300, 16, font, gray);
  center(data.courseName, height - 345, 22, bold, navy);
  center(`Emitido em ${data.dateStr}`, 110, 12, font, gray);
  center(`Código de validação: ${data.code}`, 88, 10, font, gray);

  return pdf.save();
}
