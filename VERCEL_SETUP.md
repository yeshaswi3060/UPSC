# Deploy Learnova on Vercel

## Environment variables

The complete private values are already stored locally in `vercel.env.local`.
That file is ignored by Git and must never be committed or shared publicly.

In Vercel, open **Project → Settings → Environment Variables** and add every
non-empty variable from `vercel.env.local` to **Production**, **Preview**, and
**Development**. Mark these three variables as Sensitive:

- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SHEET_SYNC_SECRET`

The `VITE_` variables are intentionally public because Vite embeds them in the
browser build. Never add the Razorpay Key Secret or sync secret with a `VITE_`
prefix.

After adding or changing variables, redeploy the project because Vercel applies
new values only to new deployments.

## Vercel project settings

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The repository includes Vercel Functions for:

- `/api/create-order`
- `/api/verify-payment`
- `/api/razorpay-webhook`
- `/api/payment-health`

## After the first deployment

1. Open `https://YOUR-DOMAIN/api/payment-health` and confirm the response says
   `"mode":"test"`.
2. In Razorpay Test Mode, add a webhook pointing to
   `https://YOUR-DOMAIN/api/razorpay-webhook`.
3. Use the same value stored as `RAZORPAY_WEBHOOK_SECRET` for that webhook.
4. Enable `payment.captured`, `payment.failed`, and `order.paid`.
5. Make a ₹99 test payment and confirm the buyer and payment appear in the
   Google Sheet before switching to live keys.
