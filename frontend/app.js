// Replace this with your public Codespaces backend URL.
const API_BASE = "http://localhost:4000";

const reportForm = document.querySelector("#report-form");
const compareForm = document.querySelector("#compare-form");
const reportResult = document.querySelector("#report-result");
const compareResult = document.querySelector("#compare-result");
const downloadButton = document.querySelector("#download-pdf");

let latestBirthDate = "";

function reportHtml(report) {
  return `
    <h3>${report.formattedDate}</h3>
    <p><strong>Weekday:</strong> ${report.weekday}</p>
    <p><strong>Zodiac sign:</strong> ${report.zodiacSign}</p>
    <p><strong>Life-path number:</strong> ${report.lifePathNumber}</p>
    <h4>Reflection themes</h4>
    <ul>${report.themes.map(theme => `<li>${theme}</li>`).join("")}</ul>
    <small>${report.note}</small>
  `;
}

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  latestBirthDate = document.querySelector("#birthDate").value;

  const response = await fetch(`${API_BASE}/api/reports/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ birthDate: latestBirthDate })
  });

  const data = await response.json();
  reportResult.hidden = false;
  reportResult.innerHTML = data.error ? `<p>${data.error}</p>` : reportHtml(data);
  downloadButton.hidden = Boolean(data.error);
});

downloadButton.addEventListener("click", async () => {
  const response = await fetch(`${API_BASE}/api/reports/preview.pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ birthDate: latestBirthDate })
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "zodiadaily-report.pdf";
  link.click();
  URL.revokeObjectURL(url);
});

compareForm.addEventListener("submit", async event => {
  event.preventDefault();

  const firstDate = document.querySelector("#firstDate").value;
  const secondDate = document.querySelector("#secondDate").value;

  const response = await fetch(`${API_BASE}/api/reports/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ birthDate: firstDate, secondBirthDate: secondDate })
  });

  const data = await response.json();
  compareResult.hidden = false;

  if (data.error) {
    compareResult.innerHTML = `<p>${data.error}</p>`;
    return;
  }

  compareResult.innerHTML = `
    <h3>Comparison</h3>
    <p><strong>First date:</strong> ${data.first.formattedDate} — ${data.first.zodiacSign}</p>
    <p><strong>Second date:</strong> ${data.second.formattedDate} — ${data.second.zodiacSign}</p>
    <ul>${data.comparison.map(item => `<li>${item}</li>`).join("")}</ul>
  `;
});
