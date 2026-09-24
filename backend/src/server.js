import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { buildReport, compareReports } from "./lib/report.js";
import { createPdf } from "./lib/pdf.js";
import { verifyShopifyHmac, isPaidOrder, containsProduct } from "./lib/shopify.js";

const app = express();
app.use(cors({ origin: config.frontendUrl === "*" ? true : config.frontendUrl }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "zodiadaily-backend" }));

app.post("/api/reports/preview", express.json(), async (req, res) => {
  try {
    const { birthDate, name, secondBirthDate, secondName, selectedYear, edition, familyName, familyMembers, giftFrom, giftMessage } = req.body || {};
    if (!birthDate) return res.status(400).json({ error: "birthDate is required" });

    const first = await buildReport(birthDate, name, selectedYear);
    first.edition = edition || "classic";
    first.familyName = familyName || "";
    first.familyMembers = familyMembers || null;
    first.giftFrom = giftFrom || "";
    first.giftMessage = giftMessage || "";

    if (secondBirthDate) {
      const second = await buildReport(secondBirthDate, secondName, selectedYear);
      second.edition = edition || "couples";
      return res.json(await compareReports(first, second));
    }

    res.json(first);
  } catch (error) {
    console.error("Preview error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/reports/preview.pdf", express.json(), async (req, res) => {
  try {
    const { birthDate, name, selectedYear, edition, familyName, familyMembers, giftFrom, giftMessage } = req.body || {};
    if (!birthDate) return res.status(400).json({ error: "birthDate is required" });
    const report = await buildReport(birthDate, name, selectedYear);
    report.edition = edition || "classic";
    report.familyName = familyName || "";
    report.familyMembers = familyMembers || null;
    report.giftFrom = giftFrom || "";
    report.giftMessage = giftMessage || "";
    const pdf = await createPdf(report);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="zodiadaily-personalized-report.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error("PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/webhooks/shopify/orders-create", express.raw({ type: "application/json" }), (req, res) => {
  const verified = verifyShopifyHmac(req.body, req.get("X-Shopify-Hmac-Sha256"));
  if (!verified) return res.status(401).json({ error: "Invalid webhook signature" });
  let order;
  try { order = JSON.parse(req.body.toString("utf8")); } catch { return res.status(400).json({ error: "Invalid JSON" }); }
  res.json({ received: true, paid: isPaidOrder(order), productMatched: containsProduct(order) });
});

app.listen(config.port, () => console.log(`ZodiaDaily backend running on port ${config.port}`));
