# Learnova payment tracking setup

This integration records buyer interest before Razorpay opens and maintains a
complete event history. It deliberately does **not** trust the browser as proof
of payment.

## Data flow

1. Buyer submits email and phone → `lead_captured` is written immediately.
2. Razorpay opens → `checkout_opened` updates the same lead row.
3. Checkout closes or fails → `checkout_closed` or `payment_failed` records the reason.
4. Razorpay returns its browser callback → `payment_callback_received` records `VERIFYING`, never `PAID`.
5. Your backend verifies the checkout signature and Razorpay webhook.
6. The backend sends a signed envelope to Apps Script → the row becomes `PAID` and verified.

The spreadsheet contains:

- **Payments** — one current-status row per lead/order.
- **Payment Events** — an append-only audit trail of every attempt and update.

## 1. Create the spreadsheet

1. Create or select the Google Sheet that will hold Learnova buyer and payment data.
2. Copy the spreadsheet ID from the URL: the text between `/d/` and `/edit`.
3. Open **Extensions → Apps Script**.
4. Replace the editor contents with `Code.gs` from this folder.

## 2. Add server-only configuration

In Apps Script, open **Project Settings → Script Properties** and add:

- `SHEET_ID` — the spreadsheet ID.
- `SHEET_SYNC_SECRET` — a long random secret used only by Apps Script and your payment backend.

Never put `SHEET_SYNC_SECRET`, the Razorpay Key Secret, or the Razorpay webhook
secret in frontend code, a `VITE_` variable, a public repository, or chat.

## 3. Prepare and deploy Apps Script

1. Select `setupSheets` in the Apps Script toolbar and click **Run** once.
2. Approve the spreadsheet permission.
3. Confirm that **Payments** and **Payment Events** tabs were created.
4. Choose **Deploy → New deployment → Web app**.
5. Set **Execute as** to `Me`.
6. Set access to the option that allows website visitors to call it without a Google login.
7. Deploy and copy the production URL ending in `/exec`—not the `/dev` test URL.
8. Add it as both `VITE_GOOGLE_SCRIPT_URL` (browser events) and
   `GOOGLE_SCRIPT_URL` (signed server events).

## 4. Razorpay configuration

1. Start in Razorpay **Test Mode**.
2. Create an Order on your backend for each payment attempt. For ₹99, send `9900` paise.
3. Pass the returned `order_id` to Standard Checkout.
4. Keep only the Razorpay **Key ID** in the frontend.
5. Keep the **Key Secret** on the backend and verify
   `order_id + "|" + razorpay_payment_id` using HMAC-SHA256.
6. Enable automatic capture in the Razorpay Dashboard.
7. Point Razorpay webhooks to your deployed website's
   `/api/razorpay-webhook` endpoint and enable at least `payment.captured`,
   `payment.failed`, and `order.paid`.
8. Treat a verified/captured server event—not the browser callback—as the authority for fulfilment.

## 5. Browser events to send

The Learnova frontend sends:

- `lead_captured` after local validation, before requesting a Razorpay order.
- `checkout_opened` immediately before `razorpay.open()`.
- `payment_failed` from Razorpay's `payment.failed` event, including error code, description, step, and reason.
- `checkout_closed` from `modal.ondismiss`.
- `payment_callback_received` from the success handler, including order and payment IDs but not the Razorpay signature.

Do not collect or store card numbers, CVV, OTP, full UPI IDs, passwords, or the
Razorpay signature in Google Sheets.

## 6. Signed server event format

Your backend should serialize the trusted event as one JSON string, create a
lowercase hex HMAC-SHA256 signature of that exact string with
`SHEET_SYNC_SECRET`, then POST this envelope to Apps Script:

```json
{
  "payload": "{\"event\":\"payment_captured\",\"lead_id\":\"lead_...\",\"razorpay_order_id\":\"order_...\",\"razorpay_payment_id\":\"pay_...\",\"amount_paise\":9900,\"currency\":\"INR\",\"paid_at\":\"2026-08-24T16:00:00.000Z\"}",
  "signature": "lowercase_hmac_sha256_hex"
}
```

The Apps Script rejects server-only paid/verified events unless this signature
is valid.

## Production launch checklist

- Deploy the site worker and static build to the production host.
- Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
  `SHEET_SYNC_SECRET`, and `GOOGLE_SCRIPT_URL` as server-side host secrets.
- Set `ALLOWED_ORIGIN` to the exact production website origin.
- Put the public Key ID and Apps Script URL in the Vite build variables.
- Configure the deployed `/api/razorpay-webhook` URL in Razorpay.
- Run a real low-risk payment and confirm `PAID`, payment ID, method, and
  timestamps appear in the Sheet before enabling live keys.
- Replace the current sample download content with the final PDFs before launch.
