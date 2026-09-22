# CivilPrelims: full redesign map

```mermaid
mindmap
  root((CivilPrelims))
    Phone-first landing
      Clear product in first screen
        One PDF paper
        Explained answers
        Subject tests
        One-time price ₹99
      Visible buy action
        Hero button
        Sticky phone bar
        Offer card
      Evidence before purchase
        Paper visual
        Interactive sample question
        What's included
        How access works
        FAQs and independent status
      Visual direction
        Deep pine green
        Warm paper
        Coral action color
        Editorial serif with legible sans
        Strong spacing and mobile type
    Purchase and access
      Email and Indian mobile form
      Server-created payment order
      Razorpay checkout
      Server signature and captured-payment check
      Webhook for delayed capture
      Email access code
      Student sign in
      Protected PDF and tests
    Student journey
      Library
        Read PDF
        Download PDF
        Pick a subject
      Dedicated test page
        Answer and navigate
        Submit for server score
        Review explanations
        Repeat
      Profile
        Today and 7-day score
        Total attempts and average
        Subject progress
        Attempt history
        Product updates
    Admin
      Offer
        Change price and copy
        Replace main PDF
      Content
        Add edit delete questions
        Publish student updates
      Insights
        Visitors and page views
        Buy clicks and checkout starts
        Interested visitors without purchase
        Daily funnel and revenue
        Real vs test orders
      Students
        Purchases and contact details
        Test counts and scores
        Last activity
        Individual test and PDF activity
    Quality and trust
      Direct routes and browser history
      Responsive phone tablet desktop
      Honest demo labels
      No fabricated testimonials or counters
      Entitlement checks on server
      Persistent state and backup plan
      Real reviewed paper before launch
```

## Audit: what changed

| Area | Previous problem | Current decision |
| --- | --- | --- |
| Positioning | Vague prediction claims and weak product clarity | Name the PDF, explanations and tests at the top; put ₹99 beside the primary action |
| Mobile hierarchy | Landing felt too simple but also required too much hunting | Distinct editorial hero, paper preview, benefit strip and persistent phone purchase bar |
| Visual system | Generic gradients, glass cards and unrelated accents | Pine, warm paper and coral; bold sans headings mixed with a restrained editorial serif |
| Trust | Invented social proof and urgency undermined confidence | Show a real interactive sample and explicitly state independent UPSC practice status |
| Checkout | Simulated payment risked appearing real | Local mode visibly says no charge; live mode requires server verification and a finished PDF |
| Account | No lasting buyer identity or return path | Purchase email + access code, protected library and dedicated profile |
| Tests | Short unsaved demo practice | Separate subject routes, server-graded submissions and saved daily history |
| Admin | Mock counters and disconnected editing | Persistent offer, PDF, question, update, student and traffic controls |
| Analytics | No way to inspect interest or drop-off | First-party visitor and buy-click events, checkouts, paid conversion and daily revenue |
| Routing | UI state could lose place on refresh | Shareable `/library`, `/profile`, `/test/:subjectId` and `/admin` routes |

## User flow

```mermaid
flowchart LR
    A[Phone landing] --> B[Understand paper + tests + ₹99]
    B --> C[Try sample and read FAQ]
    B --> D[Tap Get paper]
    C --> D
    D --> E[Enter email and mobile]
    E --> F[Pay in Razorpay]
    F --> G{Server confirms capture}
    G -->|Yes| H[Access code and email]
    G -->|Pending| I[Wait for confirmation]
    H --> J[Student library]
    J --> K[Read or download PDF]
    J --> L[Choose subject test]
    L --> M[Submit and review]
    M --> N[Profile daily progress]
    H --> O[Return later with email + code]
    O --> J
```

## Launch work that needs owner materials

1. Upload a reviewed, complete paper through Admin. The included PDF is a 3-question **local test document**.
2. Supply live Razorpay, Resend, admin password, public URL and session secret values from `.env.example`.
3. Host the Node server with persistent private storage and backups. A multi-server deployment needs shared storage before accepting buyers.
4. Publish accurate support/contact, privacy, refund and purchase terms that match the business. Avoid making claims about results or affiliation.
5. Test an actual small live payment, delayed payment webhook, email delivery, return login, PDF access and refund handling in the owner's gateway account before public launch.
