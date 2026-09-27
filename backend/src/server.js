import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { buildReport, compareReports } from "./lib/report.js";
import { addAiNarrative, addAiNarratives } from "./lib/ai.js";
import { createPdf } from "./lib/pdf.js";
import { verifyShopifyHmac, isPaidOrder, containsProduct } from "./lib/shopify.js";
import { databaseConfigured, initializeDatabase, savePaidOrder, findPaidOrder, findPaidOrderBySessionToken, createPurchaseSession, findPurchaseSession, deletePurchaseSession } from "./lib/db.js";

const app = express();
const fallbackOrders = new Map();
const requestBuckets = new Map();
function allowRequest(req, key, limit = 12, windowMs = 60_000) {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const bucket = requestBuckets.get(bucketKey) || { started: now, count: 0 };
  if (now - bucket.started > windowMs) {
    bucket.started = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  requestBuckets.set(bucketKey, bucket);
  return bucket.count <= limit;
}
setInterval(() => {
  const cutoff = Date.now() - 5 * 60_000;
  for (const [key, bucket] of requestBuckets) if (bucket.started < cutoff) requestBuckets.delete(key);
}, 60_000).unref();

app.use(cors({ origin: config.frontendUrl === "*" ? true : config.frontendUrl }));
app.get("/health", (_req, res) => res.json({
  ok: true,
  service: "zodiadaily-backend",
  aiConfigured: Boolean(config.ai.apiKey),
  databaseConfigured: databaseConfigured(),
  shopifyWebhookConfigured: Boolean(config.shopify.webhookSecret)
}));

function safePurchasePayload(payload = {}) {
  const allowed = [
    "name", "birthDate", "edition", "secondName", "secondBirthDate",
    "familyName", "familyMembers", "familyProfiles", "giftFrom", "giftMessage", "customerEmail"
  ];
  const output = {};
  for (const key of allowed) if (payload[key] !== undefined) output[key] = payload[key];
  return output;
}

function shopifyProperty(properties = [], targetName = "_zodia_session") {
  const item = Array.isArray(properties) ? properties.find(property => property?.name === targetName) : null;
  return item?.value ? String(item.value) : "";
}

function buildShopifyCartUrl(token, customerEmail = "") {
  const variantId = String(config.shopify.variantId || "").replace(/^gid:\/\/shopify\/ProductVariant\//, "");
  const shop = String(config.shopify.storeDomain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!variantId || !shop) throw new Error("Shopify product configuration is incomplete.");
  const encoded = Buffer.from(JSON.stringify({ _zodia_session: token }), "utf8").toString("base64url");
  const url = new URL(`https://${shop}/cart/${variantId}:1`);
  url.searchParams.set("properties", encoded);
  if (customerEmail) url.searchParams.set("checkout[email]", String(customerEmail).trim());
  return url.toString();
}

function attachEdition(report, metadata = {}) {
  return Object.assign(report, {
    edition: metadata.edition || "classic",
    familyName: metadata.familyName || "",
    familyMembers: metadata.familyMembers || null,
    giftFrom: metadata.giftFrom || "",
    giftMessage: metadata.giftMessage || ""
  });
}


function previewProfile(report = {}, extra = {}) {
  return {
    name: report.name || "Your report",
    formattedDate: report.formattedDate || "",
    zodiacSign: report.zodiacSign || "",
    edition: report.edition || extra.edition || "classic",
    note: report.note || "Astrology, numerology and symbolic associations are presented for reflection or entertainment."
  };
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

app.post("/api/purchase-sessions", express.json({ limit: "32kb" }), async (req, res) => {
  if (!allowRequest(req, "purchase-session", 10)) return res.status(429).json({ error: "Too many checkout attempts. Please wait a moment and try again." });
  try {
    const payload = safePurchasePayload(req.body || {});
    if (!payload.name || !payload.birthDate) return res.status(400).json({ error: "Name and birth date are required." });
    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
    if (databaseConfigured()) await createPurchaseSession(token, payload, expiresAt);
    else return res.status(503).json({ error: "Purchase preparation requires database storage." });
    res.json({ token, checkoutUrl: buildShopifyCartUrl(token, payload.customerEmail), expiresAt });
  } catch (error) {
    console.error("Purchase session error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/reports/preview", express.json({ limit: "32kb" }), async (req, res) => {
  if (!allowRequest(req, "preview")) return res.status(429).json({ error: "Too many preview requests. Please wait a moment and try again." });
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
        members: members.map(member => previewProfile(member, { edition: "family" })),
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
      const comparison = await compareReports(first, second);
      return res.json({
        first: previewProfile(comparison.first, { edition: "couples" }),
        second: previewProfile(comparison.second, { edition: "couples" }),
        note: comparison.note
      });
    }

    res.json(previewProfile(first, { edition: edition || "classic" }));
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

app.post("/api/reports/preview.pdf", express.json({ limit: "32kb" }), async (req, res) => {
  if (!allowRequest(req, "preview-pdf", 6)) return res.status(429).json({ error: "Too many PDF preview requests. Please wait a moment and try again." });
  try {
    const report = await makeReport(req.body || {});
    const pdf = await createPdf(report, { preview: true });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="zodiadaily-sample-preview.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error("PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

async function getOrderBySessionToken(sessionToken) {
  if (!databaseConfigured() || !sessionToken) return null;
  try {
    await initializeDatabase();
    const rows = await findPaidOrderBySessionToken(sessionToken);
    return rows || null;
  } catch (error) {
    console.error("Session order lookup failed:", error);
    return null;
  }
}

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

app.get("/api/purchase-sessions/:token/status", async (req, res) => {
  if (!allowRequest(req, "purchase-session-status", 30)) return res.status(429).json({ error: "Too many status checks. Please wait a moment and try again." });
  const token = String(req.params.token || "");
  const order = await getOrderBySessionToken(token);
  if (!order) return res.json({ found: false, paid: false, readyForDelivery: false });
  res.json({
    found: true,
    paid: Boolean(order.paid),
    productMatched: Boolean(order.productMatched),
    readyForDelivery: Boolean(order.paid && order.productMatched && order.reportPayload),
    createdAt: order.createdAt
  });
});

app.post("/api/purchase-sessions/:token/report.pdf", express.json({ limit: "8kb" }), async (req, res) => {
  if (!allowRequest(req, "session-paid-pdf", 5)) return res.status(429).json({ error: "Too many download attempts. Please wait a moment and try again." });
  try {
    const token = String(req.params.token || "");
    const order = await getOrderBySessionToken(token);
    if (!order || !order.paid || !order.productMatched || !order.reportPayload) {
      return res.status(404).json({ error: "Your payment is still being confirmed. Please try again in a moment." });
    }
    const report = await makeReport(order.reportPayload);
    await sendPdf(res, report, `zodiadaily-report.pdf`);
  } catch (error) {
    console.error("Session paid PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/orders/:orderId/report.pdf", express.json({ limit: "32kb" }), async (req, res) => {
  if (!allowRequest(req, "paid-pdf", 5)) return res.status(429).json({ error: "Too many download attempts. Please wait a moment and try again." });
  try {
    const orderId = String(req.params.orderId || "");
    const order = await getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order has not been received by the payment webhook yet." });
    }

    if (!order.paid || !order.productMatched) {
      return res.status(402).json({ error: "This order is not verified as a paid ZodiaDaily order." });
    }

    if (order.email) {
      const providedEmail = String(req.body?.customerEmail || "").trim().toLowerCase();
      if (!providedEmail || providedEmail !== String(order.email).trim().toLowerCase()) {
        return res.status(403).json({ error: "Enter the same checkout email used for this order." });
      }
    }

    const reportInput = order.reportPayload || req.body || {};
    const report = await makeReport(reportInput);
    await sendPdf(res, report, `zodiadaily-order-${orderId}.pdf`);
  } catch (error) {
    console.error("Paid PDF error:", error);
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/orders/:orderId/status", async (req, res) => {
  if (!allowRequest(req, "order-status", 20)) return res.status(429).json({ error: "Too many status checks. Please wait a moment and try again." });
  const order = await getOrder(String(req.params.orderId));
  if (!order) return res.status(404).json({ found: false, message: "Order not found yet" });
  res.json({
    found: true,
    orderId: order.orderId,
    paid: order.paid,
    productMatched: order.productMatched,
    readyForDelivery: order.paid && order.productMatched,
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
  const lineItems = Array.isArray(order.line_items) ? order.line_items : [];
  const sessionToken = lineItems.map(item => shopifyProperty(item.properties)).find(Boolean) || "";
  let reportPayload = null;

  if (sessionToken && databaseConfigured()) {
    try {
      const session = await findPurchaseSession(sessionToken);
      if (session) {
        reportPayload = session.reportPayload;
        await deletePurchaseSession(sessionToken);
      }
    } catch (error) {
      console.error("Purchase session lookup failed:", error);
    }
  }

  const storedOrder = {
    orderId,
    paid,
    productMatched,
    email: order.email || order.contact_email || "",
    reportPayload,
    sessionToken,
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
    readyForDelivery: paid && productMatched,
    reportBound: Boolean(reportPayload)
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
