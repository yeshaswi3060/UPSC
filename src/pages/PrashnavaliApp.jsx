import { useRef, useState } from 'react'
import '../styles/prashnavali.css'

const SECTIONS = [
  {
    label: 'Section A',
    questions: [
      {
        q: 'Q1.',
        text: 'Discuss the constitutional provisions that empower the Election Commission of India to ensure free and fair elections.',
        meta: '(10 marks · 150 words)',
      },
      {
        q: 'Q2.',
        text: 'Examine the role of Panchayati Raj Institutions in strengthening grassroots democracy in India.',
        meta: '(10 marks · 150 words)',
      },
    ],
  },
  {
    label: 'Section B',
    questions: [
      {
        q: 'Q3.',
        text: 'Analyse the impact of judicial activism on the doctrine of separation of powers in India.',
        meta: '(15 marks · 250 words)',
      },
      {
        q: 'Q4.',
        text: 'What are the key challenges in implementing the National Education Policy 2020 at the state level?',
        meta: '(15 marks · 250 words)',
      },
    ],
  },
  {
    label: 'Section C',
    questions: [
      {
        q: 'Q5.',
        text: "Critically evaluate India's foreign policy approach towards its immediate neighbours under the 'Neighbourhood First' policy.",
        meta: '(20 marks · 250 words)',
      },
      {
        q: 'Q6.',
        text: 'Discuss the significance of cooperative federalism in addressing regional economic disparities.',
        meta: '(20 marks · 250 words)',
      },
    ],
  },
]

const STORAGE_KEY = 'prashnavali_purchase'

