import PDFDocument from "pdfkit";

function addSection(document, title, text) {
  document.moveDown(0.8);
  document.fillColor("#263238").fontSize(14).font("Helvetica-Bold").text(title);
  document.moveDown(0.25);
  document.fillColor("#37474f").fontSize(10.5).font("Helvetica").text(text, { lineGap: 4 });
}

export function createPdf(report, options = {}) {
  const document = new PDFDocument({ size: "A4", margin: 54, info: { Title: "ZodiaDaily BirthDate Report", Author: "ZodiaDaily" } });
  const chunks = [];
  const premium = options.premium !== false;

  document.on("data", chunk => chunks.push(chunk));
  document.fillColor("#17202a").font("Helvetica-Bold").fontSize(28).text("ZodiaDaily", { align: "center" });
  document.moveDown(0.35);
  document.font("Helvetica").fontSize(13).fillColor("#546e7a").text("Personalized BirthDate Reflection Report", { align: "center" });
  document.moveDown(1.5);
  document.strokeColor("#b0bec5").moveTo(54, document.y).lineTo(541, document.y).stroke();
  document.moveDown(1.2);

  document.fillColor("#263238").font("Helvetica-Bold").fontSize(18).text(report.headline || "Your personalized report");
  document.moveDown(0.8);
  document.font("Helvetica").fontSize(11).fillColor("#37474f");
  document.text(`Birth date: ${report.formattedDate}`);
  document.text(`Weekday: ${report.weekday}`);
  document.text(`Zodiac sign: ${report.zodiacSign}`);
  document.text(`Element: ${report.element}`);
  document.text(`Life-path number: ${report.lifePathNumber}`);

  if (report.sections) report.sections.forEach(section => addSection(document, section.title, section.text));

  document.moveDown(1);
  document.font("Helvetica-Bold").fontSize(13).fillColor("#263238").text("Reflection themes");
  document.font("Helvetica").fontSize(10.5).fillColor("#37474f");
  (report.themes || []).forEach(theme => document.text(`• ${theme}`, { indent: 10, lineGap: 3 }));

  document.moveDown(1.4);
  document.font("Helvetica-Oblique").fontSize(8.5).fillColor("#607d8b").text(report.note || "For reflection and entertainment.", { lineGap: 3 });
  if (premium) {
    document.moveDown(1);
    document.font("Helvetica").fontSize(8).fillColor("#90a4ae").text("Created with ZodiaDaily • Keep this report as a personal reflection guide.", { align: "center" });
  }

  document.end();
  return new Promise((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });
}
