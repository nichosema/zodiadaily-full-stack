// Public backend URL. Keep this updated if your backend URL changes.
const API_BASE = "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev";

const reportForm = document.querySelector("#report-form");
const compareForm = document.querySelector("#compare-form");
const reportResult = document.querySelector("#report-result");
const compareResult = document.querySelector("#compare-result");
const downloadButton = document.querySelector("#download-pdf");

let latestBirthDate = "";

function showMessage(element, message, isError = false) {
  element.hidden = false;
  element.innerHTML = `<p${isError ? ' class="error-message"' : ""}>${message}</p>`;
}

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

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  latestBirthDate = document.querySelector("#birthDate").value;
  reportResult.hidden = false;
  reportResult.innerHTML = "<p>Generating your preview...</p>";
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
    showMessage(
      reportResult,
      `Unable to connect to the report service. ${error.message}. Check that the backend is running and its Codespaces port is public.`,
      true
    );
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `PDF request failed with status ${response.status}`);
    }

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
      <p><strong>First date:</strong> ${data.first.formattedDate} — ${data.first.zodiacSign}</p>
      <p><strong>Second date:</strong> ${data.second.formattedDate} — ${data.second.zodiacSign}</p>
      <ul>${data.comparison.map(item => `<li>${item}</li>`).join("")}</ul>
    `;
  } catch (error) {
    showMessage(
      compareResult,
      `Comparison failed: ${error.message}. Check that the backend is running and its Codespaces port is public.`,
      true
    );
  }
});