function loadStoredPurchase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function PrashnavaliApp({
  productTitle = 'General Studies Paper II — Complete Question Set',
  examLabel = 'UPSC Civil Services · Mains',
  price = 99,
}) {
  const checkoutRef = useRef(null)
  const [storedPurchase] = useState(loadStoredPurchase)

  const [screen, setScreen] = useState('landing')
  const [showPurchaseNotice, setShowPurchaseNotice] = useState(Boolean(storedPurchase))
  const [email, setEmail] = useState(storedPurchase?.email ?? '')
  const [phone, setPhone] = useState(storedPurchase?.phone ?? '')
  const [error, setError] = useState('')
  const [viewerPage, setViewerPage] = useState(0)
  const [downloaded, setDownloaded] = useState(false)
  const [order, setOrder] = useState(() => storedPurchase
    ? { id: storedPurchase.orderId, date: storedPurchase.orderDate }
    : null)

  const priceLabel = `₹${price}`

  function goToCheckout() {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handlePay() {
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Enter a valid email address so we can deliver your files.')
      return
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }

    setError('')
    const confirmedOrder = order ?? {
      id: 'PRV-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    }
    setOrder(confirmedOrder)
    setScreen('processing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      setScreen('success')
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: trimmedEmail,
            phone: trimmedPhone,
            orderId: confirmedOrder.id,
            orderDate: confirmedOrder.date,
          }),
        )
      } catch {
        // Purchase remains available in this session if browser storage is unavailable.
      }
    }, 1400)
  }

  function downloadPaper() {
    const content = `PRASHNAVALI\n${examLabel} Examination\n${productTitle}\n\nIncludes: Question Paper, Answer Key, Detailed Solutions\nAmount paid: ₹${price}\nBuyer email: ${email}\nBuyer phone: ${phone}\nOrder: ${order?.id}\n\nThis is a sample deliverable generated for preview purposes.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Prashnavali-GS-Paper-II.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2400)
  }

  if (screen === 'processing') {
    return (
      <div className="pv-page pv-state-page">
        <main className="pv-state-card" aria-live="polite">
          <div className="pv-loader" />
          <span className="pv-eyebrow">Almost there</span>
          <h1>Confirming your payment</h1>
          <p>Please keep this page open. Your question paper will be ready in a moment.</p>
          <div className="pv-processing-line"><span /></div>
        </main>
      </div>
    )
  }

  if (screen === 'success') {
    return (
      <div className="pv-page pv-state-page">
        <main className="pv-success-card">
          <div className="pv-success-mark" aria-hidden="true">✓</div>
          <span className="pv-eyebrow">Purchase complete</span>
          <h1>Your preparation pack is ready.</h1>
          <p className="pv-success-copy">A copy has been prepared for <strong>{email}</strong>. You can download it now or preview it first.</p>

          <div className="pv-order-card">
            <div><span>Order reference</span><strong>{order?.id}</strong></div>
            <div><span>Amount paid</span><strong>{priceLabel}</strong></div>
            <div><span>Purchased on</span><strong>{order?.date}</strong></div>
          </div>

          <div className="pv-delivery-card">
            <div className="pv-file-icon">PDF</div>
            <div><strong>{productTitle}</strong><span>Question paper · Answer key · Detailed solutions</span></div>
          </div>

          <div className="pv-success-actions">
            <button type="button" className="pv-button pv-button-primary" onClick={downloadPaper}>Download all files</button>
            <button type="button" className="pv-button pv-button-secondary" onClick={() => setScreen('viewer')}>Preview paper</button>
          </div>
          {downloaded && <div className="pv-download-note" role="status">Download started successfully.</div>}
          <p className="pv-support-note">Need help? Reply to your delivery email and include order {order?.id}.</p>
        </main>
      </div>
    )
  }

  if (screen === 'viewer') {
    return (
      <div className="pv-page pv-viewer-page">
        <main className="pv-viewer-shell">
          <header className="pv-viewer-header">
            <button type="button" className="pv-icon-button" aria-label="Back to purchase" onClick={() => setScreen('success')}>←</button>
            <div><strong>Question paper preview</strong><span>{productTitle}</span></div>
            <span className="pv-page-count">{viewerPage + 1} / {SECTIONS.length}</span>
          </header>

          <div className="pv-paper-full">
            <div className="pv-paper-heading"><span>Prashnavali</span><h1>{productTitle}</h1><p>{examLabel} Examination</p></div>
            <div className="pv-paper-rule" />
            <span className="pv-paper-section">{SECTIONS[viewerPage].label}</span>
            <div className="pv-question-list">
              {SECTIONS[viewerPage].questions.map((item) => (
                <article key={item.q}><strong>{item.q}</strong><p>{item.text}</p><span>{item.meta}</span></article>
              ))}
            </div>
          </div>

          <footer className="pv-viewer-footer">
            <button type="button" className="pv-button pv-button-secondary" disabled={viewerPage === 0} onClick={() => setViewerPage((p) => Math.max(0, p - 1))}>← Previous</button>
            <button type="button" className="pv-button pv-button-primary" onClick={downloadPaper}>Download PDF</button>
            <button type="button" className="pv-button pv-button-secondary" disabled={viewerPage === SECTIONS.length - 1} onClick={() => setViewerPage((p) => Math.min(SECTIONS.length - 1, p + 1))}>Next →</button>
          </footer>
        </main>
      </div>
    )
  }

  return (
    <div className="pv-page pv-root">
      <header className="pv-header">
        <a className="pv-brand" href="#top" aria-label="Prashnavali home">
          <span className="pv-brand-mark">P</span>
          <span>Prashnavali<small>Practice with purpose</small></span>
        </a>
        <nav className="pv-nav" aria-label="Main navigation">
          <a href="#inside">What’s inside</a><a href="#preview">Preview</a><a href="#faq">FAQ</a>
        </nav>
        <button type="button" className="pv-button pv-button-primary pv-header-cta" onClick={goToCheckout}>Get the paper · {priceLabel}</button>
      </header>

      <main id="top">
        <section className="pv-hero">
          <div className="pv-hero-copy">
            <div className="pv-kicker"><span /> {examLabel} · 2026</div>
            <h1>Master the Mains.<br /><em>One paper at a time.</em></h1>
            <p className="pv-lede">A focused GS Paper II practice set built to help you write sharper answers, identify gaps, and improve before exam day.</p>

            <ul className="pv-hero-points">
              <li><span>✓</span> Exam-style question paper</li>
              <li><span>✓</span> Verified answer key</li>
              <li><span>✓</span> Step-by-step model solutions</li>
            </ul>

            <div className="pv-hero-actions">
              <button type="button" className="pv-button pv-button-primary pv-button-large" onClick={goToCheckout}>Get instant access · {priceLabel}</button>
              <a className="pv-text-link" href="#preview">Preview the paper <span>↓</span></a>
            </div>
            <p className="pv-microcopy">One-time payment · Instant digital access · No subscription</p>
          </div>

          <div className="pv-hero-visual" aria-label="Preview of the General Studies Paper II question set">
            <div className="pv-orbit pv-orbit-one" /><div className="pv-orbit pv-orbit-two" />
            <div className="pv-paper-stack pv-paper-back" /><div className="pv-paper-stack pv-paper-middle" />
            <article className="pv-paper-card">
              <div className="pv-paper-topline"><span>PRASHNAVALI</span><span>GS · II</span></div>
              <div className="pv-paper-title">
                <span>UPSC Civil Services · Mains</span>
                <h2>General Studies<br />Paper II</h2>
                <p>Governance, Constitution, Polity, Social Justice &amp; International Relations</p>
              </div>
              <div className="pv-paper-question"><span>01</span><p>Discuss the constitutional provisions that empower the Election Commission of India…</p></div>
              <div className="pv-paper-question muted"><span>02</span><p>Examine the role of Panchayati Raj Institutions in strengthening grassroots democracy…</p></div>
              <div className="pv-paper-footer"><span>Question paper</span><span>Answer key</span><span>Solutions</span></div>
            </article>
            <div className="pv-price-seal"><small>Only</small><strong>{priceLabel}</strong><span>once</span></div>
          </div>
        </section>

        <section className="pv-proof-strip" aria-label="Product assurances">
          <div><strong>01</strong><span>Built for focused<br />self-evaluation</span></div>
          <div><strong>PDF</strong><span>Easy to read,<br />save and print</span></div>
          <div><strong>3×</strong><span>Paper, key and<br />guided solutions</span></div>
          <div><strong>∞</strong><span>Lifetime access<br />after purchase</span></div>
        </section>

        <section className="pv-section pv-value-section" id="inside">
          <div className="pv-section-heading">
            <span className="pv-eyebrow">Everything you need</span>
            <h2>Not just questions.<br />A complete practice loop.</h2>
            <p>Attempt the paper honestly, check your approach, then study the reasoning behind a stronger answer.</p>
          </div>

          <div className="pv-value-grid">
            <ValueCard number="01" label="Attempt" title="Exam-style question paper" copy="A clean, distraction-free paper structured by marks and word limits, ready to print or use digitally." />
            <ValueCard number="02" label="Check" title="Verified answer key" copy="Clear answer directions that help you spot missing concepts and evaluate your own response objectively." featured />
            <ValueCard number="03" label="Improve" title="Detailed model solutions" copy="Step-by-step structure, key arguments and reasoning you can use to write more complete answers next time." />
          </div>
        </section>

        <section className="pv-section pv-preview-section" id="preview">
          <div className="pv-preview-copy">
            <span className="pv-eyebrow">See before you buy</span>
            <h2>A serious paper for serious practice.</h2>
            <p>You should know what you’re paying for. Here’s a real question from the set, including its marks and expected answer length.</p>
            <div className="pv-preview-meta">
              <div><strong>6</strong><span>Curated questions</span></div><div><strong>90</strong><span>Total marks</span></div><div><strong>3</strong><span>Downloadable files</span></div>
            </div>
            <button type="button" className="pv-button pv-button-dark" onClick={goToCheckout}>Unlock the complete set · {priceLabel}</button>
          </div>

          <div className="pv-preview-paper">
            <div className="pv-preview-paper-head"><span>Sample question</span><span>GS Paper II</span></div>
            <span className="pv-question-number">01</span>
            <h3>Discuss the constitutional provisions that empower the Election Commission of India to ensure free and fair elections.</h3>
            <div className="pv-question-meta"><span>10 marks</span><span>150 words</span><span>12 min suggested</span></div>
            <div className="pv-answer-lines"><i /><i /><i /><i /><i /></div>
            <div className="pv-fade-lock"><span>＋</span><strong>Answer guidance included</strong><small>Available in the complete set</small></div>
          </div>
        </section>

        <section className="pv-section pv-checkout-section" ref={checkoutRef} id="checkout">
          <div className="pv-checkout-copy">
            <span className="pv-eyebrow light">Start practising today</span>
            <h2>One small investment.<br />A more confident attempt.</h2>
            <p>Get the full question paper, answer key, and detailed solutions immediately after payment.</p>
            <div className="pv-guarantee-list"><span><b>✓</b> One-time payment</span><span><b>✓</b> Immediate download</span><span><b>✓</b> Access from any device</span></div>
          </div>

          <div className="pv-checkout-card">
            <div className="pv-checkout-heading">
              <div><span>Complete preparation pack</span><strong>{productTitle}</strong></div>
              <div className="pv-checkout-price"><strong>{priceLabel}</strong><span>INR</span></div>
            </div>
            <div className="pv-included-list"><span><b>PDF</b> Question paper</span><span><b>KEY</b> Verified answer key</span><span><b>SOL</b> Detailed solutions</span></div>
            <div className="pv-form-grid">
              <label htmlFor="pv-email">Email for delivery<input id="pv-email" className="pv-input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label htmlFor="pv-phone">Mobile number<input id="pv-phone" className="pv-input" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit number" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
            </div>
            {error && <div className="pv-form-error" role="alert">{error}</div>}
            <button type="button" className="pv-button pv-button-primary pv-pay-button" onClick={handlePay}>Pay {priceLabel} &amp; get instant access <span>→</span></button>
            <div className="pv-payment-note"><span>◇</span> One-time payment · Files delivered to your email</div>
          </div>
        </section>

        <section className="pv-section pv-how-section">
          <div className="pv-section-heading centered"><span className="pv-eyebrow">Simple by design</span><h2>From purchase to practice in minutes.</h2></div>
          <div className="pv-steps">
            <div><span>1</span><strong>Complete payment</strong><p>Enter your delivery details and make one simple payment.</p></div>
            <div><span>2</span><strong>Get instant access</strong><p>Download the paper, answer key and solutions right away.</p></div>
            <div><span>3</span><strong>Attempt and improve</strong><p>Write your answers, compare your approach and close the gaps.</p></div>
          </div>
        </section>

        <section className="pv-section pv-faq-section" id="faq">
          <div className="pv-section-heading"><span className="pv-eyebrow">Questions, answered</span><h2>Know exactly<br />what you’re getting.</h2></div>
          <div className="pv-faq-list">
            <Faq question="What exactly will I receive?">You’ll receive three downloadable files: the complete GS Paper II question set, a verified answer key, and detailed model solutions.</Faq>
            <Faq question="How will the files be delivered?">Your files become available immediately after payment and are also prepared for delivery to the email address you enter at checkout.</Faq>
            <Faq question="Is this a subscription?">No. The price shown is a one-time payment for this preparation pack. There are no recurring charges.</Faq>
            <Faq question="Can I use the files on my phone?">Yes. The PDFs are designed to work on phones, tablets, and computers, and can also be printed for offline practice.</Faq>
          </div>
        </section>

        <section className="pv-final-cta">
          <span className="pv-eyebrow light">Your next answer can be better</span>
          <h2>Practise with a plan.<br /><em>Write with confidence.</em></h2>
          <button type="button" className="pv-button pv-button-cream pv-button-large" onClick={goToCheckout}>Get the complete paper · {priceLabel}</button>
          <p>Instant access · One-time payment · Keep it forever</p>
        </section>
      </main>

      <footer className="pv-footer">
        <a className="pv-brand" href="#top"><span className="pv-brand-mark">P</span><span>Prashnavali<small>Practice with purpose</small></span></a>
        <p>Focused practice resources for aspirants who want to write better answers.</p>
        <span>© 2026 Prashnavali</span>
      </footer>

      <div className="pv-mobile-buybar">
        <div><small>Complete pack</small><strong>{priceLabel} <span>one time</span></strong></div>
        <button type="button" className="pv-button pv-button-primary" onClick={goToCheckout}>Get instant access</button>
      </div>

      {showPurchaseNotice && (
        <aside className="pv-purchase-notice" role="dialog" aria-labelledby="purchase-notice-title" aria-describedby="purchase-notice-copy">
          <button type="button" className="pv-notice-close" aria-label="Dismiss purchase notice" onClick={() => setShowPurchaseNotice(false)}>×</button>
          <div className="pv-notice-mark" aria-hidden="true">✓</div>
          <div className="pv-notice-copy">
            <span>Welcome back</span>
            <strong id="purchase-notice-title">You already own this pack.</strong>
            <p id="purchase-notice-copy">Your paper, answer key and solutions are ready whenever you need them.</p>
          </div>
          <button type="button" className="pv-button pv-button-primary" onClick={() => setScreen('success')}>View &amp; download <span>→</span></button>
        </aside>
      )}
    </div>
  )
}

function ValueCard({ number, label, title, copy, featured = false }) {
  return (
    <article className={`pv-value-card${featured ? ' featured' : ''}`}>
      <div className="pv-value-number">{number}</div><span>{label}</span><h3>{title}</h3><p>{copy}</p><div className="pv-value-tick">✓</div>
    </article>
  )
}

function Faq({ question, children }) {
  return <details className="pv-faq-item"><summary>{question}<span>＋</span></summary><p>{children}</p></details>
}

export default PrashnavaliApp
