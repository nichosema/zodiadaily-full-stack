# ZodiaDaily Full-Stack MVP

ZodiaDaily is a personalized birth-date report website with a Node.js backend.

## Project folders

- `frontend/` - static website suitable for Netlify
- `backend/` - Express API and PDF generator
- `netlify.toml` - Netlify publishing configuration

## Run backend in Codespaces

```bash
cd backend
npm install
cp .env.example .env
npm start
```

Forward port 4000 in GitHub Codespaces and set it to Public.

Copy the public Codespaces URL and update `API_BASE` in `frontend/app.js`.

## Run frontend

The frontend is static. Deploy it to Netlify by selecting `frontend` as the publish directory.

## Important

This is an MVP foundation. Before selling automatically, add a persistent database, payment/order verification, secure report access, email delivery, and production hosting.
