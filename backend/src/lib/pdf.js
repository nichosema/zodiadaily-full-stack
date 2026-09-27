import PDFDocument from "pdfkit";

const W = 595;
const H = 842;

const THEMES = {
  classic: { ink: "#1d2940", accent: "#b8944f", paper: "#fbf8f1", soft: "#fffaf0", line: "#ded3bd", muted: "#6b7484", body: "#3d4858" },
  cosmic: { ink: "#171b3a", accent: "#a99bff", paper: "#f7f5ff", soft: "#ffffff", line: "#d8d3f2", muted: "#6e6b82", body: "#3f4055" },
  story: { ink: "#4a2e2e", accent: "#b46b62", paper: "#fff8f3", soft: "#fffdf9", line: "#e7cec4", muted: "#7e6c68", body: "#544643" },
  couples: { ink: "#3d2740", accent: "#a46c92", paper: "#fcf6fa", soft: "#fffafd", line: "#e5cede", muted: "#786b76", body: "#4e4350" },
  family: { ink: "#25443b", accent: "#5e927e", paper: "#f5faf7", soft: "#fbfffd", line: "#cfe1d9", muted: "#667a73", body: "#40524d" },
  gift: { ink: "#4b2938", accent: "#c08363", paper: "#fff7f4", soft: "#fffdfc", line: "#ead5cb", muted: "#7d6b70", body: "#53454b" }
};

