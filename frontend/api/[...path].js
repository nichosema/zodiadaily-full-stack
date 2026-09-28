const BACKEND = "https://zodiadaily-full-stack-backend-bc5w.vercel.app";

export default async function handler(req, res) {
  const path = Array.isArray(req.query?.path) ? req.query.path.join("/") : String(req.query?.path || "");
  const target = new URL(`/api/${path}`, BACKEND);
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key !== "path" && value != null) target.searchParams.set(key, String(value));
  }

  const headers = {};
  if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"];
  if (req.headers["x-shopify-hmac-sha256"]) headers["x-shopify-hmac-sha256"] = req.headers["x-shopify-hmac-sha256"];

  const init = { method: req.method, headers };
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = JSON.stringify(req.body ?? {});
    headers["content-type"] = "application/json";
  }

  try {
    const response = await fetch(target, init);
    const contentType = response.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    res.status(response.status);
    if (req.method === "HEAD") return res.end();
    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (error) {
    console.error("Backend proxy error:", error);
    return res.status(502).json({ error: "Backend proxy request failed." });
  }
}
