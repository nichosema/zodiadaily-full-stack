import PDFDocument from "pdfkit";

const NAVY = "#0b1d3a";
const INK = "#1c2b39";
const GOLD = "#c9a75a";
const PAPER = "#fbf5e8";
const MUTED = "#6b7280";

function line(doc, y = doc.y) { doc.strokeColor("#d9cba9").lineWidth(0.7).moveTo(42, y).lineTo(553, y).stroke(); }
function footer(doc, page) { doc.save().rect(0, 806, 595, 36).fill(NAVY).restore(); doc.fillColor("#ffffff").font("Helvetica").fontSize(7).text(`BIRTHDATE • PERSONAL DISCOVERY REPORT                                      Page ${page}`, 42, 819, { width: 511, align: "center" }); }
function header(doc) { doc.save().rect(0, 0, 595, 34).fill(NAVY).restore(); doc.fillColor("#f5d98e").font("Helvetica-Bold").fontSize(7).text("BIRTHDATE • PERSONAL DISCOVERY REPORT", 42, 14, { width: 511, align: "center" }); }
function basePage(doc, page, title, subtitle = "") { doc.addPage({ size: "A4", margin: 42 }); doc.rect(0, 0, 595, 842).fill(PAPER); header(doc); doc.fillColor(INK).font("Helvetica-Bold").fontSize(19).text(title.toUpperCase(), 42, 72, { width: 511, align: "center" }); if (subtitle) doc.fillColor(MUTED).font("Helvetica").fontSize(8).text(subtitle, 42, 101, { width: 511, align: "center" }); line(doc, 117); footer(doc, page); doc.fillColor(INK); return 135; }
function card(doc, x, y, w, h, title, text) { doc.save().roundedRect(x, y, w, h, 5).lineWidth(0.7).strokeColor("#d9cba9").fillAndStroke("#fffaf0", "#d9cba9"); doc.fillColor(INK).font("Helvetica-Bold").fontSize(9).text(`◆ ${title}`, x + 10, y + 9, { width: w - 20 }); doc.fillColor("#394451").font("Helvetica").fontSize(8.5).text(text, x + 10, y + 25, { width: w - 20, lineGap: 2 }); doc.restore(); }
function paragraph(doc, text, x = 42, y = doc.y, w = 511, size = 10) { doc.fillColor("#394451").font("Helvetica").fontSize(size).text(text, x, y, { width: w, lineGap: 4 }); return doc.y; }
function bullets(doc, values, x, y, w) { values.forEach((value, index) => { doc.fillColor(INK).font("Helvetica-Bold").fontSize(9).text(`✦ ${value}`, x, y + index * 25, { width: w }); }); }

