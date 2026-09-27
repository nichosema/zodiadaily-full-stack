# ZodiaDaily Full-Stack MVP

ZodiaDaily is a personalized birth-date report website with a Node.js backend, multiple report editions, AI narrative support, PDF generation, and a Shopify webhook foundation.

## Project folders

- `frontend/` - static website deployed on Vercel
- `backend/` - Express API, report builder, AI narrative engine, PDF generator, and Shopify webhook endpoint
- `netlify.toml` - legacy Netlify configuration

## Run backend in Codespaces

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Forward port **4000** in GitHub Codespaces and set it to **Public**.

Copy the public Codespaces URL and update `API_BASE` in `frontend/app.js` if the URL changes.

## Environment variables

Set these in `backend/.env`. Do not commit this file:

```env
PORT=4000
FRONTEND_URL=*
OPENAI_API_KEY=your_server_side_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
SHOPIFY_STORE_DOMAIN=edbxvm-tj.myshopify.com
SHOPIFY_WEBHOOK_SECRET=your_shopify_webhook_secret
SHOPIFY_PRODUCT_ID=10307224895541
SHOPIFY_VARIANT_ID=50505266757685
```

For an initial test, `FRONTEND_URL=*` allows browser requests from the deployed frontend. Restrict this to your real frontend domain before production.

## Shopify webhook foundation

The backend endpoint is:

```text
POST /webhooks/shopify/orders-create
```

The webhook validates the Shopify HMAC signature, checks whether the order is paid, checks whether the configured product or variant was purchased, and stores a short-lived in-memory order status.

You can inspect a recorded order using:

```text
GET /api/orders/{SHOPIFY_ORDER_ID}/status
```

This is not yet a complete delivery system. Before charging customers automatically, add persistent storage, checkout fields for the report information, secure customer access, and email or download delivery. The current in-memory status is lost whenever the backend restarts.

## Frontend deployment

Deploy the `frontend` directory to Vercel with the project root set to `frontend`. After pulling new GitHub commits, redeploy the Vercel project and hard-refresh the browser.

## Important

This is still an MVP foundation. Test the complete flow in Shopify test mode before making the product live:

1. Customer selects an edition.
2. Customer submits the required birth-date information.
3. Customer completes the Shopify payment.
4. Shopify sends the signed order webhook.
5. Backend records the payment and product match.
6. A future delivery layer will generate and securely deliver the purchased report.

## Production backend deployment on Vercel

The backend is now Vercel-compatible. Deploy the **`backend/` directory** as its own Vercel project.

Set these Vercel environment variables for Production:

- `FRONTEND_URL` = your live ZodiaDaily frontend URL
- `DATABASE_URL` = your Supabase PostgreSQL connection string
- `OPENAI_API_KEY` = your server-side AI key
- `AI_BASE_URL` = `https://api.openai.com/v1`
- `AI_MODEL` = your selected model
- `SHOPIFY_STORE_DOMAIN` = `edbxvm-tj.myshopify.com`
- `SHOPIFY_WEBHOOK_SECRET` = your existing Shopify webhook secret
- `SHOPIFY_PRODUCT_ID` = `10307224895541`
- `SHOPIFY_VARIANT_ID` = `50505266757685`

After deployment, open the backend's `/health` URL and confirm `ok: true`, `databaseConfigured: true`, and `shopifyWebhookConfigured: true`.

Then set the frontend's `ZODIADAILY_API_BASE` value to the new backend URL. The frontend already reads this value before falling back to the temporary Codespaces URL.

For Shopify, keep the existing `orders/create` webhook and change its destination to:

```
https://YOUR-PRODUCTION-BACKEND-DOMAIN/webhooks/shopify/orders-create
```

Do not create a second webhook for the same event.

### Production sequence

1. Deploy `backend/` to Vercel.
2. Add the production environment variables.
3. Verify `/health`.
4. Point the existing Shopify webhook at the production backend.
5. Point the frontend at the production backend URL.
6. Redeploy the frontend.
7. Run the existing `npm run test:smoke` locally before enabling paid checkout.
