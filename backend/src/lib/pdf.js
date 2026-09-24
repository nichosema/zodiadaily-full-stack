import PDFDocument from "pdfkit";

const NAVY = "#10233f";
const INK = "#233044";
const GOLD = "#c9a75a";
const PAPER = "#fbf7ef";
const MUTED = "#687386";
const LINE = "#ded3bd";

// Use font-safe abbreviations instead of unsupported zodiac glyphs.
const SIGNS = {
  Aries: ["AR", "Ram"], Taurus: ["TA", "Bull"], Gemini: ["GE", "Twins"],
  Cancer: ["CA", "Crab"], Leo: ["LE", "Lion"], Virgo: ["VI", "Maiden"],
  Libra: ["LI", "Scales"], Scorpio: ["SC", "Scorpion"], Sagittarius: ["SA", "Archer"],
  Capricorn: ["CP", "Sea-goat"], Aquarius: ["AQ", "Water-bearer"], Pisces: ["PI", "Fish"]
};

const EDITION_MOTIFS = {
  classic: ["*", "+", "."], cosmic: ["~", "+", "o"], story: ["*", "/", "."],
  couples: ["<3", "∞", "+"], family: ["[]", "&", "+"], gift: ["G", "<3", "."]
};

function short(value, max = 420) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text ? (text.length > max ? `${text.slice(0, max - 1)}…` : text) : "Not available";
}

function footer(doc, label) {
  doc.rect(0, 806, 595, 36).fill(NAVY);
  // lineBreak:false prevents PDFKit from creating an extra blank page at the footer.
  doc.fillColor("#ffffff").font("Helvetica").fontSize(7).text(label, 42, 818, {
    width: 511,
    align: "center",
    lineBreak: false
  });
}

function pageHeader(doc, page, title, subtitle = "") {
  doc.addPage({ size: "A4", margin: 42 });
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7).text(
    "BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14,
    { width: 511, align: "center", lineBreak: false }
  );
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(title.toUpperCase(), 42, 68, {
    width: 511,
    align: "center",
    lineBreak: false
  });
  if (subtitle) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(8.5).text(subtitle, 42, 96, {
      width: 511,
      align: "center",
      lineBreak: false
    });
  }
  doc.strokeColor(LINE).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
  return 137;
}

function coverArtwork(doc, report, x = 297, y = 315) {
  const [symbol, motif] = SIGNS[report.zodiacSign] || ["Z", "Zodiac"];
  const edition = report.edition || "classic";
  const decorations = EDITION_MOTIFS[edition] || EDITION_MOTIFS.classic;
  doc.save();
  doc.circle(x, y, 91).fillAndStroke("#fffaf0", GOLD);
  doc.circle(x, y, 79).lineWidth(1.5).strokeColor(NAVY).stroke();
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(18).text(decorations[0], x - 72, y - 58, {
    width: 144, align: "center", lineBreak: false
  });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(42).text(symbol, x - 55, y - 26, {
    width: 110, align: "center", lineBreak: false
  });
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(motif.toUpperCase(), x - 60, y + 30, {
    width: 120, align: "center", lineBreak: false
  });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(15).text(decorations[1], x - 72, y + 48, {
    width: 144, align: "center", lineBreak: false
  });
  doc.fillColor(MUTED).font("Helvetica").fontSize(7).text("ZODIAC SYMBOL", x - 60, y + 66, {
    width: 120, align: "center", lineBreak: false
  });
  doc.restore();
}

function card(doc, x, y, w, h, title, value, size = 8.2) {
  doc.save();
  doc.roundedRect(x, y, w, h, 6).fillAndStroke("#fffaf0", LINE);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(8.5).text(short(title, 70), x + 10, y + 9, {
    width: w - 20, height: 12, lineBreak: false
  });
  doc.fillColor("#3e4b5c").font("Helvetica").fontSize(size).text(short(value, 300), x + 10, y + 26, {
    width: w - 20, height: h - 32, lineGap: 1.5, ellipsis: true
  });
  doc.restore();
}

