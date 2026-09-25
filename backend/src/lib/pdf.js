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

function textAt(doc, value, x, y, width, height, options = {}) {
  doc.fillColor(options.color || BODY)
    .font(options.font || "Helvetica")
    .fontSize(options.size || 8.5)
    .text(short(value, options.max || 650), x, y, {
      width,
      height,
      align: options.align || "left",
      lineGap: options.lineGap ?? 1,
      lineBreak: false,
      ellipsis: options.ellipsis ?? true
    });
}

function resetCursor(doc) {
  doc.x = 0;
  doc.y = 0;
}

function header(doc, title, subtitle = "") {
  resetCursor(doc);
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  textAt(doc, "BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14, 511, 10, {
    color: "#f5d98e", font: "Helvetica-Bold", size: 7, max: 80, align: "center"
  });
  if (title) {
    textAt(doc, title.toUpperCase(), 42, 68, 511, 24, {
      color: INK, font: "Helvetica-Bold", size: 18, max: 120, align: "center"
    });
    textAt(doc, subtitle, 42, 96, 511, 14, {
      color: MUTED, size: 8.5, max: 170, align: "center"
    });
    doc.strokeColor(LINE).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
  }
  resetCursor(doc);
}

function footer(doc, label) {
  doc.rect(0, 806, 595, 36).fill(NAVY);
  textAt(doc, `BIRTHDATE • ${label}`, 42, 819, 511, 9, {
    color: "#ffffff", size: 7, max: 90, align: "center", ellipsis: false
  });
  resetCursor(doc);
}

function newPage(doc, title, subtitle) {
  doc.addPage({ size: "A4", margin: 0 });
  resetCursor(doc);
  header(doc, title, subtitle);
  resetCursor(doc);
}

function card(doc, x, y, w, h, title, value, size = 8.2) {
  doc.roundedRect(x, y, w, h, 6).fillAndStroke("#fffaf0", LINE);
  textAt(doc, title, x + 10, y + 10, w - 20, 11, {
    color: INK, font: "Helvetica-Bold", size: 8.5, max: 70
  });
  textAt(doc, value, x + 10, y + 28, w - 20, h - 34, {
    color: BODY, size, max: h >= 90 ? 520 : 220
  });
  resetCursor(doc);
}

function paragraph(doc, value, x, y, w, h = 48, size = 8.5) {
  textAt(doc, value, x, y, w, h, { size, max: 650, lineGap: 2 });
  resetCursor(doc);
}

function bulletList(doc, items, x, y, max = 5) {
  (items || []).slice(0, max).forEach((item, index) => {
    const value = typeof item === "string" ? item : `${item.year}: ${item.text}`;
    textAt(doc, `• ${value}`, x, y + index * 25, 511, 20, { size: 8.2, max: 175 });
  });
  resetCursor(doc);
}

function drawCover(doc, report) {
  doc.addPage({ size: "A4", margin: 0 });
  resetCursor(doc);
  header(doc, "", "");
  textAt(doc, "BIRTHDATE", 42, 155, 511, 36, { color: NAVY, font: "Helvetica-Bold", size: 29, max: 30, align: "center" });
  textAt(doc, "PERSONAL DISCOVERY REPORT", 42, 201, 511, 22, { color: INK, font: "Helvetica-Bold", size: 17, max: 40, align: "center" });

  const [code, symbolName] = SIGNS[report.zodiacSign] || ["Z", "Zodiac"];
  const cx = 297;
  const cy = 320;
  doc.circle(cx, cy, 91).fillAndStroke("#fffaf0", GOLD);
  doc.circle(cx, cy, 79).lineWidth(1.5).strokeColor(NAVY).stroke();
  textAt(doc, "BIRTH SIGN", cx - 72, cy - 58, 144, 12, { color: GOLD, font: "Helvetica-Bold", size: 8, max: 20, align: "center" });
  textAt(doc, code, cx - 55, cy - 26, 110, 44, { color: NAVY, font: "Helvetica-Bold", size: 42, max: 5, align: "center" });
  textAt(doc, symbolName.toUpperCase(), cx - 60, cy + 30, 120, 12, { color: NAVY, font: "Helvetica-Bold", size: 9, max: 30, align: "center" });
  textAt(doc, "REFLECTION", cx - 72, cy + 48, 144, 12, { color: GOLD, font: "Helvetica-Bold", size: 8, max: 20, align: "center" });
  textAt(doc, "ZODIAC CATEGORY", cx - 60, cy + 66, 120, 10, { color: MUTED, size: 7, max: 30, align: "center" });
  textAt(doc, report.zodiacSign, 42, 430, 511, 18, { color: GOLD, font: "Helvetica-Bold", size: 13, max: 30, align: "center" });
  textAt(doc, report.name, 42, 465, 511, 24, { color: INK, font: "Helvetica-Bold", size: 18, max: 70, align: "center" });
  textAt(doc, String(report.formattedDate || "").toUpperCase(), 42, 494, 511, 14, { color: INK, size: 11, max: 60, align: "center" });
  textAt(doc, "YOUR DATE • YOUR SYMBOLS • YOUR STORY", 42, 550, 511, 12, { color: MUTED, size: 9, max: 60, align: "center" });
  footer(doc, `${report.edition || "classic"} EDITION`);
}

