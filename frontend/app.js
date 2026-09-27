const API_BASE = "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev";

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
const compareForm = $("#compare-form");
const reportResult = $("#report-result");
const compareResult = $("#compare-result");
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

function reportHtml(report, heading = "") {
  const editionTitle = EDITIONS[report.edition || selectedEdition]?.title || "Personalized Birth-Date Report";
  const name = escapeHtml(safe(report.name));
  const date = escapeHtml(safe(report.formattedDate));
  return `<article class="report-preview teaser-preview edition-${escapeHtml(report.edition || selectedEdition)}">
    <div class="report-cover-mini">
      <div class="edition-label">${escapeHtml(editionTitle)}</div>
      <p class="eyebrow">YOUR PERSONALIZED PREVIEW</p>
      <h3>${name}</h3>
      <p>${date}</p>
    </div>
    <section class="preview-teaser">
      <h3>Your personalized report is ready ✨</h3>
      <p>We've prepared a personalized ZodiaDaily edition around this birth date.</p>
      <p><strong>Unlock the full report</strong> to see the complete birth-date interpretation, personalized reflection, research context and edition-specific content.</p>
      <ul>
        <li>Personalized birth-date insights</li>
        <li>AI-written reflection</li>
        <li>Historical and birthday context</li>
        <li>Additional content based on your selected edition</li>
      </ul>
      <p class="muted disclaimer">${escapeHtml(safe(report.note))}</p>
    </section>
  </article>`;
}
function couplesHtml(data) { return `<article class="report-preview edition-couples"><div class="report-cover-mini"><div class="edition-label">Couples / Two Birth Dates</div><h3>Two Personal Profiles</h3><p>${escapeHtml(safe(data.first.formattedDate))} and ${escapeHtml(safe(data.second.formattedDate))}</p></div>${reportHtml(data.first, "First Profile")}${reportHtml(data.second, "Second Profile")}<section class="ai-narrative"><h3>Shared Comparison</h3><ul>${(data.comparison || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section></article>`; }
function familyHtml(data) { return `<article class="report-preview edition-family"><div class="report-cover-mini"><div class="edition-label">Family Edition</div><h3>${escapeHtml(safe(data.familyName))}</h3><p>${escapeHtml(String((data.members || []).length))} individual profiles</p></div>${(data.members || []).map((member, i) => reportHtml(member, `Family Profile ${i + 1}`)).join("")}<p class="muted disclaimer">${escapeHtml(safe(data.note))}</p></article>`; }
function updateFamilyFields() { const count = Math.max(2, Math.min(8, Number($("#familyMembers").value || 4))); familyProfileFields.innerHTML = Array.from({ length: count - 1 }, (_, i) => `<div class="conditional-fields"><strong>Additional Family Member ${i + 2}</strong><label for="familyName${i}">Name</label><input id="familyName${i}" type="text" maxlength="80"><label for="familyDate${i}">Birth date</label><input id="familyDate${i}" type="date"></div>`).join(""); }
function readFamilyProfiles() { return Array.from(familyProfileFields.querySelectorAll(".conditional-fields")).map((_, i) => ({ name: $(`#familyName${i}`).value.trim(), birthDate: $(`#familyDate${i}`).value })).filter(m => m.name && m.birthDate); }
function updateEditionForm() { selectedEditionInput.value = selectedEdition; editionDescription.textContent = EDITIONS[selectedEdition].description; document.querySelectorAll(".edition-card").forEach(card => card.classList.toggle("selected", card.dataset.edition === selectedEdition)); secondPersonFields.hidden = selectedEdition !== "couples"; familyFields.hidden = selectedEdition !== "family"; giftFields.hidden = selectedEdition !== "gift"; $("#coupleSecondName").required = selectedEdition === "couples"; $("#coupleSecondBirthDate").required = selectedEdition === "couples"; if (selectedEdition === "family" && !familyProfileFields.children.length) updateFamilyFields(); }
document.querySelectorAll(".edition-card").forEach(card => card.addEventListener("click", () => { selectedEdition = card.dataset.edition; updateEditionForm(); }));
$("#familyMembers").addEventListener("change", updateFamilyFields);
async function readResponse(response) { const type = response.headers.get("content-type") || ""; const data = type.includes("application/json") ? await response.json() : { error: await response.text() }; if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`); return data; }
reportForm.addEventListener("submit", async event => { event.preventDefault(); latestReportInput = { name: $("#customerName").value.trim(), birthDate: $("#birthDate").value, edition: selectedEdition, secondName: $("#coupleSecondName").value.trim(), secondBirthDate: $("#coupleSecondBirthDate").value, familyName: $("#familyName").value.trim(), familyMembers: Number($("#familyMembers").value), familyProfiles: readFamilyProfiles(), giftFrom: $("#giftFrom").value.trim(), giftMessage: $("#giftMessage").value.trim() };
  try { validateBuilderInput(latestReportInput); } catch (error) { showMessage(reportResult, error.message, true); return; }
  reportResult.hidden = false; reportResult.innerHTML = `<p>Preparing your personalized preview...</p>`; try { const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) }); const data = await readResponse(response); reportResult.innerHTML = selectedEdition === "couples" && data.first ? couplesHtml(data) : selectedEdition === "family" && data.members ? familyHtml(data) : reportHtml(data); const panel = document.querySelector("#payment-panel"); if (panel) panel.hidden = false; } catch (error) { showMessage(reportResult, `Unable to generate the report. ${error.message}`, true); } });
compareForm.addEventListener("submit", async event => { event.preventDefault(); const payload = { name: $("#firstName").value.trim(), birthDate: $("#firstDate").value, secondName: $("#secondName").value.trim(), secondBirthDate: $("#secondDate").value, edition: "couples" }; compareResult.hidden = false; compareResult.innerHTML = "<p>Comparing dates...</p>"; try { const data = await readResponse(await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })); compareResult.innerHTML = couplesHtml(data); } catch (error) { showMessage(compareResult, `Comparison failed: ${error.message}`, true); } });
updateEditionForm();

const clearButton = $("#clear-form");
if (clearButton) clearButton.addEventListener("click", () => {
  reportForm.reset();
  selectedEdition = "classic";
  updateEditionForm();
  reportResult.hidden = true;
  paymentPanel.hidden = true;
  latestReportInput = null;
  setDateLimits();
});
setDateLimits();
