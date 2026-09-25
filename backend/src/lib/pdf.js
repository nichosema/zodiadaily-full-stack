import PDFDocument from "pdfkit";

const W = 595;
const H = 842;
const NAVY = "#10233f";
const INK = "#233044";
const GOLD = "#c9a75a";
const PAPER = "#fbf7ef";
const MUTED = "#687386";
const LINE = "#ded3bd";
const BODY = "#3e4b5c";

const clean = value => String(value ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim();
const clip = (value, max = 160) => {
  const text = clean(value) || "Not available";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

function t(doc, value, x, y, width, opts = {}) {
  doc.save();
  doc.fillColor(opts.color || BODY).font(opts.font || "Helvetica").fontSize(opts.size || 8.5);
  doc.text(clip(value, opts.max || 160), x, y, { width, align: opts.align || "left", lineBreak: false });
  doc.restore();
}

function start(doc, title = "", subtitle = "") {
  doc.rect(0, 0, W, H).fill(PAPER);
  doc.rect(0, 0, W, 34).fill(NAVY);
  t(doc, "BIRTHDATE - PERSONAL DISCOVERY REPORT", 42, 14, 511, { color: "#f5d98e", font: "Helvetica-Bold", size: 7, max: 80, align: "center" });
  if (title) {
    t(doc, title.toUpperCase(), 42, 68, 511, { color: INK, font: "Helvetica-Bold", size: 18, max: 120, align: "center" });
    t(doc, subtitle, 42, 96, 511, { color: MUTED, size: 8.5, max: 170, align: "center" });
    doc.strokeColor(LINE).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
  }
}

function page(doc, title, subtitle) {
  doc.addPage({ size: "A4", margin: 0 });
  start(doc, title, subtitle);
}

function foot(doc, label) {
  doc.rect(0, 780, W, 42).fill(NAVY);
  t(doc, `BIRTHDATE - ${label}`, 42, 796, 511, { color: "#ffffff", size: 7, max: 100, align: "center" });
}

function box(doc, x, y, w, h, title, value, size = 8.2) {
  doc.roundedRect(x, y, w, h, 6).fillAndStroke("#fffaf0", LINE);
  t(doc, title, x + 10, y + 10, w - 20, { color: INK, font: "Helvetica-Bold", size: 8.5, max: 80 });
  t(doc, value, x + 10, y + 29, w - 20, { size, max: h > 80 ? 360 : 150 });
}

function sectionTitle(doc, value, y) {
  t(doc, value, 42, y, 511, { color: INK, font: "Helvetica-Bold", size: 11, max: 70 });
}

function bullets(doc, values, y) {
  (Array.isArray(values) ? values : []).slice(0, 5).forEach((value, i) => {
    const text = typeof value === "string" ? value : `${value?.year || ""}: ${value?.text || ""}`;
    t(doc, `- ${text}`, 42, y + i * 25, 511, { size: 8.2, max: 170 });
  });
}

function cover(doc, report) {
  doc.addPage({ size: "A4", margin: 0 });
  start(doc);
  t(doc, "BIRTHDATE", 42, 155, 511, { color: NAVY, font: "Helvetica-Bold", size: 29, max: 30, align: "center" });
  t(doc, "PERSONAL DISCOVERY REPORT", 42, 201, 511, { color: INK, font: "Helvetica-Bold", size: 17, max: 40, align: "center" });
  const sign = clip(report.zodiacSign, 30).toUpperCase();
  const animal = { Aries: "RAM", Taurus: "BULL", Gemini: "TWINS", Cancer: "CRAB", Leo: "LION", Virgo: "MAIDEN", Libra: "SCALES", Scorpio: "SCORPION", Sagittarius: "ARCHER", Capricorn: "SEA-GOAT", Aquarius: "WATER-BEARER", Pisces: "FISH" }[report.zodiacSign] || "ZODIAC";
  doc.circle(297, 320, 91).fillAndStroke("#fffaf0", GOLD);
  doc.circle(297, 320, 79).lineWidth(1.5).strokeColor(NAVY).stroke();
  t(doc, "BIRTH SIGN", 225, 262, 144, { color: GOLD, font: "Helvetica-Bold", size: 8, max: 20, align: "center" });
  t(doc, sign, 227, 295, 140, { color: NAVY, font: "Helvetica-Bold", size: 18, max: 30, align: "center" });
  t(doc, animal, 237, 332, 120, { color: NAVY, font: "Helvetica-Bold", size: 9, max: 30, align: "center" });
  t(doc, "REFLECTION", 225, 360, 144, { color: GOLD, font: "Helvetica-Bold", size: 8, max: 20, align: "center" });
  t(doc, "SYMBOLIC GUIDE", 237, 378, 120, { color: MUTED, size: 7, max: 30, align: "center" });
  t(doc, sign, 42, 430, 511, { color: GOLD, font: "Helvetica-Bold", size: 13, max: 30, align: "center" });
  t(doc, report.name, 42, 465, 511, { color: INK, font: "Helvetica-Bold", size: 18, max: 70, align: "center" });
  t(doc, String(report.formattedDate || "").toUpperCase(), 42, 494, 511, { color: INK, size: 11, max: 60, align: "center" });
  t(doc, "YOUR DATE - YOUR SYMBOLS - YOUR STORY", 42, 550, 511, { color: MUTED, size: 9, max: 60, align: "center" });
  foot(doc, `${report.edition || "classic"} EDITION`);
}

export function createPdf(report) {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: false, info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" } });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  cover(doc, report);

  page(doc, "Your Birthday at a Glance", "The key details connected to your selected birth date");
  box(doc, 42, 137, 250, 58, "Name", report.name); box(doc, 303, 137, 250, 58, "Date of birth", report.formattedDate);
  box(doc, 42, 207, 250, 58, "Day of week", report.weekday); box(doc, 303, 207, 250, 58, "Zodiac sign", report.zodiacSign);
  box(doc, 42, 277, 250, 58, "Element", report.element); box(doc, 303, 277, 250, 58, "Ruling planet", report.rulingPlanet);
  box(doc, 42, 347, 250, 58, "Birthstone", report.birthstone); box(doc, 303, 347, 250, 58, "Birth flower", report.birthFlower);
  box(doc, 42, 417, 250, 58, "Life-path number", report.lifePathNumber); box(doc, 303, 417, 250, 58, "Personal year", report.personalYear);
  box(doc, 42, 487, 511, 82, "Calendar context", `Day ${report.dayOfYear} of the year - ${report.daysRemaining} days remaining - ${report.leapYear ? "Leap year" : "Common year"}.`);
  t(doc, report.note, 42, 600, 511, { size: 8.5, max: 300 }); foot(doc, "2");

  page(doc, "Your Personality and Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  box(doc, 42, 137, 511, 72, "Core personality", report.corePersonality, 8.8);
  box(doc, 42, 223, 250, 70, "Key traits", report.keyTraits); box(doc, 303, 223, 250, 70, "Strengths", report.strengths);
  box(doc, 42, 307, 250, 70, "Potential challenges", report.challenges); box(doc, 303, 307, 250, 70, "Communication", report.communicationStyle);
  box(doc, 42, 391, 250, 70, "Relationships", report.relationship); box(doc, 303, 391, 250, 70, "Friendship", report.friendship);
  box(doc, 42, 475, 250, 70, "Learning", report.learning); box(doc, 303, 475, 250, 70, "Work and goals", `${report.workCareer || ""} ${report.goals || ""}`);
  box(doc, 42, 559, 511, 76, "Personal growth", report.growth, 8.8); foot(doc, "3");

  page(doc, "Your Date in History", "Research-based birthday facts when reference information is available");
  box(doc, 42, 137, 511, 68, "Research note", "Date-linked facts are included for context. They do not show that people sharing a birthday have the same personality or destiny.");
  sectionTitle(doc, "Events connected to your date", 231); bullets(doc, report.historicalEvents, 258);
  sectionTitle(doc, "People born on your date", 410); bullets(doc, report.famousBirths, 437);
  box(doc, 42, 590, 511, 68, "Source approach", "The production version should show source links beside factual entries and remove any entry that cannot be verified."); foot(doc, "4");

  page(doc, "Numbers, Symbols and Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
  box(doc, 42, 137, 250, 62, "Life-path number", report.lifePathNumber); box(doc, 303, 137, 250, 62, "Birthday number", report.birthdayNumber);
  box(doc, 42, 213, 250, 62, "Attitude number", report.attitudeNumber); box(doc, 303, 213, 250, 62, "Chinese zodiac", report.chineseZodiac);
  box(doc, 42, 289, 250, 62, "Generation", report.generation); box(doc, 303, 289, 250, 62, "Zodiac dates", report.zodiacDates);
  box(doc, 42, 365, 511, 82, "Birth-year profile", report.yearProfile); box(doc, 42, 461, 250, 62, "Lucky colors", report.luckyColors); box(doc, 303, 461, 250, 62, "Modality", report.modality);
  box(doc, 42, 537, 511, 72, "Interpretation boundary", "Numbers, zodiac categories and symbolic associations are not scientifically validated measurements or predictions."); foot(doc, "5");

  page(doc, "Your Personal Birthday Story", "A reflective keepsake built from your birth date");
  box(doc, 42, 137, 511, 92, `A beginning in ${report.year}`, report.story, 9);
  if (report.aiNarrative) box(doc, 42, 247, 511, 104, "Your AI-personalized narrative", report.aiNarrative, 8.8);
  t(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.", 42, 378, 511, { size: 9, max: 320 });
  sectionTitle(doc, "Key themes for reflection", 447);
  (Array.isArray(report.themes) ? report.themes : []).slice(0, 6).forEach((theme, i) => box(doc, 42 + (i % 2) * 261, 475 + Math.floor(i / 2) * 70, 250, 56, theme, "Choose one small action for this theme.", 8));
  box(doc, 42, 710, 511, 58, "Final message", "The stars and symbols may inspire reflection, but your choices, relationships and actions shape your story."); foot(doc, "6");

  doc.end();
  return new Promise((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
}
