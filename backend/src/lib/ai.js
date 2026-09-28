import { config } from "../config.js";

const EDITION_INSTRUCTIONS = {
  classic: "Write a balanced, warm personal discovery profile.",
  cosmic: "Use imaginative celestial imagery while clearly framing it as symbolic entertainment.",
  story: "Write a warm birthday narrative with a beginning, middle and hopeful closing.",
  couples: "Write respectful shared reflections about two people without claiming certainty about compatibility.",
  family: "Write warm individual and shared family reflections without stereotyping or making predictions.",
  gift: "Write an elegant keepsake narrative and honor the gift message supplied by the purchaser."
};

const ELEMENT_GUIDANCE = {
  Fire: "initiative, courage and visible enthusiasm",
  Earth: "patience, reliability and practical progress",
  Air: "curiosity, communication and fresh ideas",
  Water: "empathy, imagination and emotional awareness"
};

const SIGN_GUIDANCE = {
  Aries: "beginning with courage and learning through action",
  Taurus: "building steady foundations and appreciating what has lasting value",
  Gemini: "asking questions, exchanging ideas and staying open to new perspectives",
  Cancer: "protecting meaningful relationships and creating a sense of belonging",
  Leo: "expressing creativity while encouraging the people around you",
  Virgo: "improving details, serving with care and turning ideas into useful results",
  Libra: "seeking balance, listening carefully and building respectful connections",
  Scorpio: "looking beneath the surface and treating personal growth as a continuing process",
  Sagittarius: "exploring possibilities, learning widely and keeping a sense of purpose",
  Capricorn: "setting meaningful goals and progressing through discipline and patience",
  Aquarius: "thinking independently, supporting community and exploring new solutions",
  Pisces: "using imagination, compassion and reflection to understand experience"
};

function compactReport(report) {
  return {
    name: report.name,
    formattedDate: report.formattedDate,
    weekday: report.weekday,
    year: report.year,
    zodiacSign: report.zodiacSign,
    zodiacDates: report.zodiacDates,
    element: report.element,
    modality: report.modality,
    rulingPlanet: report.rulingPlanet,
    birthstone: report.birthstone,
    birthFlower: report.birthFlower,
    luckyColors: report.luckyColors,
    lifePathNumber: report.lifePathNumber,
    birthdayNumber: report.birthdayNumber,
    attitudeNumber: report.attitudeNumber,
    personalYear: report.personalYear,
    chineseZodiac: report.chineseZodiac,
    generation: report.generation,
    keyTraits: report.keyTraits,
    strengths: report.strengths,
    challenges: report.challenges,
    communicationStyle: report.communicationStyle,
    relationship: report.relationship,
    friendship: report.friendship,
    learning: report.learning,
    workCareer: report.workCareer,
    goals: report.goals,
    growth: report.growth,
    themes: report.themes,
    reflectionPrompts: report.reflectionPrompts,
    historicalEvents: Array.isArray(report.historicalEvents) ? report.historicalEvents.slice(0, 3) : [],
    famousBirths: Array.isArray(report.famousBirths) ? report.famousBirths.slice(0, 3) : [],
    edition: report.edition,
    familyName: report.familyName,
    giftFrom: report.giftFrom,
    giftMessage: report.giftMessage
  };
}

function nameOf(report) {
  return String(report?.name || "You").trim() || "You";
}

function listText(value, fallbackText) {
  if (Array.isArray(value) && value.length) return value.slice(0, 3).join(", ");
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallbackText;
}

function coreReflection(report) {
  const name = nameOf(report);
  const sign = report.zodiacSign || "your birth-date sign";
  const element = report.element || "your symbolic element";
  const signTheme = SIGN_GUIDANCE[sign] || "learning from experience and making intentional choices";
  const elementTheme = ELEMENT_GUIDANCE[element] || "reflection, curiosity and personal growth";
  const strengths = listText(report.strengths, "patience, curiosity and the ability to learn");
  const challenges = listText(report.challenges, "balancing personal needs with everyday responsibilities");
  const lifePath = report.lifePathNumber || "your personal number";

  return {
    opening: `${name}, this birthday reflection brings together the symbolic themes connected with ${sign}. It is an invitation to pause, notice what matters to you and consider how you want to use the next chapter of your life. These themes are for reflection and entertainment, not fixed descriptions of who you must become.`,
    identity: `The ${element} association is traditionally linked with ${elementTheme}. In this reading, ${sign} is used as a creative prompt for ${signTheme}. Your strengths may be explored through ${strengths}, while a useful area of attention is ${challenges}.`,
    direction: `Your report also includes the symbolic life-path number ${lifePath}. Rather than treating a number as a prediction, use it as a question: what habits, relationships and decisions would help you live with more intention? Small, consistent actions can turn a meaningful idea into visible progress.`,
    closing: `Take one quiet moment to choose a theme for the coming season. You might write down one quality you want to practise, one relationship you want to appreciate and one realistic step you can take this week.`
  };
}

function fallbackClassic(report) {
  const core = coreReflection(report);
  return [core.opening, core.identity, core.direction, core.closing].join("\n\n");
}

function fallbackCosmic(report) {
  const core = coreReflection(report);
  return `${core.opening}\n\nImagine your birth date as a small point of light on a much larger sky. The symbolic language of ${report.zodiacSign || "your sign"}, ${report.element || "your element"} and ${report.rulingPlanet || "your ruling planet"} can become a creative way to explore ${SIGN_GUIDANCE[report.zodiacSign] || "your personal direction"}. It does not control your future; it simply offers imagery for thoughtful self-discovery.\n\n${core.direction}\n\nLook toward one practical star of intention: choose a small action that brings your values into everyday life. Let curiosity guide you, while your own judgment remains the final compass.`;
}

