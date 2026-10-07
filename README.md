# BGMI Skins Store - Divine Pay Gateway Integration

A modern, fast BGMI Skins & UC Store built with React, Vite, Tailwind CSS, Express, and Vercel Serverless Functions, integrated with Divine Pay Payment Gateway.

## Features
- **Divine Pay Gateway**: Instant Pay-in order creation and redirection to secure cashier gateway.
- **UTR Submission**: Manual payment verification endpoint `/api/submit-utr`.
- **Vercel Serverless Support**: Deployable directly to Vercel with zero-config serverless API routes (`api/*.ts`).
- **Live Localhost Host**: Ready for local development with `npm run dev` (`tsx server.ts`).

## Deployment on Vercel
1. Push to GitHub (`https://github.com/aviraj983/eliteskins-divinepay`).
2. Import repository in Vercel.
3. Add Environment Variables in Vercel Dashboard:
   - `DIVINEPAY_API_KEY`: `<YOUR_DIVINEPAY_LIVE_SECRET_KEY>`
   - `DIVINEPAY_PAYIN_URL`: `https://divinepay.us.cc/api/payin/payin/create`
   - `DIVINEPAY_UTR_URL`: `https://divinepay.us.cc/api/payin/submit-utr`
4. Click **Deploy**.
