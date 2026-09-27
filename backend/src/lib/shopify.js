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

function normalizeShopifyId(value, type) {
  return String(value || "")
    .replace(new RegExp(\`^gid://shopify/\${type}/\`), "")
    .trim();
}

export function containsProduct(order) {
  const configuredVariant = normalizeShopifyId(config.shopify.variantId, "ProductVariant");
  const configuredProduct = normalizeShopifyId(config.shopify.productId, "Product");

  return (order?.line_items || []).some(item => {
    const variant = normalizeShopifyId(item.variant_id, "ProductVariant");
    const product = normalizeShopifyId(item.product_id, "Product");
    return Boolean((configuredVariant && variant === configuredVariant) ||
      (configuredProduct && product === configuredProduct));
  });
}
