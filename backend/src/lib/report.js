const ZODIAC = [
  { name: "Capricorn", element: "Earth", modality: "Cardinal", planet: "Saturn", dates: "22 December – 19 January" },
  { name: "Aquarius", element: "Air", modality: "Fixed", planet: "Uranus", dates: "20 January – 18 February" },
  { name: "Pisces", element: "Water", modality: "Mutable", planet: "Neptune", dates: "19 February – 20 March" },
  { name: "Aries", element: "Fire", modality: "Cardinal", planet: "Mars", dates: "21 March – 19 April" },
  { name: "Taurus", element: "Earth", modality: "Fixed", planet: "Venus", dates: "20 April – 20 May" },
  { name: "Gemini", element: "Air", modality: "Mutable", planet: "Mercury", dates: "21 May – 20 June" },
  { name: "Cancer", element: "Water", modality: "Cardinal", planet: "Moon", dates: "21 June – 22 July" },
  { name: "Leo", element: "Fire", modality: "Fixed", planet: "Sun", dates: "23 July – 22 August" },
  { name: "Virgo", element: "Earth", modality: "Mutable", planet: "Mercury", dates: "23 August – 22 September" },
  { name: "Libra", element: "Air", modality: "Cardinal", planet: "Venus", dates: "23 September – 22 October" },
  { name: "Scorpio", element: "Water", modality: "Fixed", planet: "Pluto", dates: "23 October – 21 November" },
  { name: "Sagittarius", element: "Fire", modality: "Mutable", planet: "Jupiter", dates: "22 November – 21 December" }
];

const MONTH_DATA = {
  1: ["Garnet", "Carnation", "Deep red, burgundy and warm neutrals"], 2: ["Amethyst", "Violet", "Purple, lilac and soft blue"], 3: ["Aquamarine", "Daffodil", "Sea blue, yellow and fresh green"], 4: ["Diamond", "Daisy", "White and pastel tones"],
  5: ["Emerald", "Lily of the valley", "Green, mint and natural tones"], 6: ["Pearl", "Rose", "Cream, rose and soft silver"], 7: ["Ruby", "Water lily", "Ruby red, coral and warm pink"], 8: ["Peridot", "Gladiolus", "Gold, orange and warm red"],
  9: ["Sapphire", "Morning glory", "Royal blue, navy and violet"], 10: ["Opal", "Marigold", "Amber, peach and pastel tones"], 11: ["Topaz", "Chrysanthemum", "Gold, bronze and autumn tones"], 12: ["Turquoise", "Narcissus", "Turquoise, silver and winter blue"]
};

const ELEMENT_TEXT = {
  Fire: { core: "energy, initiative, creativity and action", traits: "Energetic • Expressive • Courageous • Motivated • Direct", strengths: "Initiative, enthusiasm, creative expression and encouragement", challenges: "Impatience, taking on too much or finding it difficult to slow down", communication: "Often described as direct, lively and action-oriented" },
  Earth: { core: "practicality, patience, consistency and grounded effort", traits: "Practical • Reliable • Patient • Focused • Steady", strengths: "Persistence, organization, dependability and careful decision-making", challenges: "Rigidity, overthinking details or resisting sudden change", communication: "Often described as measured, clear and focused on useful results" },
  Air: { core: "ideas, communication, curiosity and social connection", traits: "Curious • Communicative • Flexible • Inventive • Observant", strengths: "Learning, discussion, networking and seeing different perspectives", challenges: "Scattered attention, indecision or staying in thought too long", communication: "Often described as expressive, thoughtful and interested in exchanging ideas" },
  Water: { core: "emotion, imagination, empathy and meaningful connection", traits: "Sensitive • Imaginative • Caring • Reflective • Intuitive", strengths: "Empathy, creativity, loyalty and emotional awareness", challenges: "Absorbing other people's moods, hesitation or avoiding difficult conversations", communication: "Often described as warm, careful and attentive to emotional meaning" }
};

function digitSum(value) { return String(value).replace(/\D/g, "").split("").reduce((sum, n) => sum + Number(n), 0); }
function reduceNumber(value) { let result = Number(value); while (result > 9 && ![11, 22, 33].includes(result)) result = digitSum(result); return result; }
function lifePath(dateString) { return reduceNumber(digitSum(dateString)); }
function birthdayNumber(day) { return reduceNumber(day); }
function attitudeNumber(month, day) { return reduceNumber(month + day); }
function personalYear(month, day, year) { return reduceNumber(month + day + digitSum(year)); }

function zodiacFor(month, day) {
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC[0];
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC[1];
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC[2];
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC[3];
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC[4];
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return ZODIAC[5];
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return ZODIAC[6];
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC[7];
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC[8];
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return ZODIAC[9];
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return ZODIAC[10];
  return ZODIAC[11];
}

function validateDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) throw new Error("Please provide a valid date in YYYY-MM-DD format.");
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Please provide a valid date.");
  return date;
}

