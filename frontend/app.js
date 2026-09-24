const API_BASE = "https://upgraded-waddle-r4pvj55pj67gh946-4000.app.github.dev";

const EDITIONS = {
  classic: {
    title: "Classic Personal Discovery",
    description: "A balanced personal report for discovery, reflection and birthday context."
  },
  cosmic: {
    title: "Cosmic Edition",
    description: "A celestial-inspired report with symbolic themes and imaginative presentation."
  },
  story: {
    title: "Birthday Story Edition",
    description: "A narrative-focused keepsake built around the meaning and context of a birthday."
  },
  couples: {
    title: "Couples / Two Birth Dates",
    description: "A two-person report with individual profiles and shared reflections."
  },
  family: {
    title: "Family Edition",
    description: "A family keepsake that will support several individual birthday profiles."
  },
  gift: {
    title: "Birthday Gift Edition",
    description: "A polished birthday keepsake with a dedication and gift message."
  }
};

const reportForm = document.querySelector("#report-form");
const compareForm = document.querySelector("#compare-form");
const reportResult = document.querySelector("#report-result");
const compareResult = document.querySelector("#compare-result");
const downloadButton = document.querySelector("#download-pdf");
const selectedEditionInput = document.querySelector("#selectedEdition");
const editionDescription = document.querySelector("#edition-description");
const secondPersonFields = document.querySelector("#second-person-fields");
const familyFields = document.querySelector("#family-fields");
const giftFields = document.querySelector("#gift-fields");
let selectedEdition = "classic";
let latestReportInput = null;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[character]));
}

function showMessage(element, message, isError = false) {
  element.hidden = false;
  element.innerHTML = `<p${isError ? ' class="error-message"' : ""}>${escapeHtml(message)}</p>`;
}

function listHtml(items = []) {
  if (!items.length) return "<p class=\"muted\">No verified reference entries were returned for this date.</p>";
  return `<ul>${items.map(item => `<li>${escapeHtml(typeof item === "string" ? item : `${item.year}: ${item.text}`)}</li>`).join("")}</ul>`;
}

function reportHtml(report) {
  const editionTitle = EDITIONS[report.edition]?.title || EDITIONS[selectedEdition].title;
  return `
    <article class="report-preview edition-${escapeHtml(report.edition || selectedEdition)}">
      <div class="report-cover-mini">
        <div class="edition-label">${escapeHtml(editionTitle)}</div>
        <div class="zodiac-badge"><strong>${escapeHtml(report.zodiacSign.slice(0, 2).toUpperCase())}</strong><span>${escapeHtml(report.element)}</span></div>
        <p class="eyebrow">PERSONALIZED BIRTH-DATE REPORT</p>
        <h3>${escapeHtml(report.name)}</h3>
        <p>${escapeHtml(report.formattedDate)} • ${escapeHtml(report.zodiacSign)}</p>
      </div>
      <h3>Birthday at a glance</h3>
      <div class="report-grid">
        <p><strong>Weekday:</strong> ${escapeHtml(report.weekday)}</p>
        <p><strong>Element:</strong> ${escapeHtml(report.element)}</p>
        <p><strong>Ruling planet:</strong> ${escapeHtml(report.rulingPlanet)}</p>
        <p><strong>Birthstone:</strong> ${escapeHtml(report.birthstone)}</p>
        <p><strong>Birth flower:</strong> ${escapeHtml(report.birthFlower)}</p>
        <p><strong>Life path:</strong> ${escapeHtml(report.lifePathNumber)}</p>
        <p><strong>Chinese zodiac:</strong> ${escapeHtml(report.chineseZodiac)}</p>
        <p><strong>Generation:</strong> ${escapeHtml(report.generation)}</p>
      </div>
      <h3>Personality reflection</h3><p>${escapeHtml(report.corePersonality)}</p>
      <div class="report-grid">
        <p><strong>Key traits:</strong> ${escapeHtml(report.keyTraits)}</p>
        <p><strong>Strengths:</strong> ${escapeHtml(report.strengths)}</p>
        <p><strong>Challenges:</strong> ${escapeHtml(report.challenges)}</p>
        <p><strong>Communication:</strong> ${escapeHtml(report.communicationStyle)}</p>
      </div>
      <h3>Life areas</h3>
      <p><strong>Relationships:</strong> ${escapeHtml(report.relationship)}</p>
      <p><strong>Learning:</strong> ${escapeHtml(report.learning)}</p>
      <p><strong>Work and goals:</strong> ${escapeHtml(report.workCareer)} ${escapeHtml(report.goals)}</p>
      <h3>Events connected to your date</h3>${listHtml(report.historicalEvents)}
      <h3>People born on your date</h3>${listHtml(report.famousBirths)}
      <h3>Birth-year profile</h3><p>${escapeHtml(report.yearProfile)}</p>
      <h3>Your personal birthday story</h3><p>${escapeHtml(report.story)}</p>
      <h3>Reflection themes</h3><ul>${(report.themes || []).map(theme => `<li>${escapeHtml(theme)}</li>`).join("")}</ul>
      <p class="muted disclaimer">${escapeHtml(report.note)}</p>
    </article>
  `;
}

