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
  return `
    <h3>${escapeHtml(report.name)} — ${escapeHtml(report.formattedDate)}</h3>
    <p><strong>Weekday:</strong> ${escapeHtml(report.weekday)}</p>
    <p><strong>Zodiac:</strong> ${escapeHtml(report.zodiacSign)} (${escapeHtml(report.element)})</p>
    <p><strong>Life path:</strong> ${escapeHtml(report.lifePathNumber)}</p>
    <p><strong>Birthstone:</strong> ${escapeHtml(report.birthstone)} • <strong>Birth flower:</strong> ${escapeHtml(report.birthFlower)}</p>
    <h4>Personality reflection</h4><p>${escapeHtml(report.corePersonality)}</p>
    <h4>Key traits</h4><p>${escapeHtml(report.keyTraits)}</p>
    <h4>Life areas</h4><p>${escapeHtml(report.relationship)}</p>
    <h4>Reflection themes</h4><ul>${(report.themes || []).map(theme => `<li>${escapeHtml(theme)}</li>`).join("")}</ul>
    <small>${escapeHtml(report.note)}</small>
  `;
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : { error: await response.text() };
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
  return data;
}

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  latestReportInput = { name: document.querySelector("#customerName").value.trim(), birthDate: document.querySelector("#birthDate").value };
  reportResult.hidden = false; reportResult.innerHTML = "<p>Generating your detailed preview...</p>"; downloadButton.hidden = true;
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) });
    const data = await readResponse(response); reportResult.innerHTML = reportHtml(data); downloadButton.hidden = false;
  } catch (error) { showMessage(reportResult, `Unable to generate the report. ${error.message}`, true); }
});

downloadButton.addEventListener("click", async () => {
  if (!latestReportInput) return;
  downloadButton.disabled = true; downloadButton.textContent = "Preparing 12-page PDF...";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview.pdf`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(latestReportInput) });
    if (!response.ok) throw new Error(await response.text() || `PDF request failed with status ${response.status}`);
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "birthdate-personal-discovery-report.pdf"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  } catch (error) { showMessage(reportResult, `PDF generation failed: ${error.message}`, true); }
  finally { downloadButton.disabled = false; downloadButton.textContent = "Download 12-page PDF preview"; }
});

compareForm.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = { name: document.querySelector("#firstName").value.trim(), birthDate: document.querySelector("#firstDate").value, secondName: document.querySelector("#secondName").value.trim(), secondBirthDate: document.querySelector("#secondDate").value };
  compareResult.hidden = false; compareResult.innerHTML = "<p>Comparing dates...</p>";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await readResponse(response);
    compareResult.innerHTML = `<h3>Comparison</h3><p><strong>${escapeHtml(data.first.name)}:</strong> ${escapeHtml(data.first.formattedDate)} — ${escapeHtml(data.first.zodiacSign)}</p><p><strong>${escapeHtml(data.second.name)}:</strong> ${escapeHtml(data.second.formattedDate)} — ${escapeHtml(data.second.zodiacSign)}</p><ul>${data.comparison.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul><small>${escapeHtml(data.note || "Reflective comparison only.")}</small>`;
  } catch (error) { showMessage(compareResult, `Comparison failed: ${error.message}`, true); }
});
