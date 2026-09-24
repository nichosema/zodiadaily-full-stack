import PDFDocument from "pdfkit";

const NAVY = "#10233f";
const INK = "#233044";
const GOLD = "#c9a75a";
const PAPER = "#fbf7ef";
const MUTED = "#687386";
const LINE = "#ded3bd";

const GLYPHS = {
  Aries: "AR", Taurus: "TA", Gemini: "GE", Cancer: "CA", Leo: "LE", Virgo: "VI",
  Libra: "LI", Scorpio: "SC", Sagittarius: "SA", Capricorn: "CP", Aquarius: "AQ", Pisces: "PI"
};

function short(value, max = 420) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function header(doc, page, title, subtitle = "") {
  doc.addPage({ size: "A4", margin: 42 });
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7).text("BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14, { width: 511, align: "center" });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(title.toUpperCase(), 42, 68, { width: 511, align: "center" });
  if (subtitle) doc.fillColor(MUTED).font("Helvetica").fontSize(8.5).text(subtitle, 42, 96, { width: 511, align: "center" });
  doc.strokeColor(LINE).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
  doc.rect(0, 806, 595, 36).fill(NAVY);
  doc.fillColor("#ffffff").font("Helvetica").fontSize(7).text(`BIRTHDATE • ${page}`, 42, 819, { width: 511, align: "center" });
  return 137;
}

function coverBadge(doc, report, x = 297, y = 285) {
  doc.save();
  doc.circle(x, y, 67).fillAndStroke("#fffaf0", GOLD);
  doc.circle(x, y, 57).lineWidth(1).strokeColor(NAVY).stroke();
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(24).text(GLYPHS[report.zodiacSign] || report.zodiacSign.slice(0, 2).toUpperCase(), x - 45, y - 18, { width: 90, align: "center" });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(9).text(report.element.toUpperCase(), x - 45, y + 15, { width: 90, align: "center" });
  doc.fillColor(MUTED).font("Helvetica").fontSize(7).text("ZODIAC EMBLEM", x - 45, y + 31, { width: 90, align: "center" });
  doc.restore();
}

function card(doc, x, y, w, h, title, value, size = 8.5) {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fillAndStroke("#fffaf0", LINE);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(9).text(title, x + 10, y + 10, { width: w - 20, height: 14 });
  doc.fillColor("#3e4b5c").font("Helvetica").fontSize(size).text(short(value, 360), x + 10, y + 28, { width: w - 20, height: h - 34, lineGap: 2, ellipsis: true });
  doc.restore();
}

function paragraph(doc, value, x, y, w = 511, size = 9.5, height = 70) {
  doc.fillColor("#3e4b5c").font("Helvetica").fontSize(size).text(short(value, 700), x, y, { width: w, height, lineGap: 3, ellipsis: true });
}

function list(doc, items, x, y, w, max = 4) {
  (items || []).slice(0, max).forEach((item, index) => {
    const text = typeof item === "string" ? item : `${item.year}: ${item.text}`;
    doc.fillColor("#3e4b5c").font("Helvetica").fontSize(8.5).text(`• ${short(text, 180)}`, x, y + index * 28, { width: w, height: 23, ellipsis: true });
  });
}