export function createPdf(report) {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false, info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" } });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  drawCover(doc, report);

  newPage(doc, "Your Birthday at a Glance", "The key details connected to your selected birth date");
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
  card(doc, 42, 487, 511, 82, "Calendar context", `Day ${report.dayOfYear} of the year • ${report.daysRemaining} days remaining • ${report.leapYear ? "Leap year" : "Common year"}.`);
  paragraph(doc, report.note, 42, 600, 511, 48, 8.5);
  footer(doc, "2");

  newPage(doc, "Your Personality & Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  card(doc, 42, 137, 511, 72, "Core personality", report.corePersonality, 8.8);
  card(doc, 42, 223, 250, 70, "Key traits", report.keyTraits);
  card(doc, 303, 223, 250, 70, "Strengths", report.strengths);
  card(doc, 42, 307, 250, 70, "Potential challenges", report.challenges);
  card(doc, 303, 307, 250, 70, "Communication", report.communicationStyle);
  card(doc, 42, 391, 250, 70, "Relationships", report.relationship);
  card(doc, 303, 391, 250, 70, "Friendship", report.friendship);
  card(doc, 42, 475, 250, 70, "Learning", report.learning);
  card(doc, 303, 475, 250, 70, "Work and goals", `${report.workCareer || ""} ${report.goals || ""}`);
  card(doc, 42, 559, 511, 76, "Personal growth", report.growth, 8.8);
  footer(doc, "3");

  newPage(doc, "Your Date in History", "Research-based birthday facts when reference information is available");
  card(doc, 42, 137, 511, 68, "Research note", "Date-linked facts are included for context. They do not show that people sharing a birthday have the same personality or destiny.", 8.5);
  textAt(doc, "Events connected to your date", 42, 231, 511, 15, { color: INK, font: "Helvetica-Bold", size: 11, max: 50 });
  bulletList(doc, report.historicalEvents, 42, 258, 5);
  textAt(doc, "People born on your date", 42, 410, 511, 15, { color: INK, font: "Helvetica-Bold", size: 11, max: 50 });
  bulletList(doc, report.famousBirths, 42, 437, 5);
  card(doc, 42, 590, 511, 68, "Source approach", "The production version should show source links beside factual entries and remove any entry that cannot be verified.", 8.5);
  footer(doc, "4");

  newPage(doc, "Numbers, Symbols & Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
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

  newPage(doc, "Your Personal Birthday Story", "A reflective keepsake built from your birth date");
  card(doc, 42, 137, 511, 92, `A beginning in ${report.year}`, report.story, 9);
  if (report.aiNarrative) card(doc, 42, 247, 511, 104, "Your AI-personalized narrative", report.aiNarrative, 8.8);
  paragraph(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.", 42, 378, 511, 45, 9);
  textAt(doc, "Key themes for reflection", 42, 447, 511, 15, { color: INK, font: "Helvetica-Bold", size: 12, max: 60 });
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
