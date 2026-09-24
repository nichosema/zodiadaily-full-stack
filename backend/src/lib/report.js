const ZODIAC_PROFILES = {
  Aries: { element: "Fire", style: "initiative, courage, and direct action" },
  Taurus: { element: "Earth", style: "patience, consistency, and practical choices" },
  Gemini: { element: "Air", style: "curiosity, communication, and flexible thinking" },
  Cancer: { element: "Water", style: "care, emotional awareness, and belonging" },
  Leo: { element: "Fire", style: "expression, warmth, and creative confidence" },
  Virgo: { element: "Earth", style: "careful thinking, service, and useful systems" },
  Libra: { element: "Air", style: "balance, dialogue, and cooperation" },
  Scorpio: { element: "Water", style: "depth, focus, and personal transformation" },
  Sagittarius: { element: "Fire", style: "exploration, optimism, and learning" },
  Capricorn: { element: "Earth", style: "discipline, responsibility, and long-term planning" },
  Aquarius: { element: "Air", style: "ideas, independence, and community thinking" },
  Pisces: { element: "Water", style: "imagination, empathy, and reflection" }
};

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

function validateDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) {
    throw new Error("Please provide a valid date in YYYY-MM-DD format.");
  }
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Please provide a valid date.");
  return date;
}

export function buildReport(dateString) {
  const date = validateDate(dateString);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const zodiacSign = zodiacFor(month, day);
  const profile = ZODIAC_PROFILES[zodiacSign];
  const number = lifePath(dateString);

  return {
    birthDate: dateString,
    formattedDate: new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date),
    zodiacSign,
    element: profile.element,
    zodiacStyle: profile.style,
    lifePathNumber: number,
    headline: `${zodiacSign}: a reflective guide to your patterns and possibilities`,
    sections: [
      { title: "Core energy", text: `This symbolic profile focuses on ${profile.style}. Use it as a prompt for reflection, not as a fixed description of who you are.` },
      { title: "Personal growth", text: "Choose one small habit that supports patience, self-awareness, and consistent progress. Review what works for you instead of trying to follow a fixed identity." },
      { title: "Relationships", text: "Notice how you communicate your needs, listen to others, and make space for differences. Healthy relationships require consent, honesty, and mutual respect." },
      { title: "Reflection prompts", text: "What am I learning about myself? Which choice would support my long-term goals? What is one practical step I can take this week?" }
    ],
    themes: ["Identity and self-reflection", "Personal growth", "Relationships and communication", "Goals and everyday choices"],
    note: "Astrology and numerology are symbolic or entertainment interpretations. They are not scientific personality assessments, predictions, or professional advice."
  };
}

export function compareReports(first, second) {
  const sameSign = first.zodiacSign === second.zodiacSign;
  const sameNumber = first.lifePathNumber === second.lifePathNumber;
  return {
    first,
    second,
    comparison: [
      sameSign ? "Both dates share the same zodiac sign." : "The dates have different zodiac signs.",
      sameNumber ? "Both dates share the same life-path number." : "The dates have different life-path numbers.",
      `The first profile is associated symbolically with ${first.element}, while the second is associated with ${second.element}.`,
      "Use the comparison to start a respectful conversation, not to decide whether a relationship will succeed."
    ],
    note: "This comparison is reflective and entertainment-oriented. It does not measure scientific compatibility."
  };
}
