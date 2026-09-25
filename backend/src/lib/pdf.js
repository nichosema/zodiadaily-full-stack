import PDFDocument from "pdfkit";

const NAVY = "#10233f";
const INK = "#233044";
const GOLD = "#c9a75a";
const PAPER = "#fbf7ef";
const MUTED = "#687386";
const LINE = "#ded3bd";
const BODY = "#3e4b5c";

const SIGNS = {
  Aries: ["AR", "Ram"], Taurus: ["TA", "Bull"], Gemini: ["GE", "Twins"],
  Cancer: ["CA", "Crab"], Leo: ["LE", "Lion"], Virgo: ["VI", "Maiden"],
  Libra: ["LI", "Scales"], Scorpio: ["SC", "Scorpion"], Sagittarius: ["SA", "Archer"],
  Capricorn: ["CP", "Sea-goat"], Aquarius: ["AQ", "Water-bearer"], Pisces: ["PI", "Fish"]
};

function clean(value) {
  return String(value ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim();
}

function short(value, max = 240) {
  const text = clean(value);
  return text ? (text.length > max ? `${text.slice(0, max - 1)}...` : text) : "Not available";
}

function header(doc, title, subtitle = "") {
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7)
    .text("BIRTHDATE - PERSONAL DISCOVERY REPORT", 42, 14, { width: 511, align: "center", lineBreak: false });
  if (title) {
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(18)
      .text(title.toUpperCase(), 42, 68, { width: 511, align: "center", lineBreak: false });
  }
  if (subtitle) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(8.5)
      .text(short(subtitle, 150), 42, 96, { width: 511, align: "center", lineBreak: false });
  }
  if (title) doc.strokeColor(LINE).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
}

function footer(doc, label) {
  doc.rect(0, 806, 595, 36).fill(NAVY);
  // lineBreak:false is essential: y=819 is close to the page bottom and
  // otherwise PDFKit can create an unwanted extra page.
  doc.fillColor("#ffffff").font("Helvetica").fontSize(7)
    .text(`BIRTHDATE - ${label}`, 42, 819, {
      width: 511,
      height: 10,
      align: "center",
      lineBreak: false,
      ellipsis: false
    });
}

function startSection(doc, title, subtitle) {
  doc.addPage({ size: "A4", margin: 0 });
  header(doc, title, subtitle);
}

function card(doc, x, y, w, h, title, value, fontSize = 8.2) {
  doc.roundedRect(x, y, w, h, 6).fillAndStroke("#fffaf0", LINE);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(8.5)
    .text(short(title, 65), x + 10, y + 10, { width: w - 20, lineBreak: false });
  doc.fillColor(BODY).font("Helvetica").fontSize(fontSize)
    .text(short(value, h >= 90 ? 520 : 180), x + 10, y + 28, {
      width: w - 20,
      height: h - 34,
      lineGap: 1,
      ellipsis: true
    });
}

function paragraph(doc, value, x, y, w = 511, fontSize = 9) {
  doc.fillColor(BODY).font("Helvetica").fontSize(fontSize)
    .text(short(value, 650), x, y, { width: w, height: 60, lineGap: 2, ellipsis: true });
}

function bulletList(doc, items, x, y, max = 5) {
  (items || []).slice(0, max).forEach((item, index) => {
    const text = typeof item === "string" ? item : `${item.year}: ${item.text}`;
    doc.fillColor(BODY).font("Helvetica").fontSize(8.2)
      .text(`- ${short(text, 145)}`, x, y + index * 25, { width: 511, height: 22, ellipsis: true });
  });
}

function drawCover(doc, report) {
  doc.addPage({ size: "A4", margin: 0 });
  header(doc, "", "");
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(29)
    .text("BIRTHDATE", 42, 155, { width: 511, align: "center", lineBreak: false });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(17)
    .text("PERSONAL DISCOVERY REPORT", 42, 201, { width: 511, align: "center", lineBreak: false });

  const [code, symbolName] = SIGNS[report.zodiacSign] || ["Z", "Zodiac"];
  const cx = 297;
  const cy = 320;
  doc.circle(cx, cy, 91).fillAndStroke("#fffaf0", GOLD);
  doc.circle(cx, cy, 79).lineWidth(1.5).strokeColor(NAVY).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10)
    .text("BIRTH SIGN", cx - 72, cy - 58, { width: 144, align: "center", lineBreak: false });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(42)
    .text(code, cx - 55, cy - 26, { width: 110, align: "center", lineBreak: false });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9)
    .text(symbolName.toUpperCase(), cx - 60, cy + 30, { width: 120, align: "center", lineBreak: false });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(10)
    .text("REFLECTION", cx - 72, cy + 48, { width: 144, align: "center", lineBreak: false });
  doc.fillColor(MUTED).font("Helvetica").fontSize(7)
    .text("ZODIAC CATEGORY", cx - 60, cy + 66, { width: 120, align: "center", lineBreak: false });

  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13)
    .text(short(report.zodiacSign, 30).toUpperCase(), 42, 430, { width: 511, align: "center", lineBreak: false });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18)
    .text(short(report.name, 70), 42, 465, { width: 511, align: "center", lineBreak: false });
  doc.fillColor(INK).font("Helvetica").fontSize(11)
    .text(short(report.formattedDate, 60).toUpperCase(), 42, 494, { width: 511, align: "center", lineBreak: false });
  doc.fillColor(MUTED).font("Helvetica").fontSize(9)
    .text("YOUR DATE - YOUR SYMBOLS - YOUR STORY", 42, 550, { width: 511, align: "center", lineBreak: false });
  footer(doc, `${report.edition || "classic"} EDITION`);
}