function updateEditionForm() {
  const details = EDITIONS[selectedEdition];
  selectedEditionInput.value = selectedEdition;
  editionDescription.textContent = details.description;
  document.querySelectorAll(".edition-card").forEach(card => {
    card.classList.toggle("selected", card.dataset.edition === selectedEdition);
  });
  secondPersonFields.hidden = selectedEdition !== "couples";
  familyFields.hidden = selectedEdition !== "family";
  giftFields.hidden = selectedEdition !== "gift";

  const secondName = document.querySelector("#secondName");
  const secondBirthDate = document.querySelector("#secondBirthDate");
  secondName.required = selectedEdition === "couples";
  secondBirthDate.required = selectedEdition === "couples";
}

document.querySelectorAll(".edition-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedEdition = card.dataset.edition;
    updateEditionForm();
  });
});

async function readResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : { error: await response.text() };
  if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
  return data;
}

reportForm.addEventListener("submit", async event => {
  event.preventDefault();
  latestReportInput = {
    name: document.querySelector("#customerName").value.trim(),
    birthDate: document.querySelector("#birthDate").value,
    edition: selectedEdition,
    secondName: document.querySelector("#secondName").value.trim(),
    secondBirthDate: document.querySelector("#secondBirthDate").value,
    familyName: document.querySelector("#familyName").value.trim(),
    familyMembers: Number(document.querySelector("#familyMembers").value),
    giftFrom: document.querySelector("#giftFrom").value.trim(),
    giftMessage: document.querySelector("#giftMessage").value.trim()
  };

  reportResult.hidden = false;
  reportResult.innerHTML = `<p>Generating your ${escapeHtml(EDITIONS[selectedEdition].title)} preview...</p>`;
  downloadButton.hidden = true;

  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestReportInput)
    });
    const data = await readResponse(response);
    reportResult.innerHTML = reportHtml(data);
    downloadButton.hidden = false;
  } catch (error) {
    showMessage(reportResult, `Unable to generate the report. ${error.message}`, true);
  }
});

downloadButton.addEventListener("click", async () => {
  if (!latestReportInput) return;
  downloadButton.disabled = true;
  downloadButton.textContent = "Preparing your PDF...";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview.pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestReportInput)
    });
    if (!response.ok) throw new Error(await response.text() || `PDF request failed with status ${response.status}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedEdition}-birthdate-report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    showMessage(reportResult, `PDF generation failed: ${error.message}`, true);
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = "Download full PDF preview";
  }
});

compareForm.addEventListener("submit", async event => {
  event.preventDefault();
  const payload = {
    name: document.querySelector("#firstName").value.trim(),
    birthDate: document.querySelector("#firstDate").value,
    secondName: document.querySelector("#secondName").value.trim(),
    secondBirthDate: document.querySelector("#secondDate").value
  };
  compareResult.hidden = false;
  compareResult.innerHTML = "<p>Comparing dates...</p>";
  try {
    const response = await fetch(`${API_BASE}/api/reports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await readResponse(response);
    compareResult.innerHTML = `<h3>Comparison</h3><p><strong>${escapeHtml(data.first.name)}:</strong> ${escapeHtml(data.first.formattedDate)} — ${escapeHtml(data.first.zodiacSign)}</p><p><strong>${escapeHtml(data.second.name)}:</strong> ${escapeHtml(data.second.formattedDate)} — ${escapeHtml(data.second.zodiacSign)}</p><ul>${data.comparison.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul><small>${escapeHtml(data.note || "Reflective comparison only.")}</small>`;
  } catch (error) {
    showMessage(compareResult, `Comparison failed: ${error.message}`, true);
  }
});

updateEditionForm();