export function createPdf(report) {
  const doc = new PDFDocument({ size: "A4", margin: 42, autoFirstPage: false, info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" } });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  // 1. Cover: a graphical zodiac badge, not a blank page.
  doc.addPage({ size: "A4", margin: 42 });
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7).text("BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14, { width: 511, align: "center" });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(29).text("BIRTHDATE", 42, 155, { width: 511, align: "center" });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(17).text("PERSONAL DISCOVERY REPORT", 42, 201, { width: 511, align: "center" });
  coverBadge(doc, report, 297, 320);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13).text(report.zodiacSign.toUpperCase(), 42, 410, { width: 511, align: "center" });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(short(report.name, 70), 42, 448, { width: 511, align: "center" });
  doc.font("Helvetica").fontSize(11).text(report.formattedDate.toUpperCase(), 42, 477, { width: 511, align: "center" });
  doc.fillColor(MUTED).fontSize(9).text("YOUR DATE • YOUR SYMBOLS • YOUR STORY", 42, 535, { width: 511, align: "center" });
  doc.rect(0, 806, 595, 36).fill(NAVY);
  doc.fillColor("#ffffff").font("Helvetica").fontSize(7).text("BIRTHDATE • COVER", 42, 819, { width: 511, align: "center" });

  // 2. Overview and personality.
  let y = header(doc, 2, "Your Birthday at a Glance", "The key details connected to your selected birth date");
  card(doc, 42, y, 250, 65, "Name", report.name); card(doc, 303, y, 250, 65, "Date of birth", report.formattedDate);
  card(doc, 42, y + 78, 250, 65, "Day of week", report.weekday); card(doc, 303, y + 78, 250, 65, "Zodiac sign", report.zodiacSign);
  card(doc, 42, y + 156, 250, 65, "Element", report.element); card(doc, 303, y + 156, 250, 65, "Ruling planet", report.rulingPlanet);
  card(doc, 42, y + 234, 250, 65, "Birthstone", report.birthstone); card(doc, 303, y + 234, 250, 65, "Birth flower", report.birthFlower);
  card(doc, 42, y + 312, 250, 65, "Life-path number", report.lifePathNumber); card(doc, 303, y + 312, 250, 65, "Personal year", report.personalYear);
  card(doc, 42, y + 390, 511, 88, "Calendar context", `Day ${report.dayOfYear} of the year • ${report.daysRemaining} days remaining • ${report.leapYear ? "Leap year" : "Common year"}.`);
  paragraph(doc, report.note, 42, y + 505, 511, 8.5, 48);

  // 3. Personality and life areas.
  y = header(doc, 3, "Your Personality & Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  card(doc, 42, y, 511, 76, "Core personality", report.corePersonality);
  card(doc, 42, y + 90, 250, 76, "Key traits", report.keyTraits); card(doc, 303, y + 90, 250, 76, "Strengths", report.strengths);
  card(doc, 42, y + 180, 250, 76, "Potential challenges", report.challenges); card(doc, 303, y + 180, 250, 76, "Communication", report.communicationStyle);
  card(doc, 42, y + 270, 250, 76, "Relationships", report.relationship); card(doc, 303, y + 270, 250, 76, "Friendship", report.friendship);
  card(doc, 42, y + 360, 250, 76, "Learning", report.learning); card(doc, 303, y + 360, 250, 76, "Work and goals", `${report.workCareer} ${report.goals}`);
  card(doc, 42, y + 450, 511, 65, "Personal growth", report.growth);

  // 4. Birthday history and people.
  y = header(doc, 4, "Your Date in History", "Research-based birthday facts when reference information is available");
  card(doc, 42, y, 511, 52, "Research note", "The following entries are date-linked reference items. They are not evidence that people sharing a birthday have the same personality or destiny.");
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("Events connected to your date", 42, y + 78);
  list(doc, report.historicalEvents, 42, y + 103, 511, 5);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("People born on your date", 42, y + 250);
  list(doc, report.famousBirths, 42, y + 275, 511, 5);
  card(doc, 42, y + 425, 511, 65, "Source approach", "The production version should display source links beside factual entries and remove any entry that cannot be verified.");

  // 5. Numbers, symbols and birth-year context.
  y = header(doc, 5, "Numbers, Symbols & Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
  card(doc, 42, y, 250, 72, "Life-path number", report.lifePathNumber); card(doc, 303, y, 250, 72, "Birthday number", report.birthdayNumber);
  card(doc, 42, y + 86, 250, 72, "Attitude number", report.attitudeNumber); card(doc, 303, y + 86, 250, 72, "Chinese zodiac", report.chineseZodiac);
  card(doc, 42, y + 172, 250, 72, "Generation", report.generation); card(doc, 303, y + 172, 250, 72, "Zodiac dates", report.zodiacDates);
  card(doc, 42, y + 258, 511, 80, "Birth-year profile", report.yearProfile);
  card(doc, 42, y + 354, 250, 72, "Lucky colors", report.luckyColors); card(doc, 303, y + 354, 250, 72, "Modality", report.modality);
  card(doc, 42, y + 440, 511, 65, "Interpretation boundary", "Numbers, zodiac categories and symbolic associations are not scientifically validated measurements or predictions.");

  // 6. Story and reflection.
  y = header(doc, 6, "Your Personal Birthday Story", "A reflective keepsake built from your birth date");
  card(doc, 42, y, 511, 105, `A beginning in ${report.year}`, report.story);
  paragraph(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.", 42, y + 140, 511, 10, 55);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Key themes for reflection", 42, y + 225);
  (report.themes || []).slice(0, 6).forEach((theme, index) => {
    const col = index % 2; const row = Math.floor(index / 2);
    card(doc, 42 + col * 261, y + 252 + row * 78, 250, 62, theme, "Consider one small action that expresses this theme in your daily life.");
  });
  card(doc, 42, y + 505, 511, 65, "Final message", "The stars and symbols may inspire reflection, but your choices, relationships and actions shape your story.");

  doc.end();
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