export function createPdf(report) {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false, info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" } });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  drawCover(doc, report);

  startSection(doc, "Your Birthday at a Glance", "The key details connected to your selected birth date");
  card(doc, 42, 137, 250, 58, "Name", report.name);
  card(doc, 303, 137, 250, 58, "Date of birth", report.formattedDate);
  card(doc, 42, 207, 250, 58, "Day of week", report.weekday);
  card(doc, 303, 207, 250, 58, "Zodiac sign", report.zodiacSign);
  card(doc, 42, 277, 250, 58, "Element", report.element);
  card(doc, 303, 277, 250, 58, "Ruling planet", report.rulingPlanet);
  card(doc, 42, 347, 250, 58, "Birthstone", report.birthstone);
  card(doc, 303, 347, 250, 58, "Birth flower", report.birthFlower);
  card(doc, 42, 417, 250, 58, "Life-path number", report.lifePathNumber);
  card(doc, 303, 417, 250, 58, "Personal year", report.personalYear);
  card(doc, 42, 487, 511, 82, "Calendar context", `Day ${report.dayOfYear} of the year - ${report.daysRemaining} days remaining - ${report.leapYear ? "Leap year" : "Common year"}.`);
  paragraph(doc, report.note, 42, 600, 511, 8.5);
  footer(doc, "2");

  startSection(doc, "Your Personality & Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  card(doc, 42, 137, 511, 72, "Core personality", report.corePersonality, 8.8);
  card(doc, 42, 223, 250, 70, "Key traits", report.keyTraits);
  card(doc, 303, 223, 250, 70, "Strengths", report.strengths);
  card(doc, 42, 307, 250, 70, "Potential challenges", report.challenges);
  card(doc, 303, 307, 250, 70, "Communication", report.communicationStyle);
  card(doc, 42, 391, 250, 70, "Relationships", report.relationship);
  card(doc, 303, 391, 250, 70, "Friendship", report.friendship);
  card(doc, 42, 475, 250, 70, "Learning", report.learning);
  card(doc, 303, 475, 250, 70, "Work and goals", `${report.workCareer} ${report.goals}`);
  card(doc, 42, 559, 511, 76, "Personal growth", report.growth, 8.8);
  footer(doc, "3");

  startSection(doc, "Your Date in History", "Research-based birthday facts when reference information is available");
  card(doc, 42, 137, 511, 68, "Research note", "Date-linked facts are included for context. They do not show that people sharing a birthday have the same personality or destiny.", 8.5);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("Events connected to your date", 42, 231, { lineBreak: false });
  bulletList(doc, report.historicalEvents, 42, 258, 5);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("People born on your date", 42, 410, { lineBreak: false });
  bulletList(doc, report.famousBirths, 42, 437, 5);
  card(doc, 42, 590, 511, 68, "Source approach", "The production version should show source links beside factual entries and remove any entry that cannot be verified.", 8.5);
  footer(doc, "4");

  startSection(doc, "Numbers, Symbols & Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
  card(doc, 42, 137, 250, 62, "Life-path number", report.lifePathNumber);
  card(doc, 303, 137, 250, 62, "Birthday number", report.birthdayNumber);
  card(doc, 42, 213, 250, 62, "Attitude number", report.attitudeNumber);
  card(doc, 303, 213, 250, 62, "Chinese zodiac", report.chineseZodiac);
  card(doc, 42, 289, 250, 62, "Generation", report.generation);
  card(doc, 303, 289, 250, 62, "Zodiac dates", report.zodiacDates);
  card(doc, 42, 365, 511, 82, "Birth-year profile", report.yearProfile, 8.5);
  card(doc, 42, 461, 250, 62, "Lucky colors", report.luckyColors);
  card(doc, 303, 461, 250, 62, "Modality", report.modality);
  card(doc, 42, 537, 511, 72, "Interpretation boundary", "Numbers, zodiac categories and symbolic associations are not scientifically validated measurements or predictions.", 8.5);
  footer(doc, "5");

  startSection(doc, "Your Personal Birthday Story", "A reflective keepsake built from your birth date");
  card(doc, 42, 137, 511, 92, `A beginning in ${report.year}`, report.story, 9);
  if (report.aiNarrative) card(doc, 42, 247, 511, 104, "Your AI-personalized narrative", report.aiNarrative, 8.8);
  paragraph(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.", 42, 378, 511, 9);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Key themes for reflection", 42, 447, { lineBreak: false });
  (report.themes || []).slice(0, 6).forEach((theme, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    card(doc, 42 + col * 261, 475 + row * 70, 250, 56, theme, "Choose one small action for this theme.", 8);
  });
  card(doc, 42, 710, 511, 58, "Final message", "The stars and symbols may inspire reflection, but your choices, relationships and actions shape your story.", 8.5);
  footer(doc, "6");

  doc.end();
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
