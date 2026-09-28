import assert from "node:assert/strict";
import { buildReport, compareReports } from "./lib/report.js";
import { createPdf } from "./lib/pdf.js";
import { addAiNarrative } from "./lib/ai.js";

const cases = [
  { edition: "classic", name: "Test Classic", birthDate: "2000-06-30" },
  { edition: "cosmic", name: "Test Cosmic", birthDate: "1998-02-14" },
  { edition: "story", name: "Test Story", birthDate: "2001-09-22" },
  { edition: "gift", name: "Test Gift", birthDate: "1995-12-05", giftFrom: "A Friend", giftMessage: "Happy birthday!" }
];

for (const input of cases) {
  const report = await buildReport(input.birthDate, input.name);
  report.edition = input.edition;
  report.giftFrom = input.giftFrom || "";
  report.giftMessage = input.giftMessage || "";
  assert.equal(report.name, input.name);
  assert.equal(report.birthDate, input.birthDate);
  assert.ok(Array.isArray(report.reflectionPrompts) && report.reflectionPrompts.length >= 5);
  assert.ok(Array.isArray(report.symbolicSnapshot) && report.symbolicSnapshot.length >= 5);
  const narrative = await addAiNarrative({ ...report, edition: input.edition }, { test: true });
  assert.ok(typeof narrative.aiNarrative === "string" && narrative.aiNarrative.length > 120);
  const pdf = await createPdf({ ...narrative, edition: input.edition });
  assert.ok(Buffer.isBuffer(pdf) && pdf.length > 1000, input.edition + ": PDF was not generated");
  console.log("PASS " + input.edition + ": " + pdf.length + " bytes");
}

const first = await buildReport("2000-06-30", "Test Person 1");
const second = await buildReport("2002-01-24", "Test Person 2");
const comparison = await compareReports(first, second);
assert.ok(comparison.first?.name === "Test Person 1");
assert.ok(comparison.second?.name === "Test Person 2");
assert.ok(Array.isArray(comparison.comparison));
const couplesPdf = await createPdf({ ...comparison, edition: "couples" });
assert.ok(Buffer.isBuffer(couplesPdf) && couplesPdf.length > 1000);
console.log("PASS couples: " + couplesPdf.length + " bytes");

const members = [];
const familyDates = ["2000-01-01", "2001-02-02", "2002-03-03", "2003-04-04", "2004-05-05", "2005-06-06", "2006-07-07", "2007-08-08"];
for (let i = 0; i < 8; i++) {
  const report = await buildReport(familyDates[i], "Family Member " + (i + 1));
  report.edition = "family";
  members.push(report);
}
const familyPdf = await createPdf({ edition: "family", familyName: "Test Family", members });
assert.ok(Buffer.isBuffer(familyPdf) && familyPdf.length > 1000);
console.log("PASS family-8-members: " + familyPdf.length + " bytes");

console.log("All ZodiaDaily edition smoke tests passed.");
