const API_BASE = String(window.ZODIADAILY_API_BASE || "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev").replace(/\/$/, "");

const EDITIONS = {
  classic: { title: "Classic Personal Discovery", description: "A balanced personal report for discovery and reflection." },
  cosmic: { title: "Cosmic Edition", description: "A celestial-inspired symbolic keepsake." },
  story: { title: "Birthday Story Edition", description: "A narrative-focused birthday keepsake." },
  couples: { title: "Couples / Two Birth Dates", description: "Two profiles with shared reflections." },
  family: { title: "Family Edition", description: "A keepsake containing several profiles." },
  gift: { title: "Birthday Gift Edition", description: "A keepsake with a dedication and gift message." }
};

const $ = selector => document.querySelector(selector);
const reportForm = $("#report-form");
const reportResult = $("#report-result");
const selectedEditionInput = $("#selectedEdition");
const editionDescription = $("#edition-description");
const secondPersonFields = $("#second-person-fields");
const familyFields = $("#family-fields");
const familyProfileFields = $("#family-profile-fields");
const giftFields = $("#gift-fields");
let selectedEdition = "classic";
let latestReportInput = null;

const zodiacSymbols = { Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓" };
const zodiacMotifs = { Aries: "RAM", Taurus: "BULL", Gemini: "TWINS", Cancer: "CRAB", Leo: "LION", Virgo: "MAIDEN", Libra: "SCALES", Scorpio: "SCORPION", Sagittarius: "ARCHER", Capricorn: "SEA-GOAT", Aquarius: "WATER-BEARER", Pisces: "FISH" };
const zodiacElements = { Aries: "FIRE", Taurus: "EARTH", Gemini: "AIR", Cancer: "WATER", Leo: "FIRE", Virgo: "EARTH", Libra: "AIR", Scorpio: "WATER", Sagittarius: "FIRE", Capricorn: "EARTH", Aquarius: "AIR", Pisces: "WATER" };
const safe = value => { const text = String(value ?? "").trim(); return text ? text : "Not available"; };
function escapeHtml(value = "") { return String(value).replace(/[&<>\"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[c])); }
function zodiacImage(report) {
  const sign = report.zodiacSign || "Zodiac";
  const symbol = zodiacSymbols[sign] || "✦";
  const motif = zodiacMotifs[sign] || "CELESTIAL";
  const element = zodiacElements[sign] || "STARS";
  const label = escapeHtml(sign);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260"><defs><radialGradient id="g"><stop stop-color="#fff8dc"/><stop offset="1" stop-color="#e5c987"/></radialGradient></defs><rect width="260" height="260" rx="34" fill="#10233f"/><circle cx="130" cy="130" r="108" fill="url(#g)" stroke="#c9a75a" stroke-width="4"/><circle cx="130" cy="130" r="91" fill="none" stroke="#10233f" stroke-dasharray="3 10" stroke-width="2"/><path d="M130 25 L136 39 L151 40 L140 50 L143 65 L130 57 L117 65 L120 50 L109 40 L124 39 Z" fill="#10233f" opacity=".8"/><text x="130" y="126" text-anchor="middle" font-size="62" fill="#10233f">${symbol}</text><text x="130" y="157" text-anchor="middle" font-family="Arial" font-size="13" font-weight="bold" letter-spacing="1" fill="#10233f">${label.toUpperCase()}</text><text x="130" y="179" text-anchor="middle" font-family="Arial" font-size="9" letter-spacing="1.4" fill="#10233f">${motif}</text><text x="130" y="198" text-anchor="middle" font-family="Arial" font-size="8" letter-spacing="2" fill="#10233f">${element}</text><circle cx="38" cy="50" r="3" fill="#fff8dc"/><circle cx="220" cy="72" r="3" fill="#fff8dc"/><circle cx="45" cy="205" r="2" fill="#fff8dc"/><circle cx="215" cy="214" r="2" fill="#fff8dc"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
function showMessage(element, message, isError = false) { element.hidden = false; element.innerHTML = `<p${isError ? ' class="error-message"' : ""}>${escapeHtml(message)}</p>`; }
function setDateLimits() {
  const today = new Date().toISOString().slice(0,10);
  ["#birthDate","#coupleSecondBirthDate","#firstDate","#secondDate"].forEach(sel => { const el = $(sel); if (el) el.max = today; });
}
function validateBuilderInput(input) {
  if (!input.name || !input.birthDate) throw new Error("Enter the main person's name and birth date.");
  if (selectedEdition === "couples" && (!input.secondName || !input.secondBirthDate)) throw new Error("Complete the second person's name and birth date.");
  if (selectedEdition === "family") {
    const requested = Math.max(2, Number(input.familyMembers || 4));
    if (input.familyProfiles.length !== requested - 1) throw new Error(`Please complete all ${requested - 1} additional family member profiles.`);
  }
}
function listHtml(items = []) { if (!items.length) return '<p class="muted">No verified reference entries were returned for this date.</p>'; return `<ul>${items.map(item => `<li>${escapeHtml(typeof item === "string" ? item : `${item.year}: ${item.text}`)}</li>`).join("")}</ul>`; }
function narrativeHtml(report) { if (!report.aiNarrative) return ""; return `<section class="ai-narrative"><h3>Your AI-Personalized Birthday Narrative</h3>${String(report.aiNarrative).split(/\n+/).filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join("")}</section>`; }
function extraHtml(report) { const gift = report.giftMessage ? `<section class="gift-message"><h3>A Birthday Message for You</h3><p>${escapeHtml(report.giftMessage)}</p><p><strong>From:</strong> ${escapeHtml(report.giftFrom || "Someone special")}</p></section>` : ""; const dedication = report.edition === "gift" ? `<section class="dedication-card"><h3>A Personal Dedication</h3><p>This keepsake was prepared especially for <strong>${escapeHtml(report.name)}</strong>.</p></section>` : ""; return `${dedication}${gift}${narrativeHtml(report)}`; }

function reportHtml(report) {
  const editionTitle = EDITIONS[report.edition || selectedEdition]?.title || "Personalized Birth-Date Report";
  const name = escapeHtml(safe(report.name));
  const date = escapeHtml(safe(report.formattedDate));
  const sign = safe(report.zodiacSign);
  const symbol = zodiacSymbols[sign] || "✦";
  const element = safe(report.element);
  const modality = safe(report.modality);
  const planet = safe(report.rulingPlanet);
  const stone = safe(report.birthstone);
  const lifePath = safe(report.lifePathNumber);
  const previewInsight = report.corePersonality
    ? String(report.corePersonality).replace(/ This is reflective content, not a fixed description of a person\./, "")
    : "A symbolic birth-date reflection has been prepared for you.";
  return `<article class="report-preview teaser-preview edition-${escapeHtml(report.edition || selectedEdition)}">
    <div class="report-cover-mini premium-cover">
      <div class="cover-stars">✦ &nbsp; ✧ &nbsp; ☾ &nbsp; ✦</div>
      <div class="edition-label">${escapeHtml(editionTitle)}</div>
      <p class="eyebrow">YOUR PERSONALIZED PREVIEW</p>
      <div class="preview-zodiac-orb"><span>${symbol}</span></div>
      <span class="ai-badge">✦ AI-PERSONALIZED</span>
      <h3>${name}</h3>
      <p>${date}</p>
      <p class="cover-sign">${escapeHtml(sign)} <span>•</span> ${escapeHtml(element)}</p>
    </div>

    <section class="preview-teaser">
      <div class="preview-ready-row"><div><span class="section-kicker">YOUR BIRTH-DATE SNAPSHOT</span><h3>Here's your first glimpse ✨</h3></div><span class="preview-count">PREVIEW</span></div>
      <div class="snapshot-grid">
        <div><span>♈</span><small>Zodiac</small><strong>${escapeHtml(sign)}</strong></div>
        <div><span>◈</span><small>Element</small><strong>${escapeHtml(element)}</strong></div>
        <div><span>◌</span><small>Modality</small><strong>${escapeHtml(modality)}</strong></div>
        <div><span>☼</span><small>Ruling planet</small><strong>${escapeHtml(planet)}</strong></div>
        <div><span>◇</span><small>Birthstone</small><strong>${escapeHtml(stone)}</strong></div>
        <div><span>№</span><small>Life-path</small><strong>${escapeHtml(lifePath)}</strong></div>
      </div>

      <div class="preview-insight">
        <span class="insight-label">A SYMBOLIC FIRST IMPRESSION</span>
        <p>${escapeHtml(previewInsight)}</p>
      </div>

      <div class="locked-preview-header"><span>✦</span><div><strong>Your complete edition goes deeper</strong><small>These sections are prepared for the full report.</small></div></div>
      <div class="locked-preview-grid">
        <div><strong>✦ Personal profile</strong><span>Deeper themes, strengths, growth and communication</span><b>🔒</b></div>
        <div><strong>☾ AI-written reflection</strong><span>A longer narrative shaped around your birth date</span><b>🔒</b></div>
        <div><strong>▤ Birthday history</strong><span>Historical events and notable birthday context</span><b>🔒</b></div>
        <div><strong>📖 Full keepsake PDF</strong><span>All sections arranged in your designed edition</span><b>🔒</b></div>
      </div>
      <p class="preview-boundary"><strong>You're seeing the preview.</strong> The full report keeps the deeper interpretation and research inside the paid edition.</p>
      <p class="muted disclaimer">${escapeHtml(safe(report.note))}</p>
    </section>
  </article>`;
}
function couplesHtml(data) {
  const editionTitle = "Couples / Two Birth Dates";
  return `<article class="report-preview teaser-preview edition-couples">
    <div class="report-cover-mini">
      <div class="edition-label">${editionTitle}</div>
      <p class="eyebrow">YOUR PERSONALIZED PREVIEW</p>
      <h3>Two personalized profiles</h3>
      <p>${escapeHtml(safe(data.first?.formattedDate))} • ${escapeHtml(safe(data.second?.formattedDate))}</p>
    </div>
    <section class="preview-teaser">
      <h3>Your couples edition is ready ✨</h3>
      <p>The full report contains both personalized profiles plus a shared reflection.</p>
      <ul><li>Two birth-date profiles</li><li>Shared reflection</li><li>AI-written personalized content</li><li>Historical and birthday context</li></ul>
      <p class="muted disclaimer">Unlock the complete edition to read the full content.</p>
    </section>
  </article>`;
}
function familyHtml(data) {
  return `<article class="report-preview teaser-preview edition-family">
    <div class="report-cover-mini">
      <div class="edition-label">Family Edition</div>
      <p class="eyebrow">YOUR PERSONALIZED PREVIEW</p>
      <h3>${escapeHtml(safe(data.familyName))}</h3>
      <p>${escapeHtml(String((data.members || []).length))} personalized profiles prepared</p>
    </div>
    <section class="preview-teaser">
      <h3>Your family edition is ready ✨</h3>
      <p>The full report contains personalized profiles for your selected family members and family-focused reflections.</p>
      <ul><li>Individual family profiles</li><li>Family-focused reflections</li><li>AI-written personalized content</li><li>Birthday and historical context</li></ul>
      <p class="muted disclaimer">Unlock the complete edition to read the full content.</p>
    </section>
  </article>`;
}
function updateFamilyFields() { const count = Math.max(2, Math.min(8, Number($("#familyMembers").value || 4))); familyProfileFields.innerHTML = Array.from({ length: count - 1 }, (_, i) => `<div class="conditional-fields"><strong>Additional Family Member ${i + 2}</strong><label for="familyName${i}">Name</label><input id="familyName${i}" type="text" maxlength="80"><label for="familyDate${i}">Birth date</label><input id="familyDate${i}" type="date"></div>`).join(""); }
function readFamilyProfiles() { return Array.from(familyProfileFields.querySelectorAll(".conditional-fields")).map((_, i) => ({ name: $(`#familyName${i}`).value.trim(), birthDate: $(`#familyDate${i}`).value })).filter(m => m.name && m.birthDate); }
function updateEditionForm() {
  selectedEditionInput.value = selectedEdition;
  if (reportForm) reportForm.dataset.edition = selectedEdition;
  editionDescription.textContent = EDITIONS[selectedEdition].description;
  document.querySelectorAll(".edition-card").forEach(card => card.classList.toggle("selected", card.dataset.edition === selectedEdition));
  secondPersonFields.hidden = selectedEdition !== "couples";
  familyFields.hidden = selectedEdition !== "family";
  giftFields.hidden = selectedEdition !== "gift";
  $("#coupleSecondName").required = selectedEdition === "couples";
  $("#coupleSecondBirthDate").required = selectedEdition === "couples";

  const mainNameLabel = document.querySelector('label[for="customerName"]');
  const mainDateLabel = document.querySelector('label[for="birthDate"]');
  const secondNameLabel = document.querySelector('label[for="coupleSecondName"]');
  const secondDateLabel = document.querySelector('label[for="coupleSecondBirthDate"]');
  if (selectedEdition === "couples") {
    if (mainNameLabel) mainNameLabel.textContent = "Person 1's name";
    if (mainDateLabel) mainDateLabel.textContent = "Person 1's birth date";
    if (secondNameLabel) secondNameLabel.textContent = "Person 2's name";
    if (secondDateLabel) secondDateLabel.textContent = "Person 2's birth date";
  } else {
    if (mainNameLabel) mainNameLabel.textContent = "Main person's name";
    if (mainDateLabel) mainDateLabel.textContent = "Main person's birth date";
    if (secondNameLabel) secondNameLabel.textContent = "Second person's name";
    if (secondDateLabel) secondDateLabel.textContent = "Second person's birth date";
  }

  if (selectedEdition === "family" && !familyProfileFields.children.length) updateFamilyFields();
}
document.querySelectorAll(".edition-card").forEach(card => card.addEventListener("click", () => { selectedEdition = card.dataset.edition; updateEditionForm(); }));
document.querySelectorAll(".journey-card").forEach(card => card.addEventListener("click", () => {
  selectedEdition = card.dataset.journey;
  updateEditionForm();
  document.querySelector("#builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
}));
$("#familyMembers").addEventListener("change", updateFamilyFields);
async function readResponse(response) { const type = response.headers.get("content-type") || ""; const data = type.includes("application/json") ? await response.json() : { error: await response.text() }; if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`); return data; }
reportForm.addEventListener("submit", async event => { event.preventDefault(); latestReportInput = { name: $("#customerName").value.trim(), birthDate: $("#birthDate").value, edition: selectedEdition, secondName: $("#coupleSecondName").value.trim(), secondBirthDate: $("#coupleSecondBirthDate").value, familyName: $("#familyName").value.trim(), familyMembers: Number($("#familyMembers").value), familyProfiles: readFamilyProfiles(), giftFrom: $("#giftFrom").value.trim(), giftMessage: $("#giftMessage").value.trim() };
  // A new preview must never inherit an older paid session.
  if (typeof resetPurchaseState === "function") resetPurchaseState();
  try { validateBuilderInput(latestReportInput); } catch (error) { showMessage(reportResult, error.message, true); return; }
  reportResult.hidden = false; reportResult.innerHTML = `<p>Preparing your personalized preview...</p>`; try { const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) }); const data = await readResponse(response); reportResult.innerHTML = selectedEdition === "couples" && data.first ? couplesHtml(data) : selectedEdition === "family" && data.members ? familyHtml(data) : reportHtml(data); const panel = document.querySelector("#payment-panel"); if (panel) panel.hidden = false; } catch (error) { showMessage(reportResult, `Unable to generate the report. ${error.message}`, true); } });
updateEditionForm();

const clearButton = $("#clear-form");
if (clearButton) clearButton.addEventListener("click", () => {
  reportForm.reset();
  selectedEdition = "classic";
  updateEditionForm();
  reportResult.hidden = true;
  const paymentPanel = document.querySelector("#payment-panel"); if (paymentPanel) paymentPanel.hidden = true;
  latestReportInput = null;
  if (typeof resetPurchaseState === "function") resetPurchaseState();
  setDateLimits();
});
setDateLimits();
