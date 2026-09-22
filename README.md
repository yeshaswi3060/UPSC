# CivilPrelims

A phone-first UPSC Prelims practice site. The landing page presents one ₹99 practice kit; students can pay, open the paper PDF, take subject tests, and see their progress. Admin can manage the offer and review traffic, purchases and student activity.

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5174/`. With no payment credentials, the site runs **local test checkout**: it creates test orders without charging anyone. A clearly marked 3-question demo PDF is copied to the private data directory for this mode. The admin tab has an **Open local test admin** button when run on loopback.

For a production build:

```sh
npm run build
npm start
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product, ₹99 offer, sample question, checkout |
| `/login` | Student email + access code or admin password |
| `/library` | Purchased PDF and subject test cards |
| `/test/:subjectId` | Separate test, server-graded score and review |
| `/profile` | Daily scores, subject progress, attempts and updates |
| `/admin` | Traffic, revenue, students, PDF, price, questions and updates |

## Payment and access

The browser requests a new order from the server. In live mode Razorpay opens for that order. The server verifies the Razorpay signature and fetches the captured payment before granting access. A signed webhook is a second path for a delayed captured payment. The access code is shown at checkout and sent to the buyer's email through Resend. Students return with their purchase email and access code. The PDF and test APIs check purchase entitlement on every request.

Copy `.env.example` to `.env.local` and add real values before enabling live checkout. **Live checkout stays unavailable** until all required settings are present and admin uploads a finished PDF that differs from the demo file. Use a persistent `DATA_DIR` on a single long-running Node host; this implementation stores orders, scores and analytics in that directory. A stateless or multi-instance deployment needs a shared database and file store first.

The current local environment also contains the Firebase web configuration from the existing **All-cloths** project (`mango-tree-tech`) in `.env.local` and `src/lib/firebaseConfig.js`. Firebase web keys are public client configuration; keep server secrets such as payment and email credentials in server-only environment variables. When a fresh Firebase project is available, replace the `VITE_FIREBASE_*` values together.

The generated PDF in `output/pdf/civilprelims-demo-paper.pdf` is a local test document with only three questions. Replace it in Admin → Price & PDF with your reviewed paper before taking payments. The site labels test checkout and test orders and excludes them from revenue.

## Analytics definitions

- **Unique visitors:** distinct browser cookies with a page view in the chosen period. Admin activity is excluded. One person on multiple browsers can count more than once.
- **Buy clicks:** distinct visitors who tapped a purchase button.
- **Clicked buy, no purchase:** those visitors without any real paid order. Test orders do not count as real purchases.
- **Checkouts started:** orders created after the email and mobile form.
- **Purchases / revenue:** verified captured live orders and their actual order amounts. The reporting period is 7, 30, 90 or 365 days; days use India Standard Time.
- **Student activity:** server-recorded test completions, scores, PDF opens/downloads, and order events. The profile's daily score combines all completed tests for that day.

See [REDESIGN_MINDMAP.md](REDESIGN_MINDMAP.md) for the audit, user journey and launch map.