const clean = value => String(value ?? "").replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/\s+/g, " ").trim();
const clip = (value, max = 180) => {
  const text = clean(value) || "Not available";
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

function themeFor(report = {}) {
  return THEMES[report.edition] || THEMES.classic;
}

function t(doc, value, x, y, width, opts = {}) {
  doc.save();
  doc.fillColor(opts.color || "#3d4858").font(opts.font || "Helvetica").fontSize(opts.size || 8.5);
  doc.text(clip(value, opts.max || 180), x, y, {
    width,
    align: opts.align || "left",
    lineBreak: false
  });
  doc.restore();
}

function pageStart(doc, report, title = "", subtitle = "") {
  const theme = themeFor(report);
  doc.rect(0, 0, W, H).fill(theme.paper);
  doc.rect(0, 0, W, 34).fill(theme.ink);
  t(doc, "ZODIADAILY • PERSONAL BIRTHDATE REPORT", 42, 14, 511, {
    color: theme.accent, font: "Helvetica-Bold", size: 7, max: 80, align: "center"
  });
  if (title) {
    t(doc, title.toUpperCase(), 42, 68, 511, {
      color: theme.ink, font: "Helvetica-Bold", size: 18, max: 120, align: "center"
    });
    t(doc, subtitle, 42, 96, 511, { color: theme.muted, size: 8.5, max: 180, align: "center" });
    doc.strokeColor(theme.line).lineWidth(0.7).moveTo(42, 116).lineTo(553, 116).stroke();
  }
}

function newPage(doc, report, title, subtitle) {
  doc.addPage({ size: "A4", margin: 0 });
  pageStart(doc, report, title, subtitle);
}

function foot(doc, report, label) {
  const theme = themeFor(report);
  doc.rect(0, 780, W, 42).fill(theme.ink);
  t(doc, `ZodiaDaily • ${label}`, 42, 796, 511, {
    color: "#ffffff", size: 7, max: 100, align: "center"
  });
}

function box(doc, report, x, y, w, h, title, value, size = 8.2) {
  const theme = themeFor(report);
  doc.roundedRect(x, y, w, h, 6).fillAndStroke(theme.soft, theme.line);
  t(doc, title, x + 10, y + 10, w - 20, {
    color: theme.ink, font: "Helvetica-Bold", size: 8.5, max: 90
  });
  t(doc, value, x + 10, y + 29, w - 20, {
    color: theme.body, size, max: h > 80 ? 420 : 170
  });
}

function sectionTitle(doc, report, value, y) {
  const theme = themeFor(report);
  t(doc, value, 42, y, 511, { color: theme.ink, font: "Helvetica-Bold", size: 11, max: 90 });
}

function bullets(doc, report, values, y, limit = 5) {
  (Array.isArray(values) ? values : []).slice(0, limit).forEach((value, i) => {
    const text = typeof value === "string" ? value : `${value?.year || ""}: ${value?.text || ""}`;
    t(doc, `• ${text}`, 42, y + i * 25, 511, { size: 8.2, max: 180 });
  });
}

function editionTitle(edition) {
  return ({
    classic: "Personal Discovery",
    cosmic: "Cosmic Birth Map",
    story: "Birthday Story",
    couples: "Two-Date Connection",
    family: "Family Keepsake",
    gift: "Birthday Gift Edition"
  })[edition] || "Personal Discovery";
}

function cover(doc, report, title = editionTitle(report.edition)) {
  const theme = themeFor(report);
  doc.addPage({ size: "A4", margin: 0 });
  pageStart(doc, report);

  t(doc, "ZodiaDaily", 42, 145, 511, {
    color: theme.ink, font: "Helvetica-Bold", size: 31, max: 30, align: "center"
  });
  t(doc, title.toUpperCase(), 42, 195, 511, {
    color: theme.accent, font: "Helvetica-Bold", size: 15, max: 55, align: "center"
  });

  const sign = clip(report.zodiacSign, 30).toUpperCase();
  const animal = {
    Aries: "RAM", Taurus: "BULL", Gemini: "TWINS", Cancer: "CRAB", Leo: "LION",
    Virgo: "MAIDEN", Libra: "SCALES", Scorpio: "SCORPION", Sagittarius: "ARCHER",
    Capricorn: "SEA-GOAT", Aquarius: "WATER-BEARER", Pisces: "FISH"
  }[report.zodiacSign] || "BIRTH DATE";

  doc.circle(297, 310, 88).fillAndStroke(theme.soft, theme.accent);
  doc.circle(297, 310, 75).lineWidth(1.4).strokeColor(theme.ink).stroke();
  t(doc, "BIRTH SIGN", 220, 258, 154, { color: theme.accent, font: "Helvetica-Bold", size: 8, max: 20, align: "center" });
  t(doc, sign, 225, 287, 144, { color: theme.ink, font: "Helvetica-Bold", size: 18, max: 30, align: "center" });
  t(doc, animal, 235, 325, 124, { color: theme.ink, font: "Helvetica-Bold", size: 9, max: 30, align: "center" });
  t(doc, "SYMBOLIC GUIDE", 225, 354, 144, { color: theme.accent, font: "Helvetica-Bold", size: 8, max: 30, align: "center" });

  const coverName = report.name || (report.members?.[0]?.name) || "Your keepsake";
  t(doc, coverName, 42, 432, 511, { color: theme.ink, font: "Helvetica-Bold", size: 18, max: 70, align: "center" });
  t(doc, String(report.formattedDate || "").toUpperCase(), 42, 462, 511, { color: theme.ink, size: 10.5, max: 60, align: "center" });

  if (report.edition === "gift" && report.giftFrom) {
    t(doc, `Prepared as a birthday gift from ${report.giftFrom}`, 42, 510, 511, { color: theme.muted, size: 9, max: 90, align: "center" });
  } else if (report.edition === "family") {
    t(doc, report.familyName || "A family keepsake", 42, 510, 511, { color: theme.muted, size: 10, max: 90, align: "center" });
  } else {
    t(doc, "YOUR DATE • YOUR SYMBOLS • YOUR STORY", 42, 510, 511, { color: theme.muted, size: 9, max: 70, align: "center" });
  }

  if (report.edition === "gift" && report.giftMessage) {
    box(doc, report, 82, 560, 431, 86, "Gift message", report.giftMessage, 8.5);
  } else {
    box(doc, report, 82, 560, 431, 70, "Edition", title, 8.5);
  }
  foot(doc, report, `${report.edition || "classic"} edition`);
}

function renderSingle(doc, report) {
  const edition = report.edition || "classic";
  cover(doc, report);

  newPage(doc, report, "Your Birthday at a Glance", "The key details connected to your selected birth date");
  box(doc, report, 42, 137, 250, 58, "Name", report.name);
  box(doc, report, 303, 137, 250, 58, "Date of birth", report.formattedDate);
  box(doc, report, 42, 207, 250, 58, "Day of week", report.weekday);
  box(doc, report, 303, 207, 250, 58, "Zodiac sign", report.zodiacSign);
  box(doc, report, 42, 277, 250, 58, "Element", report.element);
  box(doc, report, 303, 277, 250, 58, "Ruling planet", report.rulingPlanet);
  box(doc, report, 42, 347, 250, 58, "Birthstone", report.birthstone);
  box(doc, report, 303, 347, 250, 58, "Birth flower", report.birthFlower);
  box(doc, report, 42, 417, 250, 58, "Life-path number", report.lifePathNumber);
  box(doc, report, 303, 417, 250, 58, "Personal year", report.personalYear);
  box(doc, report, 42, 487, 511, 82, "Calendar context",
    `Day ${report.dayOfYear} of the year • ${report.daysRemaining} days remaining • ${report.leapYear ? "Leap year" : "Common year"}.`);
  t(doc, report.note, 42, 600, 511, { size: 8.5, max: 300 });
  foot(doc, report, "2");

  newPage(doc, report, "Your Personality and Life Areas", "Symbolic interpretations for reflection, not fixed personality measurements");
  box(doc, report, 42, 137, 511, 72, "Core personality", report.corePersonality, 8.8);
  box(doc, report, 42, 223, 250, 70, "Key traits", report.keyTraits);
  box(doc, report, 303, 223, 250, 70, "Strengths", report.strengths);
  box(doc, report, 42, 307, 250, 70, "Potential challenges", report.challenges);
  box(doc, report, 303, 307, 250, 70, "Communication", report.communicationStyle);
  box(doc, report, 42, 391, 250, 70, "Relationships", report.relationship);
  box(doc, report, 303, 391, 250, 70, "Friendship", report.friendship);
  box(doc, report, 42, 475, 250, 70, "Learning", report.learning);
  box(doc, report, 303, 475, 250, 70, "Work and goals", `${report.workCareer || ""} ${report.goals || ""}`);
  box(doc, report, 42, 559, 511, 76, "Personal growth", report.growth, 8.8);
  foot(doc, report, "3");

  newPage(doc, report, "Your Date in History", "Research-based birthday facts when reference information is available");
  box(doc, report, 42, 137, 511, 68, "Research note",
    "Date-linked facts provide historical context. They do not show that people sharing a birthday have the same personality or destiny.");
  sectionTitle(doc, report, "Events connected to your date", 231);
  bullets(doc, report, report.historicalEvents, 258);
  sectionTitle(doc, report, "People born on your date", 410);
  bullets(doc, report, report.famousBirths, 437);
  box(doc, report, 42, 590, 511, 68, "Source approach",
    "Historical entries are contextual research, separate from the symbolic interpretation in this report.");
  foot(doc, report, "4");

  newPage(doc, report, "Numbers, Symbols and Birth-Year Context", "Traditional systems presented as cultural or entertainment material");
  box(doc, report, 42, 137, 250, 62, "Life-path number", report.lifePathNumber);
  box(doc, report, 303, 137, 250, 62, "Birthday number", report.birthdayNumber);
  box(doc, report, 42, 213, 250, 62, "Attitude number", report.attitudeNumber);
  box(doc, report, 303, 213, 250, 62, "Chinese zodiac", report.chineseZodiac);
  box(doc, report, 42, 289, 250, 62, "Generation", report.generation);
  box(doc, report, 303, 289, 250, 62, "Zodiac dates", report.zodiacDates);
  box(doc, report, 42, 365, 511, 82, "Birth-year profile", report.yearProfile);
  box(doc, report, 42, 461, 250, 62, "Lucky colors", report.luckyColors);
  box(doc, report, 303, 461, 250, 62, "Modality", report.modality);
  box(doc, report, 42, 537, 511, 72, "Interpretation boundary",
    "Numbers, zodiac categories and symbolic associations are not scientifically validated measurements or predictions.");
  foot(doc, report, "5");

  newPage(doc, report, edition === "story" ? "Your Birthday Story" : "Your Personal Birthday Story",
    "A reflective keepsake built from your birth date");
  box(doc, report, 42, 137, 511, 92, `A beginning in ${report.year}`, report.story, 9);
  if (report.aiNarrative) box(doc, report, 42, 247, 511, 104, "Your AI-personalized narrative", report.aiNarrative, 8.8);
  if (edition === "cosmic") {
    box(doc, report, 42, 371, 511, 76, "Cosmic lens",
      `${report.zodiacSign || "Your sign"} is traditionally associated with ${report.element || "an element"} and ${report.rulingPlanet || "a ruling planet"}.`);
  } else {
    t(doc, "Your birth date connects you to a day in history, but it does not limit what you can learn, create or become. Use this report as a prompt for curiosity and self-reflection.",
      42, 378, 511, { size: 9, max: 330 });
  }
  sectionTitle(doc, report, "Key themes for reflection", 447);
  (Array.isArray(report.themes) ? report.themes : []).slice(0, 6).forEach((theme, i) =>
    box(doc, report, 42 + (i % 2) * 261, 475 + Math.floor(i / 2) * 70, 250, 56, theme, "Choose one small action for this theme.", 8)
  );
  box(doc, report, 42, 710, 511, 58, "Final message",
    "The stars and symbols may inspire reflection, but your choices, relationships and actions shape your story.");
  foot(doc, report, "6");
}

function renderCouples(doc, comparison) {
  const first = { ...(comparison.first || {}), edition: "couples" };
  const second = { ...(comparison.second || {}), edition: "couples" };
  cover(doc, { ...first, edition: "couples" }, "Two-Date Connection");

  newPage(doc, first, "Person 1", "A complete birth-date profile");
  box(doc, first, 42, 137, 250, 58, "Name", first.name);
  box(doc, first, 303, 137, 250, 58, "Date of birth", first.formattedDate);
  box(doc, first, 42, 207, 250, 58, "Zodiac sign", first.zodiacSign);
  box(doc, first, 303, 207, 250, 58, "Element", first.element);
  box(doc, first, 42, 277, 511, 82, "Personality reflection", first.corePersonality);
  box(doc, first, 42, 375, 250, 70, "Strengths", first.strengths);
  box(doc, first, 303, 375, 250, 70, "Communication", first.communicationStyle);
  box(doc, first, 42, 461, 511, 88, "AI-personalized reflection", first.aiNarrative);
  foot(doc, first, "2");

  newPage(doc, second, "Person 2", "A complete birth-date profile");
  box(doc, second, 42, 137, 250, 58, "Name", second.name);
  box(doc, second, 303, 137, 250, 58, "Date of birth", second.formattedDate);
  box(doc, second, 42, 207, 250, 58, "Zodiac sign", second.zodiacSign);
  box(doc, second, 303, 207, 250, 58, "Element", second.element);
  box(doc, second, 42, 277, 511, 82, "Personality reflection", second.corePersonality);
  box(doc, second, 42, 375, 250, 70, "Strengths", second.strengths);
  box(doc, second, 303, 375, 250, 70, "Communication", second.communicationStyle);
  box(doc, second, 42, 461, 511, 88, "AI-personalized reflection", second.aiNarrative);
  foot(doc, second, "3");

  newPage(doc, first, "Shared Reflection", "A symbolic comparison of the two selected birth dates");
  const rows = Array.isArray(comparison.comparison) ? comparison.comparison : [];
  rows.slice(0, 6).forEach((item, i) => {
    const y = 137 + i * 70;
    box(doc, first, 42, y, 155, 58, item?.label || "Theme", item?.first || "");
    box(doc, first, 220, y, 155, 58, "Shared lens", item?.shared || "See how the two profiles differ and overlap.");
    box(doc, first, 398, y, 155, 58, second.name || "Person 2", item?.second || "");
  });
  foot(doc, first, "4");

  newPage(doc, first, "Connection Themes", "Use the comparison as a conversation starter, not a prediction");
  box(doc, first, 42, 137, 511, 88, "What the profiles can explore",
    "The report brings together symbolic zodiac, numerology and birth-date context so the two people can discuss similarities, differences and personal meaning.");
  box(doc, first, 42, 247, 250, 88, "Person 1", `${first.zodiacSign || ""} • ${first.element || ""} • Life path ${first.lifePathNumber || "—"}`);
  box(doc, first, 303, 247, 250, 88, "Person 2", `${second.zodiacSign || ""} • ${second.element || ""} • Life path ${second.lifePathNumber || "—"}`);
  box(doc, first, 42, 357, 511, 96, "Important boundary",
    "A symbolic compatibility reading cannot determine whether a relationship will succeed. Use it for reflection, questions and conversation.");
  if (first.aiNarrative || second.aiNarrative) box(doc, first, 42, 475, 511, 105, "AI context", clip(`${first.aiNarrative || ""} ${second.aiNarrative || ""}`, 420));
  foot(doc, first, "5");

  newPage(doc, first, "A Shared Birthday Story", "A keepsake ending for the two birth dates");
  box(doc, first, 42, 137, 511, 100, "Two dates, one keepsake",
    `${first.name || "Person 1"} was born on ${first.formattedDate || "their selected date"}, while ${second.name || "Person 2"} was born on ${second.formattedDate || "their selected date"}.`);
  box(doc, first, 42, 257, 511, 100, "Shared reflection", comparison.note || "Explore what each person brings to the conversation.");
  box(doc, first, 42, 377, 511, 100, "Conversation prompt",
    "What part of your profile feels familiar, and what part would you describe differently? Use the answer to start a real conversation.");
  box(doc, first, 42, 497, 511, 86, "Final message",
    "Birth dates can be a fun lens for reflection. They do not define either person or the future of the relationship.");
  foot(doc, first, "6");
}

function renderFamily(doc, report) {
  const members = Array.isArray(report.members) ? report.members : [];
  const lead = { ...(members[0] || {}), edition: "family" };
  cover(doc, { ...lead, edition: "family", familyName: report.familyName }, "Family Keepsake");

  newPage(doc, lead, "Family Overview", "A collection of individual birth-date profiles");
  box(doc, lead, 42, 137, 511, 76, "Family name", report.familyName || "Family keepsake");
  box(doc, lead, 42, 231, 511, 84, "What is inside",
    `${members.length} birth-date profile${members.length === 1 ? "" : "s"} with symbolic zodiac, numerology and historical context.`);
  sectionTitle(doc, lead, "Family members", 345);
  members.slice(0, 6).forEach((member, i) => {
    box(doc, lead, 42 + (i % 2) * 261, 372 + Math.floor(i / 2) * 76, 250, 62,
      member.name || `Member ${i + 1}`, `${member.formattedDate || ""} • ${member.zodiacSign || ""}`);
  });
  foot(doc, lead, "2");

  let pageNo = 3;
  for (let start = 0; start < members.length && pageNo <= 6; start += 2, pageNo++) {
    const pair = members.slice(start, start + 2);
    const base = pair[0] || lead;
    newPage(doc, base, `Family Profiles ${start + 1}–${Math.min(start + 2, members.length)}`, "Individual highlights for the selected family members");
    pair.forEach((member, idx) => {
      const x = idx === 0 ? 42 : 303;
      box(doc, base, x, 137, 250, 58, "Name", member.name);
      box(doc, base, x, 207, 250, 58, "Birth date", member.formattedDate);
      box(doc, base, x, 277, 250, 58, "Zodiac sign", member.zodiacSign);
      box(doc, base, x, 347, 250, 70, "Core personality", member.corePersonality);
      box(doc, base, x, 431, 250, 70, "Life path", member.lifePathNumber);
      box(doc, base, x, 515, 250, 92, "AI reflection", member.aiNarrative);
    });
    foot(doc, base, String(pageNo));
  }

  const closing = { ...lead, edition: "family" };
  newPage(doc, closing, "Family Reflection", "A gentle ending for the keepsake");
  box(doc, closing, 42, 137, 511, 94, "Family lens",
    "Each profile is individual. The value of a family keepsake is in the stories and conversations it helps you share.");
  box(doc, closing, 42, 251, 511, 94, "Conversation prompt",
    "Ask each family member which part of their profile feels meaningful, surprising or simply fun.");
  box(doc, closing, 42, 365, 511, 94, "Important boundary",
    "Zodiac and numerology are symbolic traditions, not scientifically validated ways to measure personality, compatibility or destiny.");
  box(doc, closing, 42, 479, 511, 94, "Final message",
    "Keep the pages as a snapshot of a moment in your family story. People continue to grow and change.");
  foot(doc, closing, "7");
}

function renderGift(doc, report) {
  renderSingle(doc, report);
}

export function createPdf(report, options = {}) {
  const edition = report?.edition || (report?.second ? "couples" : report?.members ? "family" : "classic");
  const normalized = report && edition === "couples" && report.second
    ? { ...report, edition: "couples" }
    : { ...(report || {}), edition };

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: false,
    info: { Title: `ZodiaDaily ${editionTitle(edition)} Report`, Author: "ZodiaDaily" }
  });
  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  if (options.preview) {
    // Preview PDFs remain intentionally limited; the website's free preview is teaser-only.
    const preview = normalized.second ? normalized.first : normalized.members?.[0] || normalized;
    cover(doc, { ...preview, edition: edition === "couples" ? "couples" : edition }, editionTitle(edition));
    newPage(doc, { ...preview, edition }, "Sample Preview", "A short look at the finished ZodiaDaily design");
    box(doc, { ...preview, edition }, 42, 137, 250, 58, "Name", preview.name);
    box(doc, { ...preview, edition }, 303, 137, 250, 58, "Date of birth", preview.formattedDate);
    box(doc, { ...preview, edition }, 42, 207, 250, 58, "Zodiac sign", preview.zodiacSign);
    box(doc, { ...preview, edition }, 303, 207, 250, 58, "Edition", editionTitle(edition));
    box(doc, { ...preview, edition }, 42, 277, 511, 86, "What the full PDF unlocks",
      "More detailed symbolic interpretation, historical context, numerology, AI-personalized narrative and a designed keepsake structure.");
    box(doc, { ...preview, edition }, 42, 381, 511, 76, "Preview boundary",
      "This sample intentionally does not reproduce the complete paid report.");
    foot(doc, { ...preview, edition }, "SAMPLE");
    doc.end();
    return new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });
  }

  if (edition === "couples" && normalized.second) renderCouples(doc, normalized);
  else if (edition === "family" && Array.isArray(normalized.members)) renderFamily(doc, normalized);
  else renderGift(doc, normalized);

  doc.end();
  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
