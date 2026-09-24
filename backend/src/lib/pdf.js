import PDFDocument from "pdfkit";

export function createPdf(report) {
  const document = new PDFDocument({ margin: 50 });
  const chunks = [];

  document.on("data", chunk => chunks.push(chunk));
  document.fontSize(24).text("ZodiaDaily", { align: "center" });
  document.moveDown();
  document.fontSize(18).text("Personalized BirthDate Report", { align: "center" });
  document.moveDown(2);
  document.fontSize(12).text(`Birth date: ${report.formattedDate}`);
  document.text(`Weekday: ${report.weekday}`);
  document.text(`Zodiac sign: ${report.zodiacSign}`);
  document.text(`Life-path number: ${report.lifePathNumber}`);
  document.moveDown();
  document.fontSize(14).text("Reflection themes");
  document.moveDown(0.5);
  report.themes.forEach(theme => document.fontSize(12).text(`• ${theme}`));
  document.moveDown(2);
  document.fontSize(9).text(report.note);
  document.end();

  return new Promise((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}
