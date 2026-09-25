const SHOPIFY_CART_URL = "https://edbxvm-tj.myshopify.com/cart/50505266757685:1";
const paymentPanel = document.querySelector("#payment-panel");
const buyReportButton = document.querySelector("#buy-report");
const getPaidPdfButton = document.querySelector("#get-paid-pdf");
const orderIdInput = document.querySelector("#order-id");
const paymentStatus = document.querySelector("#payment-status");

function paymentMessage(message, isError = false) {
  paymentStatus.textContent = message;
  paymentStatus.style.color = isError ? "#a33" : "";
}

buyReportButton.addEventListener("click", () => {
  if (!latestReportInput) {
    paymentMessage("Generate your report preview first.", true);
    return;
  }
  window.open(SHOPIFY_CART_URL, "_blank", "noopener,noreferrer");
  paymentMessage("Shopify checkout opened. Complete payment, then enter the order ID shown by Shopify.");
});

getPaidPdfButton.addEventListener("click", async () => {
  const orderId = orderIdInput.value.trim();
  if (!orderId) {
    paymentMessage("Enter your Shopify order ID first.", true);
    return;
  }
  if (!latestReportInput) {
    paymentMessage("Generate your report preview first so the order uses the correct details.", true);
    return;
  }

  getPaidPdfButton.disabled = true;
  paymentMessage("Checking your order...");
  try {
    const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/report.pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestReportInput)
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
    link.download = `zodiadaily-paid-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    paymentMessage("Order verified. Your paid PDF download has started.");
  } catch (error) {
    paymentMessage(`Verification failed: ${error.message}`, true);
  } finally {
    getPaidPdfButton.disabled = false;
  }
});

const originalReportSubmit = reportForm;
if (originalReportSubmit) {
  reportForm.addEventListener("submit", () => {
    paymentPanel.hidden = false;
    paymentMessage("");
  });
}
