import { config } from "../config.js";

const EDITION_INSTRUCTIONS = {
  classic: "Write a balanced, warm personal discovery profile.",
  cosmic: "Use imaginative celestial imagery while clearly framing it as symbolic entertainment.",
  story: "Write a warm birthday narrative with a beginning, middle and hopeful closing.",
  couples: "Write respectful shared reflections about two people without claiming certainty about compatibility.",
  family: "Write warm individual and shared family reflections without stereotyping or making predictions.",
  gift: "Write an elegant keepsake narrative and honor the gift message supplied by the purchaser."
};

function compactReport(report) {
  return {
    name: report.name, formattedDate: report.formattedDate, zodiacSign: report.zodiacSign,
    element: report.element, rulingPlanet: report.rulingPlanet, lifePathNumber: report.lifePathNumber,
    keyTraits: report.keyTraits, strengths: report.strengths, challenges: report.challenges,
    relationship: report.relationship, learning: report.learning, workCareer: report.workCareer,
    goals: report.goals, themes: report.themes, edition: report.edition,
    giftFrom: report.giftFrom, giftMessage: report.giftMessage
  };
}

function fallback(report) {
  const name = report.name || "you";
  return `This reflective birthday narrative for ${name} brings together the symbolic themes in this report. Use the ideas as prompts for self-understanding, gratitude and personal growth. Your choices, experiences and relationships shape your life more than any birth-date system can determine.`;
}

export async function addAiNarrative(report, context = {}) {
  if (!config.ai.apiKey) return { ...report, aiNarrative: fallback(report), aiGenerated: false };
  const system = "You are the narrative writer for BirthDate/ZodiaDaily. Produce supportive, original, non-deterministic reflective content. Never present astrology, numerology or zodiac ideas as scientific facts. Do not make medical, financial, legal or guaranteed future claims. Use simple, elegant English. Return only the requested narrative text.";
  const user = `Edition instruction: ${EDITION_INSTRUCTIONS[report.edition] || EDITION_INSTRUCTIONS.classic}\n\nReport data:\n${JSON.stringify(compactReport(report))}\n\nAdditional context:\n${JSON.stringify(context)}\n\nWrite 3 to 5 polished paragraphs for the customer's report. Mention the person's name naturally. Make it personal but do not invent specific life events. End with a practical reflection prompt.`;
  try {
    const response = await fetch(`${config.ai.baseUrl}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.ai.apiKey}` },
      body: JSON.stringify({ model: config.ai.model, temperature: 0.8, max_tokens: 700, messages: [{ role: "system", content: system }, { role: "user", content: user }] })
    });
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("AI provider returned an empty narrative");
    return { ...report, aiNarrative: text, aiGenerated: true };
  } catch (error) {
    console.error("AI narrative fallback:", error.message);
    return { ...report, aiNarrative: fallback(report), aiGenerated: false };
  }
}

export async function addAiNarratives(reports, context = {}) {
  return Promise.all(reports.map(report => addAiNarrative(report, context)));
}
