import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "*",
  shopify: {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || "",
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || "",
    productId: process.env.SHOPIFY_PRODUCT_ID || "",
    variantId: process.env.SHOPIFY_VARIANT_ID || ""
  }
};
