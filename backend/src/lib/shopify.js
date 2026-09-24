import crypto from "crypto";
import { config } from "../config.js";

export function verifyShopifyHmac(rawBody, header) {
  if (!config.shopify.webhookSecret || !header || !rawBody) return false;

  const digest = crypto
    .createHmac("sha256", config.shopify.webhookSecret)
    .update(rawBody)
    .digest("base64");

  const expected = Buffer.from(digest);
  const received = Buffer.from(header);

  return expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);
}

export function isPaidOrder(order) {
  return String(order?.financial_status || "").toLowerCase() === "paid";
}

export function containsProduct(order) {
  return (order?.line_items || []).some(item =>
    String(item.variant_id || "") === String(config.shopify.variantId) ||
    String(item.product_id || "") === String(config.shopify.productId)
  );
}
