const SHOPIFY_CART_URL = "https://edbxvm-tj.myshopify.com/cart/50505266757685:1";
const paymentPanel = document.querySelector("#payment-panel");
const buyReportButton = document.querySelector("#buy-report");
const getPaidPdfButton = document.querySelector("#get-paid-pdf");
const customerEmailInput = document.querySelector("#customer-email");
const paymentStatus = document.querySelector("#payment-status");
const deliveryStatus = document.querySelector("#delivery-status");
let activePurchaseToken = localStorage.getItem("zodia_purchase_token") || "";
let paymentPollTimer = null;

function paymentMessage(message, isError = false) {
  paymentStatus.textContent = message;
  paymentStatus.style.color = isError ? "#a33" : "";
}

function deliveryMessage(message, isError = false) {
  deliveryStatus.textContent = message;
  deliveryStatus.style.color = isError ? "#a33" : "";
}

async function checkPurchaseStatus() {
  if (!activePurchaseToken) return false;
  try {
    const response = await fetch(`${API_BASE}/api/purchase-sessions/${encodeURIComponent(activePurchaseToken)}/status`);
    const data = await response.json();
    if (data.readyForDelivery) {
      deliveryMessage("Payment confirmed. Your full report is ready.");
      getPaidPdfButton.hidden = false;
      return true;
    }
    deliveryMessage("Waiting for Shopify to confirm your payment...");
  } catch {
    deliveryMessage("Still checking your payment...");
  }
  return false;
}

function startPurchasePolling() {
  if (paymentPollTimer) clearInterval(paymentPollTimer);
  checkPurchaseStatus();
  paymentPollTimer = setInterval(async () => {
    const ready = await checkPurchaseStatus();
    if (ready) clearInterval(paymentPollTimer);
  }, 3000);
}

buyReportButton.addEventListener("click", async () => {
  if (!latestReportInput) {
    paymentMessage("Generate your report preview first.", true);
    return;
  }
  const customerEmail = customerEmailInput?.value.trim() || "";
  if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
    paymentMessage("Enter the email address you will use at Shopify checkout.", true);
    return;
  }
  latestReportInput.customerEmail = customerEmail;
  buyReportButton.disabled = true;
  paymentMessage("Preparing your personalized checkout...");
  try {
    const response = await fetch(`${API_BASE}/api/purchase-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestReportInput)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed with status ${response.status}`);
    activePurchaseToken = data.token;
    localStorage.setItem("zodia_purchase_token", activePurchaseToken);
    window.open(data.checkoutUrl || SHOPIFY_CART_URL, "_blank", "noopener,noreferrer");
    paymentMessage("Checkout opened. Complete payment, then return to this page. Your report will unlock automatically.");
    startPurchasePolling();
  } catch (error) {
    paymentMessage(`Could not prepare checkout: ${error.message}`, true);
  } finally {
    buyReportButton.disabled = false;
  }
});

getPaidPdfButton.addEventListener("click", async () => {
  if (!activePurchaseToken) {
    paymentMessage("Your purchase session is not available. Please start checkout again.", true);
    return;
  }
  getPaidPdfButton.disabled = true;
  paymentMessage("Preparing your full report...");
  try {
    const response = await fetch(`${API_BASE}/api/purchase-sessions/${encodeURIComponent(activePurchaseToken)}/report.pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      let message = await response.text();
      try { message = JSON.parse(message).error || message; } catch {}
      throw new Error(message || `Request failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "zodiadaily-full-report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    paymentMessage("Your full personalized PDF is ready.");
  } catch (error) {
    paymentMessage(`Download failed: ${error.message}`, true);
  } finally {
    getPaidPdfButton.disabled = false;
  }
});

if (activePurchaseToken) startPurchasePolling();

const originalReportSubmit = reportForm;
if (originalReportSubmit) {
  reportForm.addEventListener("submit", () => {
    paymentPanel.hidden = false;
    paymentMessage("");
  });
}