function dayOfYear(date) {
  return Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - Date.UTC(date.getUTCFullYear(), 0, 0)) / 86400000);
}

function generation(year) {
  if (year >= 2013) return "Generation Alpha";
  if (year >= 1997) return "Generation Z";
  if (year >= 1981) return "Millennial generation";
  if (year >= 1965) return "Generation X";
  if (year >= 1946) return "Baby Boomer generation";
  return "an earlier generation cohort";
}

function chineseAnimal(year) {
  const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
  return animals[(year - 4 + 120) % 12];
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "ZodiaDaily/1.0" }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

async function fetchDateResearch(month, day) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const [events, births] = await Promise.all([
    fetchJson(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${mm}/${dd}`),
    fetchJson(`https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/births/${mm}/${dd}`)
  ]);
  return {
    events: (events?.events || []).slice(0, 4).map(x => ({ year: x.year, text: x.text })),
    births: (births?.births || []).slice(0, 6).map(x => ({ year: x.year, text: x.text }))
  };
}

async function fetchYearResearch(year) {
  const page = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(String(year))}`);
  return page ? { extract: page.extract || "", url: page.content_urls?.desktop?.page || "" } : { extract: "", url: "" };
}

export async function buildReport(dateString, name = "", selectedYear = new Date().getUTCFullYear()) {
  const date = validateDate(dateString);
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const zodiac = zodiacFor(month, day);
  const symbolic = ELEMENT_TEXT[zodiac.element];
  const monthData = MONTH_DATA[month];
  const formattedDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(date);
  const cleanName = String(name || "").trim() || "Your";
  const totalDays = new Date(Date.UTC(year, 1, 29)).getUTCDate() === 29 ? 366 : 365;
  const [dateResearch, yearResearch] = await Promise.all([fetchDateResearch(month, day), fetchYearResearch(year)]);

  return {
    name: cleanName, birthDate: dateString, formattedDate, weekday, year, month, day,
    zodiacSign: zodiac.name, element: zodiac.element, modality: zodiac.modality, rulingPlanet: zodiac.planet, zodiacDates: zodiac.dates,
    birthstone: monthData[0], birthFlower: monthData[1], luckyColors: monthData[2],
    lifePathNumber: lifePath(dateString), birthdayNumber: birthdayNumber(day), attitudeNumber: attitudeNumber(month, day), personalYear: personalYear(month, day, selectedYear),
    chineseZodiac: chineseAnimal(year), generation: generation(year), dayOfYear: dayOfYear(date), daysRemaining: totalDays - dayOfYear(date), leapYear: totalDays === 366,
    corePersonality: `Traditional ${zodiac.name} interpretations often emphasize ${symbolic.core}. This is reflective content, not a fixed description of a person.`,
    keyTraits: symbolic.traits, strengths: symbolic.strengths, challenges: symbolic.challenges, communicationStyle: symbolic.communication,
    relationship: "Traditional interpretations can be used to reflect on loyalty, communication, respect and healthy boundaries. Healthy relationships depend on real behavior and mutual respect.",
    friendship: "Reflect on generosity, encouragement, listening and shared experiences. People are more complex than a birth-date category.",
    learning: "Explore learning through questions, practical examples, creative projects and opportunities to explain ideas to others.",
    workCareer: `Reflect on how themes such as ${symbolic.core} could support teamwork, responsibility and meaningful work.`,
    goals: "Choose one realistic goal, identify a small next action and review progress without treating symbolism as destiny.",
    growth: "Practice self-awareness, flexibility, patience and constructive feedback alongside your natural strengths.",
    historicalEvents: dateResearch.events, famousBirths: dateResearch.births,
    yearProfile: yearResearch.extract || `Your birth year is ${year}. A research snapshot can be added when reference data is available.`, yearProfileUrl: yearResearch.url,
    story: `Born on ${formattedDate}, ${cleanName}'s date sits within a particular point in calendar history. Symbols and context can inspire reflection, but choices, relationships, learning and lived experiences shape a person's story.`,
    themes: ["Confidence", "Personal growth", "Meaningful connections", "Making an impact", "Balance", "Lifelong learning"],
    note: "Astrology, numerology, colors, birthstones and cultural symbols are presented for reflection or entertainment. They are not scientifically validated measurements or predictions. Historical and birth-date facts are retrieved from Wikimedia when available."
  };
}

export async function compareReports(first, second) {
  return {
    first, second,
    comparison: [
      first.zodiacSign === second.zodiacSign ? "Both dates share the same zodiac sign." : "The dates have different zodiac signs.",
      first.lifePathNumber === second.lifePathNumber ? "Both dates share the same life-path number." : "The dates have different life-path numbers.",
      first.element === second.element ? "Both profiles use the same traditional element." : "The profiles use different traditional elements.",
      "Use this comparison as a reflective exercise rather than a scientific compatibility assessment."
    ],
    note: "This comparison is reflective and entertainment-oriented. It does not measure scientific compatibility."
  };
}