export function createPdf(report) {
  const doc = new PDFDocument({ size: "A4", margin: 42, autoFirstPage: false, info: { Title: "BirthDate Personal Discovery Report", Author: "ZodiaDaily" } });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  // 1. Cover
  doc.addPage({ size: "A4", margin: 42 });
  doc.rect(0, 0, 595, 842).fill(PAPER); header(doc);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(28).text("BIRTHDATE", 42, 215, { width: 511, align: "center" });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(18).text("PERSONAL DISCOVERY REPORT", 42, 258, { width: 511, align: "center" });
  doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(12).text(report.zodiacSign, 42, 315, { width: 511, align: "center" });
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(17).text(report.name, 42, 365, { width: 511, align: "center" });
  doc.font("Helvetica").fontSize(12).text(report.formattedDate.toUpperCase(), 42, 392, { width: 511, align: "center" });
  doc.fillColor(MUTED).fontSize(9).text("YOUR LIFE • YOUR DATE • YOUR STORY", 42, 455, { width: 511, align: "center" });
  footer(doc, 1);

  // 2. At a glance
  let y = basePage(doc, 2, "Your Birthday at a Glance", "Essential information about your birth date");
  card(doc, 42, y, 250, 75, "Name", report.name); card(doc, 303, y, 250, 75, "Date of Birth", report.formattedDate);
  card(doc, 42, y + 88, 250, 75, "Day of Week", report.weekday); card(doc, 303, y + 88, 250, 75, "Zodiac Sign", report.zodiacSign);
  card(doc, 42, y + 176, 250, 75, "Element", report.element); card(doc, 303, y + 176, 250, 75, "Modality", report.modality);
  card(doc, 42, y + 264, 250, 75, "Ruling Planet", report.rulingPlanet); card(doc, 303, y + 264, 250, 75, "Zodiac Dates", report.zodiacDates);
  card(doc, 42, y + 352, 250, 75, "Birthstone", `${report.birthstone} — a traditional symbolic association.`); card(doc, 303, y + 352, 250, 75, "Birth Flower", `${report.birthFlower} — a traditional symbolic association.`);
  card(doc, 42, y + 440, 250, 75, "Lucky Colors", report.luckyColors); card(doc, 303, y + 440, 250, 75, "Calendar Facts", `Day ${report.dayOfYear} of the year; ${report.daysRemaining} days remaining.`);
  paragraph(doc, report.note, 42, y + 545, 511, 8);

  // 3. Personality
  y = basePage(doc, 3, "Your Personality Traits", "Traditional astrology, numerology and cultural interpretations");
  card(doc, 42, y, 511, 75, "Core Personality", report.corePersonality);
  card(doc, 42, y + 92, 250, 80, "Key Traits", report.keyTraits); card(doc, 303, y + 92, 250, 80, "Strengths", report.strengths);
  card(doc, 42, y + 187, 250, 80, "Potential Challenges", report.challenges); card(doc, 303, y + 187, 250, 80, "Communication Style", report.communicationStyle);
  paragraph(doc, "This section is a reflective interpretation rather than a fixed description of the customer. Individual personality is shaped by many factors, including experience, culture, relationships and choices.", 42, y + 315, 511, 9);

  // 4. Life areas
  y = basePage(doc, 4, "Life Areas", "Reflective themes for relationships, learning, work and personal goals");
  card(doc, 42, y, 250, 85, "Relationships", report.relationship); card(doc, 303, y, 250, 85, "Friendship", report.friendship);
  card(doc, 42, y + 102, 250, 85, "Learning", report.learning); card(doc, 303, y + 102, 250, 85, "Work & Career", report.workCareer);
  card(doc, 42, y + 204, 250, 85, "Goals & Motivation", report.goals); card(doc, 303, y + 204, 250, 85, "Personal Growth", report.growth);

  // 5. Date in history
  y = basePage(doc, 5, "Your Date in History", "A safe research-ready layout for verified historical events");
  card(doc, 42, y, 511, 82, "Research rule", `Historical events connected to ${report.day} ${new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(`${report.birthDate}T00:00:00Z`))} should be checked against reliable sources before being included in a paid final report.`);
  card(doc, 42, y + 100, 250, 90, "Calendar Facts", `Weekday: ${report.weekday}\nDay of year: ${report.dayOfYear}\nLeap year: ${report.leapYear ? "Yes" : "No"}`); card(doc, 303, y + 100, 250, 90, "Seasonal Context", "The meaning of seasons depends on the customer's location. The final product can optionally ask for country or region.");
  card(doc, 42, y + 208, 511, 90, "Verified Events Module", "This page is structured for dated world, science, culture and technology events. A future research connector should supply the event, date, short summary and source URL rather than invented examples.");

  // 6. Same-date people
  y = basePage(doc, 6, "People Born on Your Date", "A verified same-date research section");
  card(doc, 42, y, 511, 95, "Research-first design", "The production version should populate this page from a verified reference source. Each entry should include a name, birth year, profession and a source link. The system must not invent names or claim that people who share a birthday have the same personality.");
  card(doc, 42, y + 112, 250, 90, "What can be compared", "Professional fields, public achievements and broad factual commonalities."); card(doc, 303, y + 112, 250, 90, "What should be avoided", "Claims that sharing a birth date causes shared traits, success or destiny.");
  card(doc, 42, y + 220, 511, 90, "Personal reflection", "Which kinds of achievements or life paths interest you? Use public examples as inspiration, not as a prediction of your own future.");

  // 7. Numerology
  y = basePage(doc, 7, "Your Numbers & Numerology", "Traditional numerology presented as symbolic reflection");
  card(doc, 42, y, 511, 82, "Life Path Number", `${report.lifePathNumber} — traditionally interpreted through symbolic themes. The calculation is based on the digits of the birth date.`);
  card(doc, 42, y + 98, 250, 82, "Birthday Number", `${report.birthdayNumber} — calculated from the day of the month.`); card(doc, 303, y + 98, 250, 82, "Attitude Number", `${report.attitudeNumber} — a traditional month-and-day calculation.`);
  card(doc, 42, y + 196, 250, 82, "Personal Year", `${report.personalYear} — calculated using the selected calendar year.`); card(doc, 303, y + 196, 250, 82, "Full Name Numbers", "Optional future feature when the customer provides a name and agrees to the calculation.");
  paragraph(doc, "Numerology is presented as a cultural or entertainment tradition and is not scientifically validated.", 42, y + 325, 511, 9);

  // 8. Symbols
  y = basePage(doc, 8, "Zodiac & Birth Symbols", "Cultural associations connected to the birth year and date");
  card(doc, 42, y, 511, 82, "Western Zodiac", `${report.zodiacSign} • Element: ${report.element} • Modality: ${report.modality} • Ruling planet: ${report.rulingPlanet}`);
  card(doc, 42, y + 100, 250, 82, "Birthstone", `${report.birthstone} — traditional symbolic associations.`); card(doc, 303, y + 100, 250, 82, "Birth Flower", `${report.birthFlower} — traditional symbolic associations.`);
  card(doc, 42, y + 198, 250, 82, "Colors", report.luckyColors); card(doc, 303, y + 198, 250, 82, "Symbolic Element", `${report.element} — a traditional classification, not a scientific personality category.`);

  // 9. Birth-year profile
  y = basePage(doc, 9, "Your Birth-Year Profile", "A look at the world, culture and technology around the birth year");
  card(doc, 42, y, 511, 85, "Born in ${report.year}", report.yearProfile);
  card(doc, 42, y + 102, 250, 90, "World Events", "The final research module can include selected verified events from the birth year with dates and sources."); card(doc, 303, y + 102, 250, 90, "Technology", "A short historical snapshot can cover communication, internet culture and widely documented technology developments.");
  card(doc, 42, y + 210, 250, 90, "Popular Culture", "Verified music, film, games and books may be included when reliable reference information is available."); card(doc, 303, y + 210, 250, 90, "Culture & Society", "The final version can describe documented cultural shifts without treating them as personal destiny.");

  // 10. Story
  y = basePage(doc, 10, "Your Personal Birthday Story", "A personalized narrative built from structured information");
  card(doc, 42, y, 511, 95, `A Beginning in ${report.year}`, report.story);
  paragraph(doc, "Your birth date is one point on the calendar, but your story is shaped by the choices you make, the people you meet, the challenges you navigate and the experiences you continue to collect. This report is designed as a keepsake for reflection.", 42, y + 125, 511, 10);
  card(doc, 42, y + 225, 511, 90, "Generation & Context", `The final AI version can create a customized paragraph from verified year information and selected cultural references. It must not invent personal experiences or present predictions as facts.`);

  // 11. Themes
  y = basePage(doc, 11, "Key Themes for Your Life", "Reflective prompts inspired by the report's symbolic sections");
  const themeText = ["Believe in your ability to learn and contribute while remaining open to feedback.", "Keep exploring, learning and adjusting as you gain new experiences.", "Build relationships through honesty, kindness, listening and mutual respect.", "Use your skills and creativity to contribute to people, projects and communities.", "Make room for ambition, rest, patience and different perspectives.", "Stay curious and continue developing knowledge, practical skills and self-awareness."];
  report.themes.forEach((theme, index) => { const col = index % 2; const row = Math.floor(index / 2); card(doc, 42 + col * 261, y + row * 96, 250, 80, theme, themeText[index]); });
  paragraph(doc, "Reflection prompt: Which theme feels most useful to you right now, and what small action could you take this week?", 42, y + 315, 511, 9);

  // 12. Closing
  y = basePage(doc, 12, "A Final Message", "Your birth date is a beginning—not a limit");
  paragraph(doc, "Your story is still being written.", 42, y + 25, 511, 15);
  paragraph(doc, "A date can connect you to history, symbols and shared human traditions. But your choices, relationships, learning and actions are what give your life its personal meaning.", 42, y + 100, 511, 10);
  paragraph(doc, "May this report encourage curiosity, self-reflection and appreciation for the journey ahead.", 42, y + 165, 511, 10);
  card(doc, 42, y + 270, 511, 90, "BIRTHDATE", "Personal Discovery Report\nA personalized digital keepsake created from your selected birth information.");
  doc.fillColor(GOLD).font("Helvetica-BoldOblique").fontSize(11).text("The stars may inspire reflection, but your choices shape your story.", 42, y + 405, { width: 511, align: "center" });

  doc.end();
  return new Promise((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
}
