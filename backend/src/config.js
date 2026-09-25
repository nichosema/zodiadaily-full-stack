import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendUrl: process.env.FRONTEND_URL || "*",
  databaseUrl: process.env.DATABASE_URL || "",
  ai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    baseUrl: (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.AI_MODEL || "gpt-4o-mini"
  },
  shopify: {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN || "",
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || "",
    productId: process.env.SHOPIFY_PRODUCT_ID || "",
    variantId: process.env.SHOPIFY_VARIANT_ID || ""
  }
};
