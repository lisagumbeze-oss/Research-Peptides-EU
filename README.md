<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e25dc43f-a22b-4a95-973e-833a3f2bdc84

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel Deployment (frontend + email functions)

This project deploys as a Vite SPA plus Vercel serverless routes under `api/email/*`.

### Required environment variables (Vercel Project Settings)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `EMAIL_ADMIN_TO` (single admin inbox)
- Optional: `EMAIL_BRAND_NAME`, `EMAIL_SUPPORT_ADDRESS`, `EMAIL_DRY_RUN`

### DB setup before launch

Run migrations against Supabase so admin/order/product flows work:

```bash
npm run db:migrate
```