function paragraph(doc, value, x, y, w = 511, size = 8.5, height = 42) {
  doc.fillColor("#3e4b5c").font("Helvetica").fontSize(size).text(short(value, 650), x, y, {
    width: w, height, lineGap: 2, ellipsis: true
  });
}

function list(doc, items, x, y, max = 4) {
  (items || []).slice(0, max).forEach((item, index) => {
    const text = typeof item === "string" ? item : `${item.year}: ${item.text}`;
    doc.fillColor("#3e4b5c").font("Helvetica").fontSize(8).text(`• ${short(text, 180)}`, x, y + index * 25, {
      width: 511, height: 21, ellipsis: true
    });
  });
}

export function createPdf(report) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    autoFirstPage: false,
    info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" }
  });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  // Page 1: cover
  doc.addPage({ size: "A4", margin: 42 });
  doc.rect(0, 0, 595, 842).fill(PAPER);
  doc.rect(0, 0, 595, 34).fill(NAVY);
  doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7).text(
    "BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14,
    { width: 511, align: "center", lineBreak: false }
  );
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(29).text("BIRTHDATE", 42, 155, {
    width: 511, align: "center", lineBreak: false
  });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(17).text("PERSONAL DISCOVERY REPORT", 42, 201, {
    width: 511, align: "center", lineBreak: false
  });
  coverArtwork(doc, report, 297, 320);
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(13).text(short(report.zodiacSign).toUpperCase(), 42, 430, {
    width: 511, align: "center", lineBreak: false
  });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text(short(report.name, 70), 42, 465, {
    width: 511, align: "center", lineBreak: false
  });
  doc.font("Helvetica").fontSize(11).text(short(report.formattedDate).toUpperCase(), 42, 494, {
    width: 511, align: "center", lineBreak: false
  });
  doc.fillColor(MUTED).fontSize(9).text("YOUR DATE • YOUR SYMBOLS • YOUR STORY", 42, 550, {
    width: 511, align: "center", lineBreak: false
  });
  footer(doc, `BIRTHDATE • ${report.edition || "classic"} EDITION`);

  // Page 2: overview and personality together, with no overflow.
  let y = pageHeader(doc, 2, "Your Birthday at a Glance", "The key details connected to your selected birth date");
  card(doc, 42, y, 250, 54, "Name", report.name); card(doc, 303, y, 250, 54, "Date of birth", report.formattedDate);
  card(doc, 42, y + 65, 250, 54, "Day of week", report.weekday); card(doc, 303, y + 65, 250, 54, "Zodiac sign", report.zodiacSign);
  card(doc, 42, y + 130, 250, 54, "Element", report.element); card(doc, 303, y + 130, 250, 54, "Ruling planet", report.rulingPlanet);
  card(doc, 42, y + 195, 250, 54, "Birthstone", report.birthstone); card(doc, 303, y + 195, 250, 54, "Birth flower", report.birthFlower);
  card(doc, 42, y + 260, 250, 54, "Life-path number", report.lifePathNumber); card(doc, 303, y + 260, 250, 54, "Personal year", report.personalYear);
  card(doc, 42, y + 325, 511, 66, "Calendar context", `Day ${report.dayOfYear} of the year • ${report.daysRemaining} days remaining • ${report.leapYear ? "Leap year" : "Common year"}.`);
  paragraph(doc, report.note, 42, y + 408, 511, 8, 42);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Personality snapshot", 42, y + 474, { lineBreak: false });
  card(doc, 42, y + 495, 250, 66, "Core personality", report.corePersonality); card(doc, 303, y + 495, 250, 66, "Key traits", report.keyTraits);
  footer(doc, "BIRTHDATE • 2");

  // Page 3: life areas
  y = pageHeader(doc, 3, "Your Personality & Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  card(doc, 42, y, 511, 64, "Strengths", report.strengths);
  card(doc, 42, y + 76, 250, 64, "Potential challenges", report.challenges); card(doc, 303, y + 76, 250, 64, "Communication", report.communicationStyle);
  card(doc, 42, y + 152, 250, 64, "Relationships", report.relationship); card(doc, 303, y + 152, 250, 64, "Friendship", report.friendship);
  card(doc, 42, y + 228, 250, 64, "Learning", report.learning); card(doc, 303, y + 228, 250, 64, "Work and goals", `${report.workCareer} ${report.goals}`);
  card(doc, 42, y + 304, 511, 64, "Personal growth", report.growth);
  card(doc, 42, y + 390, 511, 86, "Reflection prompt", "Which of these themes feels useful to you right now, and what small action could you take this week?");
  footer(doc, "BIRTHDATE • 3");

  // Page 4: history
  y = pageHeader(doc, 4, "Your Date in History", "Research-based birthday facts when reference information is available");
  card(doc, 42, y, 511, 54, "Research note", "These are date-linked reference items. They are not evidence that people sharing a birthday have the same personality or destiny.");
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("Events connected to your date", 42, y + 78, { lineBreak: false });
  list(doc, report.historicalEvents, 42, y + 103, 5);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text("People born on your date", 42, y + 246, { lineBreak: false });
  list(doc, report.famousBirths, 42, y + 271, 5);
  card(doc, 42, y + 405, 511, 65, "Source approach", "Production reports should show source links beside factual entries and remove any entry that cannot be verified.");
  footer(doc, "BIRTHDATE • 4");

  // Page 5: symbols and numbers
  y = pageHeader(doc, 5, "Numbers, Symbols & Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
  card(doc, 42, y, 250, 60, "Life-path number", report.lifePathNumber); card(doc, 303, y, 250, 60, "Birthday number", report.birthdayNumber);
  card(doc, 42, y + 72, 250, 60, "Attitude number", report.attitudeNumber); card(doc, 303, y + 72, 250, 60, "Chinese zodiac", report.chineseZodiac);
  card(doc, 42, y + 144, 250, 60, "Generation", report.generation); card(doc, 303, y + 144, 250, 60, "Zodiac dates", report.zodiacDates);
  card(doc, 42, y + 216, 511, 70, "Birth-year profile", report.yearProfile);
  card(doc, 42, y + 298, 250, 60, "Lucky colors", report.luckyColors); card(doc, 303, y + 298, 250, 60, "Modality", report.modality);
  card(doc, 42, y + 370, 511, 70, "Interpretation boundary", "Numbers, zodiac categories and symbolic associations are not scientifically validated measurements or predictions.");
  footer(doc, "BIRTHDATE • 5");

  // Page 6: story
  y = pageHeader(doc, 6, "Your Personal Birthday Story", "A reflective keepsake built from your birth date");
  card(doc, 42, y, 511, 82, `A beginning in ${report.year}`, report.story);
  if (report.aiNarrative) card(doc, 42, y + 96, 511, 94, "Your AI-personalized narrative", report.aiNarrative);
  const promptY = report.aiNarrative ? y + 212 : y + 112;
  paragraph(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.", 42, promptY, 511, 8.5, 48);
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12).text("Key themes for reflection", 42, promptY + 65, { lineBreak: false });
  const themeY = promptY + 90;
  (report.themes || []).slice(0, 6).forEach((theme, index) => {
    const col = index % 2; const row = Math.floor(index / 2);
    card(doc, 42 + col * 261, themeY + row * 70, 250, 55, theme, "Choose one small action for this theme.");
  });
  card(doc, 42, 690, 511, 58, "Final message", "The stars and symbols may inspire reflection, but your choices, relationships and actions shape your story.");
  footer(doc, "BIRTHDATE • 6");

  doc.end();
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
