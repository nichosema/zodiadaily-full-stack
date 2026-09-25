# ZodiaDaily Launch Checklist

## Completed in the launch branch

- Added a clearer homepage description and meta description.
- Added launch-ready benefit cards.
- Added a coming-soon section for visitors while payments are pending.
- Added launch-specific responsive styling.
- Kept the existing report-generation and Shopify integration files intact.

## Before accepting real payments

- [ ] Complete Shopify identity and payment-provider verification.
- [ ] Confirm the product is configured as digital/non-shipping.
- [ ] Test a complete paid Shopify order in a controlled environment.
- [ ] Verify the backend checks payment status before issuing a PDF.
- [ ] Replace any in-memory order state with durable storage.
- [ ] Use signed or expiring download links.
- [ ] Add privacy policy, terms, refund policy, and support contact.
- [ ] Confirm that customer data is not logged unnecessarily.
- [ ] Test failed, cancelled, refunded, and duplicate webhook events.
- [ ] Deploy and verify the production frontend and backend URLs.

## Marketing preparation

- Prepare one fictional sample report.
- Prepare five social posts and two short product demonstrations.
- Explain that interpretations are symbolic and for reflection/entertainment.
- Do not claim sales, testimonials, or scientific accuracy without evidence.
- Track visits, previews, add-to-cart actions, completed purchases, and delivery failures.

## Payment limitation

Payment activation must use the official Shopify/payment-provider verification process. Do not bypass identity checks or collect real customer payments before the payment flow is approved and tested.
