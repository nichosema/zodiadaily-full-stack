import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { buildReport, compareReports } from "./lib/report.js";
import { addAiNarrative, addAiNarratives } from "./lib/ai.js";
import { createPdf } from "./lib/pdf.js";
import { verifyShopifyHmac, isPaidOrder, containsProduct } from "./lib/shopify.js";
import { databaseConfigured, initializeDatabase, savePaidOrder, findPaidOrder } from "./lib/db.js";

const app = express();
const fallbackOrders = new Map();

app.use(cors({ origin: config.frontendUrl === "*" ? true : config.frontendUrl }));
app.get("/health", (_req, res) => res.json({
  ok: true,
  service: "zodiadaily-backend",
  aiConfigured: Boolean(config.ai.apiKey),
  databaseConfigured: databaseConfigured(),
  shopifyWebhookConfigured: Boolean(config.shopify.webhookSecret)
}));

function attachEdition(report, metadata = {}) {
  return Object.assign(report, {
    edition: metadata.edition || "classic",
    familyName: metadata.familyName || "",
    familyMembers: metadata.familyMembers || null,
    giftFrom: metadata.giftFrom || "",
    giftMessage: metadata.giftMessage || ""
  });
}

async function makeReport(payload = {}) {
  const { birthDate, name, selectedYear, edition, familyName, familyMembers, giftFrom, giftMessage } = payload;
  if (!birthDate) throw new Error("birthDate is required");

  return addAiNarrative(
    attachEdition(await buildReport(birthDate, name, selectedYear), {
      edition,
      familyName,
      familyMembers,
      giftFrom,
      giftMessage
    }),
    { familyName, familyMembers }
  );
}

app.post("/api/reports/preview", express.json(), async (req, res) => {
  try {
    const {
      birthDate, name, secondBirthDate, secondName, selectedYear, edition,
      familyName, familyMembers, familyProfiles, giftFrom, giftMessage
    } = req.body || {};

    if (!birthDate) return res.status(400).json({ error: "birthDate is required" });
    const metadata = { edition, familyName, familyMembers, giftFrom, giftMessage };

    if (edition === "family") {
      const rawMembers = [attachEdition(await buildReport(birthDate, name, selectedYear), metadata)];
      for (const member of Array.isArray(familyProfiles) ? familyProfiles.slice(0, 7) : []) {
        if (!member?.birthDate || !member?.name) continue;
        rawMembers.push(attachEdition(await buildReport(member.birthDate, member.name, selectedYear), metadata));
      }
      const members = await addAiNarratives(rawMembers, { familyName, familyMembers });
      return res.json({
        familyName: familyName || "Family keepsake",
        members,
        note: "Family profiles are symbolic and reflective, not scientific assessments."
      });
    }

    const first = await addAiNarrative(
      attachEdition(await buildReport(birthDate, name, selectedYear), metadata),
      { familyName, familyMembers }
    );

    if (secondBirthDate) {
      const second = await addAiNarrative(
        attachEdition(await buildReport(secondBirthDate, secondName, selectedYear), {
          ...metadata,
          edition: edition || "couples"
        }),
        { firstName: name, secondName }
      );
      return res.json(await compareReports(first, second));
    }

    res.json(first);
  } catch (error) {
    console.error("Preview error:", error);
    res.status(400).json({ error: error.message });
  }
});

async function sendPdf(res, report, filename) {
  const pdf = await createPdf(report);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(pdf);
}

app.post("/api/reports/preview.pdf", express.json(), async (req, res) => {
  try {
    const report = await makeReport(req.body || {});
    await sendPdf(res, report, "zodiadaily-preview-report.pdf");
  } catch (error) {
    console.error("PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

async function getOrder(orderId) {
  if (databaseConfigured()) {
    try {
      return await findPaidOrder(orderId);
    } catch (error) {
      console.error("Database order lookup failed:", error);
    }
  }
  return fallbackOrders.get(orderId) || null;
}

app.post("/api/orders/:orderId/report.pdf", express.json(), async (req, res) => {
  try {
    const orderId = String(req.params.orderId || "");
    const order = await getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order has not been received by the payment webhook yet." });
    }

    if (!order.paid || !order.productMatched) {
      return res.status(402).json({ error: "This order is not verified as a paid ZodiaDaily order." });
    }

    const report = await makeReport(req.body || {});
    await sendPdf(res, report, `zodiadaily-order-${orderId}.pdf`);
  } catch (error) {
    console.error("Paid PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/orders/:orderId/status", async (req, res) => {
  const order = await getOrder(String(req.params.orderId));
  if (!order) return res.status(404).json({ found: false, message: "Order not found yet" });
  res.json({
    found: true,
    orderId: order.orderId,
    paid: order.paid,
    productMatched: order.productMatched,
    readyForDelivery: order.paid && order.productMatched,
    email: order.email,
    createdAt: order.createdAt
  });
});

app.post("/webhooks/shopify/orders-create", express.raw({ type: "application/json" }), async (req, res) => {
  const verified = verifyShopifyHmac(req.body, req.get("X-Shopify-Hmac-Sha256"));
  if (!verified) return res.status(401).json({ error: "Invalid webhook signature" });

  let order;
  try {
    order = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const paid = isPaidOrder(order);
  const productMatched = containsProduct(order);
  const orderId = String(order.id || order.order_number || "");
  const storedOrder = {
    orderId,
    paid,
    productMatched,
    email: order.email || order.contact_email || "",
    createdAt: new Date().toISOString()
  };

  if (orderId) {
    fallbackOrders.set(orderId, storedOrder);
    if (databaseConfigured()) {
      try {
        await savePaidOrder(storedOrder);
      } catch (error) {
        console.error("Database order save failed:", error);
      }
    }
  }

  res.json({
    received: true,
    stored: Boolean(orderId),
    durableStorage: databaseConfigured(),
    paid,
    productMatched,
    readyForDelivery: paid && productMatched
  });
});

async function start() {
  if (databaseConfigured()) {
    try {
      await initializeDatabase();
      console.log("PostgreSQL order storage initialized");
    } catch (error) {
      console.error("PostgreSQL initialization failed:", error.message);
    }
  } else {
    console.warn("DATABASE_URL is not configured; using temporary in-memory order storage");
  }

  app.listen(config.port, () => console.log(`ZodiaDaily backend running on port ${config.port}`));
}

start();
