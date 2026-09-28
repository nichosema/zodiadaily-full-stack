const BACKEND = "https://zodiadaily-full-stack-backend-bc5w.vercel.app";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const response = await fetch(`${BACKEND}/api/reports/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    const text = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/json");
    return res.send(text);
  } catch (error) {
    console.error("Preview proxy error:", error);
    return res.status(502).json({ error: "Backend proxy request failed." });
  }
}
