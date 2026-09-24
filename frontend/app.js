// Public backend URL. Keep this updated if your backend URL changes.
const API_BASE = "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev";

const reportForm = document.querySelector("#report-form");
const compareForm = document.querySelector("#compare-form");
const reportResult = document.querySelector("#report-result");
const compareResult = document.querySelector("#compare-result");
const downloadButton = document.querySelector("#download-pdf");

let latestBirthDate = "";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[character]));
}

function showMessage(element, message, isError = false) {
  element.hidden = false;
  element.innerHTML = `<p${isError ? ' class="error-message"' : ""}>${escapeHtml(message)}</p>`;
}

function reportHtml(report) {
  const sections = (report.sections || []).map(section => `
    <section class="report-section">
      <h4>${escapeHtml(section.title)}</h4>
      <p>${escapeHtml(section.text)}</p>
    </section>
  `).join("");
  const themes = (report.themes || []).map(theme => `<li>${escapeHtml(theme)}</li>`).join("");
  return `
    <h3>${escapeHtml(report.headline || report.formattedDate)}</h3>
    <p><strong>Birth date:</strong> ${escapeHtml(report.formattedDate)}</p>
    <p><strong>Weekday:</strong> ${escapeHtml(report.weekday)}</p>
    <p><strong>Zodiac sign:</strong> ${escapeHtml(report.zodiacSign)}</p>
    <p><strong>Element:</strong> ${escapeHtml(report.element || "Not available")}</p>
    <p><strong>Life-path number:</strong> ${escapeHtml(report.lifePathNumber)}</p>
    ${sections}
    <h4>Reflection themes</h4>
    <ul>${themes}</ul>
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
  latestBirthDate = document.querySelector("#birthDate").value;
  reportResult.hidden = false;
  reportResult.innerHTML = "<p>Generating your personalized preview...</p>";
  downloadButton.hidden = true;

  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate: latestBirthDate })
    });
    const data = await readResponse(response);
    reportResult.innerHTML = reportHtml(data);
    downloadButton.hidden = false;
  } catch (error) {
    showMessage(reportResult, `Unable to generate the report. ${error.message}`, true);
  }
});

downloadButton.addEventListener("click", async () => {
  if (!latestBirthDate) return;
  downloadButton.disabled = true;
  downloadButton.textContent = "Preparing PDF...";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview.pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate: latestBirthDate })
    });
    if (!response.ok) throw new Error(await response.text() || `PDF request failed with status ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zodiadaily-report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    showMessage(reportResult, `PDF download failed: ${error.message}`, true);
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = "Download PDF preview";
  }
});

compareForm.addEventListener("submit", async event => {
  event.preventDefault();
  const firstDate = document.querySelector("#firstDate").value;
  const secondDate = document.querySelector("#secondDate").value;
  compareResult.hidden = false;
  compareResult.innerHTML = "<p>Comparing dates...</p>";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthDate: firstDate, secondBirthDate: secondDate })
    });
    const data = await readResponse(response);
    compareResult.innerHTML = `
      <h3>Comparison</h3>
      <p><strong>First date:</strong> ${escapeHtml(data.first.formattedDate)} — ${escapeHtml(data.first.zodiacSign)}</p>
      <p><strong>Second date:</strong> ${escapeHtml(data.second.formattedDate)} — ${escapeHtml(data.second.zodiacSign)}</p>
      <ul>${data.comparison.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <small>${escapeHtml(data.note || "Reflective comparison only.")}</small>
    `;
  } catch (error) {
    showMessage(compareResult, `Comparison failed: ${error.message}`, true);
  }
});
