function zodiacFor(month, day) {
  if ((month === 1 && day < 20) || (month === 12 && day >= 22)) return "Capricorn";
  if (month === 1 || (month === 2 && day < 19)) return "Aquarius";
  if (month === 2 || (month === 3 && day < 21)) return "Pisces";
  if (month === 3 || (month === 4 && day < 20)) return "Aries";
  if (month === 4 || (month === 5 && day < 21)) return "Taurus";
  if (month === 5 || (month === 6 && day < 21)) return "Gemini";
  if (month === 6 || (month === 7 && day < 23)) return "Cancer";
  if (month === 7 || (month === 8 && day < 23)) return "Leo";
  if (month === 8 || (month === 9 && day < 23)) return "Virgo";
  if (month === 9 || (month === 10 && day < 23)) return "Libra";
  if (month === 10 || (month === 11 && day < 22)) return "Scorpio";
  return "Sagittarius";
}

function digitSum(value) {
  return String(value).replace(/\D/g, "").split("").reduce((sum, n) => sum + Number(n), 0);
}

function lifePath(dateString) {
  let value = digitSum(dateString);
  while (value > 9 && ![11, 22, 33].includes(value)) value = digitSum(value);
  return value;
}

export function buildReport(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (!dateString || Number.isNaN(date.getTime())) {
    throw new Error("Please provide a valid date.");
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  return {
    birthDate: dateString,
    formattedDate: new Intl.DateTimeFormat("en-US", {
      month: "long", day: "numeric", year: "numeric", timeZone: "UTC"
    }).format(date),
    weekday: new Intl.DateTimeFormat("en-US", {
      weekday: "long", timeZone: "UTC"
    }).format(date),
    zodiacSign: zodiacFor(month, day),
    lifePathNumber: lifePath(dateString),
    themes: [
      "Identity and self-reflection",
      "Personal growth",
      "Relationships and communication",
      "Goals and everyday choices"
    ],
    note: "Astrology and numerology sections are symbolic or entertainment interpretations, not scientific personality assessments."
  };
}

export function compareReports(first, second) {
  return {
    first,
    second,
    comparison: [
      first.zodiacSign === second.zodiacSign
        ? "Both dates share the same zodiac sign."
        : "The dates have different zodiac signs.",
      first.lifePathNumber === second.lifePathNumber
        ? "Both dates share the same life-path number."
        : "The dates have different life-path numbers.",
      "Use the comparison as a reflective exercise rather than a scientific compatibility assessment."
    ]
  };
}