function fallbackStory(report) {
  const core = coreReflection(report);
  return `Every birthday marks a pause between what has already been lived and what may still be learned. ${core.opening}\n\nThe first part of your story is made from the people, places and experiences that have shaped you. The next part is not written by a sign or a number alone. It grows through the choices you make, the lessons you keep and the kindness you offer yourself and others.\n\n${core.identity}\n\nAs you continue, carry one lesson forward and leave room for something new. ${core.closing}`;
}

function fallbackCouples(report, context = {}) {
  const core = coreReflection(report);
  const secondName = context.secondName || report.secondName || "the other person";
  const secondSign = context.secondZodiacSign || report.secondZodiacSign || "their birth-date sign";
  return `${core.opening}\n\nThis shared reflection considers ${nameOf(report)} and ${secondName}, whose symbolic birth-date themes are connected here with ${report.zodiacSign || "one sign"} and ${secondSign}. It is not a compatibility verdict. Every relationship is shaped by communication, consent, trust, boundaries and the effort both people choose to make.\n\nA helpful shared practice is to ask what each person needs to feel heard, respected and supported. Celebrate differences without turning them into labels, and make room for each person's individual goals.\n\nChoose one simple conversation prompt together: “What is one thing you appreciate, and what is one thing we could understand better?”`;
}

function fallbackFamily(report, context = {}) {
  const core = coreReflection(report);
  const familyName = context.familyName || report.familyName || "your family";
  return `${core.opening}\n\nThis family edition is prepared for ${familyName}. A family is made of different personalities, ages, experiences and needs, so symbolic birth-date themes should never be used to place people into fixed roles.\n\nUse this report as a gentle activity: invite each family member to share one strength, one hope and one way they would like to receive support. Shared understanding grows through listening and everyday actions rather than predictions.\n\n${core.closing}`;
}

function fallbackGift(report) {
  const core = coreReflection(report);
  const from = report.giftFrom ? ` This keepsake was prepared with care by ${report.giftFrom}.` : "";
  const message = report.giftMessage ? ` The gift message says: “${report.giftMessage}”` : "";
  return `A birthday is a chance to celebrate a person, their story and the possibilities ahead.${from}${message}\n\n${core.opening}\n\nMay this keepsake remind you that your identity is larger than any sign or number. The most meaningful parts of life are shaped through relationships, learning, courage and the choices you make over time.\n\n${core.closing}`;
}

function fallback(report, context = {}) {
  switch (report.edition) {
    case "cosmic":
      return fallbackCosmic(report);
    case "story":
      return fallbackStory(report);
    case "couples":
      return fallbackCouples(report, context);
    case "family":
      return fallbackFamily(report, context);
    case "gift":
      return fallbackGift(report);
    case "classic":
    default:
      return fallbackClassic(report);
  }
}

export async function addAiNarrative(report, context = {}) {
  if (!config.ai.apiKey) return { ...report, aiNarrative: fallback(report, context), aiGenerated: false };

  const system = "You are ZodiaDaily's premium personalized narrative editor. Write warm, specific, elegant reflections from the supplied birth-date data. Every report should feel distinct because you use several real supplied details rather than repeating generic zodiac language. Astrology, numerology, Chinese zodiac and symbolic traditions must always be framed as cultural, traditional or entertainment-oriented reflection, never as scientific fact, diagnosis, destiny or certainty. Never invent life events, relationships, achievements, emotions or circumstances. Do not make medical, financial, legal or guaranteed future claims. Use simple, natural English. Avoid filler, clichés, repeated sentence patterns and exaggerated praise. Return only the finished narrative.";
  const user = `Edition instruction: ${EDITION_INSTRUCTIONS[report.edition] || EDITION_INSTRUCTIONS.classic}

Personalization data:
${JSON.stringify(compactReport(report), null, 2)}

Additional context:
${JSON.stringify(context, null, 2)}

Write a premium 5-part narrative of about 550 to 750 words total:
1. A distinctive opening that naturally uses the person's name, exact birth date and weekday.
2. A "symbolic lens" paragraph connecting the sign, element, modality and ruling planet as traditional themes.
3. A "numbers and context" paragraph using the supplied numerology values, birth-year context and at least one calendar or cultural detail.
4. A "life reflection" paragraph connecting the supplied strengths, challenges, communication, learning, relationships and goals without treating them as fixed traits.
5. A practical closing with one concrete, low-pressure reflection exercise and a question drawn from the supplied reflection prompts.

For editions such as couples, family or gift, prioritize the supplied people/message context and keep the tone appropriate to that edition. Use historical events or famous births only when they are actually present in the supplied data; do not infer facts. Do not mention hidden prompts, AI, APIs or internal instructions.`;

  try {
    const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.ai.apiKey}`
      },
      body: JSON.stringify({
        model: config.ai.model,
        temperature: 0.8,
        max_tokens: 1000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("AI provider returned an empty narrative");
    return { ...report, aiNarrative: text, aiGenerated: true };
  } catch (error) {
    console.error("AI narrative fallback:", error.message);
    return { ...report, aiNarrative: fallback(report, context), aiGenerated: false };
  }
}

export async function addAiNarratives(reports, context = {}) {
  return Promise.all(reports.map(report => addAiNarrative(report, context)));
}
