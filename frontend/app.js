const API_BASE = "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev";
const reportForm = document.querySelector("#report-form");
const compareForm = document.querySelector("#compare-form");
const reportResult = document.querySelector("#report-result");
const compareResult = document.querySelector("#compare-result");
const downloadButton = document.querySelector("#download-pdf");
let latestReportInput = null;

function escapeHtml(value = "") { return String(value).replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[character])); }
function showMessage(element, message, isError = false) { element.hidden = false; element.innerHTML = `<p${isError ? ' class="error-message"' : ""}>${escapeHtml(message)}</p>`; }

function reportHtml(report) {
  const events = (report.historicalEvents || []).slice(0, 3).map(item => `<li><strong>${escapeHtml(item.year)}</strong> — ${escapeHtml(item.text)}</li>`).join("");
  const births = (report.famousBirths || []).slice(0, 4).map(item => `<li><strong>${escapeHtml(item.year)}</strong> — ${escapeHtml(item.text)}</li>`).join("");
  return `<div class="report-hero"><p class="eyebrow">PERSONAL DISCOVERY REPORT</p><h3>${escapeHtml(report.name)} • ${escapeHtml(report.zodiacSign)}</h3><p>${escapeHtml(report.formattedDate)} • ${escapeHtml(report.weekday)}</p></div>
  <div class="report-grid">
    <article><h4>Birthday at a glance</h4><p><b>Element:</b> ${escapeHtml(report.element)}</p><p><b>Modality:</b> ${escapeHtml(report.modality)}</p><p><b>Ruling planet:</b> ${escapeHtml(report.rulingPlanet)}</p><p><b>Birthstone:</b> ${escapeHtml(report.birthstone)}</p><p><b>Birth flower:</b> ${escapeHtml(report.birthFlower)}</p></article>
    <article><h4>Your numbers</h4><p><b>Life Path:</b> ${escapeHtml(report.lifePathNumber)}</p><p><b>Birthday:</b> ${escapeHtml(report.birthdayNumber)}</p><p><b>Attitude:</b> ${escapeHtml(report.attitudeNumber)}</p><p><b>Personal Year:</b> ${escapeHtml(report.personalYear)}</p></article>
    <article><h4>Personality</h4><p>${escapeHtml(report.corePersonality)}</p><p><b>Traits:</b> ${escapeHtml(report.keyTraits)}</p></article>
    <article><h4>Life areas</h4><p><b>Relationships:</b> ${escapeHtml(report.relationship)}</p><p><b>Learning:</b> ${escapeHtml(report.learning)}</p></article>
    <article><h4>Birth-year profile</h4><p><b>${escapeHtml(report.year)}</b> • ${escapeHtml(report.generation)}</p><p>${escapeHtml(report.yearProfile)}</p></article>
    <article><h4>Personal birthday story</h4><p>${escapeHtml(report.story)}</p></article>
  </div>
  ${events ? `<section><h4>Your date in history</h4><ul>${events}</ul></section>` : ""}
  ${births ? `<section><h4>People born on your date</h4><ul>${births}</ul></section>` : ""}
  <p class="report-note">${escapeHtml(report.note)}</p>
  <p><strong>Your full PDF:</strong> 12 designed pages covering the cover profile, birthday facts, personality, life areas, history, famous birthdays, numerology, birth symbols, birth-year context, personal story, key themes and a final message.</p>`;
}

async function readResponse(response) { const contentType = response.headers.get("content-type") || ""; const data = contentType.includes("application/json") ? await response.json() : { error: await response.text() }; if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`); return data; }

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  latestReportInput = { name: document.querySelector("#customerName").value.trim(), birthDate: document.querySelector("#birthDate").value, selectedYear: new Date().getFullYear() };
  reportResult.hidden = false; reportResult.innerHTML = "<p>Building your personalized report…</p>"; downloadButton.hidden = true;
  try { const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) }); const data = await readResponse(response); reportResult.innerHTML = reportHtml(data); downloadButton.hidden = false; }
  catch (error) { showMessage(reportResult, `Unable to generate the report. ${error.message}`, true); }
});

downloadButton.addEventListener("click", async () => {
  if (!latestReportInput) return;
  downloadButton.disabled = true; downloadButton.textContent = "Preparing 12-page PDF...";
  try { const response = await fetch(`${API_BASE}/api/reports/preview.pdf`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) }); if (!response.ok) throw new Error(await response.text() || `PDF request failed with status ${response.status}`); const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${latestReportInput.name || "birthdate"}-personal-discovery-report.pdf`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
  catch (error) { showMessage(reportResult, `PDF generation failed: ${error.message}`, true); }
  finally { downloadButton.disabled = false; downloadButton.textContent = "Download full 12-page PDF"; }
});

compareForm.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = { name: document.querySelector("#firstName").value.trim(), birthDate: document.querySelector("#firstDate").value, secondName: document.querySelector("#secondName").value.trim(), secondBirthDate: document.querySelector("#secondDate").value, selectedYear: new Date().getFullYear() };
  compareResult.hidden = false; compareResult.innerHTML = "<p>Comparing dates...</p>";
  try { const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await readResponse(response); compareResult.innerHTML = `<h3>${escapeHtml(data.first.name)} & ${escapeHtml(data.second.name)}</h3><div class="report-grid"><article><h4>${escapeHtml(data.first.formattedDate)}</h4><p>${escapeHtml(data.first.zodiacSign)} • Life Path ${escapeHtml(data.first.lifePathNumber)}</p></article><article><h4>${escapeHtml(data.second.formattedDate)}</h4><p>${escapeHtml(data.second.zodiacSign)} • Life Path ${escapeHtml(data.second.lifePathNumber)}</p></article></div><ul>${data.comparison.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul><small>${escapeHtml(data.note || "Reflective comparison only.")}</small>`; }
  catch (error) { showMessage(compareResult, `Comparison failed: ${error.message}`, true); }
});
