// Use the public backend in production. Keep Codespaces on its existing same-origin/local API behavior.
const isVercelFrontend = window.location.hostname.endsWith(".vercel.app");
window.ZODIADAILY_API_BASE = isVercelFrontend
  ? "https://zodiadaily-full-stack-backend-r2k3-dc46zpf45-azume2.vercel.app"
  : "";
