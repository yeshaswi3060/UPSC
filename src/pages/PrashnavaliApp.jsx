import { useRef, useState } from 'react'
import { beginRazorpayCheckout, verifyRazorpayPayment } from '../lib/razorpay.js'
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

const STORAGE_KEY = 'learnova_purchase'

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
  const [paymentBusy, setPaymentBusy] = useState(false)
  const [order, setOrder] = useState(() => storedPurchase
    ? { id: storedPurchase.orderId, date: storedPurchase.orderDate }
    : null)

  const priceLabel = `₹${price}`

  function goToCheckout() {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handlePay() {
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
    setPaymentBusy(true)

    try {
      const checkout = await beginRazorpayCheckout({
        email: trimmedEmail,
        phone: trimmedPhone,
      })

      if (checkout.status === 'dismissed') {
        setError('Payment was not completed. Your details are saved—you can try again anytime.')
        return
      }
      if (checkout.status === 'failed') {
        setError(checkout.error)
        return
      }

      setScreen('processing')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      const verification = await verifyRazorpayPayment(checkout.response, checkout.leadId)
      if (!verification.paid) {
        throw new Error('Payment was received but is still awaiting capture. Please try again in a moment.')
      }

      const confirmedOrder = {
        id: verification.order_id,
        paymentId: verification.payment_id,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      }
      setOrder(confirmedOrder)
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            email: trimmedEmail,
            phone: trimmedPhone,
            orderId: confirmedOrder.id,
            orderDate: confirmedOrder.date,
            paymentId: confirmedOrder.paymentId,
          }),
        )
      } catch {
        // Purchase remains available in this session if browser storage is unavailable.
      }
      setScreen('success')
    } catch (paymentError) {
      setScreen('landing')
      setError(paymentError.message || 'Payment could not be completed. Please try again.')
      setTimeout(goToCheckout, 0)
    } finally {
      setPaymentBusy(false)
    }
  }

  function downloadPaper() {
    const content = `LEARNOVA\n${examLabel} Examination\n${productTitle}\n\nIncludes: Question Paper, Answer Key, Detailed Solutions\nAmount paid: ₹${price}\nBuyer email: ${email}\nBuyer phone: ${phone}\nOrder: ${order?.id}\n\nThis is a sample deliverable generated for preview purposes.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Learnova-GS-Paper-II.txt'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2400)
  }

  if (screen === 'processing') {
    return (
      <div className="pv-flow-page">
        <FlowHeader label="Checkout in progress" />
        <main className="pv-processing-layout" aria-live="polite">
          <section className="pv-processing-copy">
            <span className="pv-flow-eyebrow">Preparing your library</span>
            <h1>Your payment is being confirmed.</h1>
            <p>Please keep this page open. We’re creating your order and preparing all three files for immediate access.</p>
            <div className="pv-processing-steps">
              <div className="complete"><span>✓</span><p><strong>Details received</strong><small>Your delivery information is ready</small></p></div>
              <div className="active"><span><i /></span><p><strong>Confirming payment</strong><small>This usually takes only a few seconds</small></p></div>
              <div><span>3</span><p><strong>Unlocking your files</strong><small>Paper, key and solutions</small></p></div>
            </div>
          </section>
          <aside className="pv-processing-order">
            <div className="pv-loader"><span>₹</span></div>
            <span>Order total</span>
            <strong>{priceLabel}</strong>
            <p>{productTitle}</p>
            <div className="pv-processing-line"><span /></div>
            <small>Do not refresh or close this page</small>
          </aside>
        </main>
      </div>
    )
  }

  if (screen === 'success') {
    return (
      <div className="pv-flow-page">
        <FlowHeader label="Your library" onHome={() => { setScreen('landing'); setShowPurchaseNotice(false) }} />
        <main className="pv-library-page">
          <section className="pv-library-hero">
            <div className="pv-library-title">
              <div className="pv-success-mark" aria-hidden="true">✓</div>
              <div>
                <span className="pv-flow-eyebrow">Purchase complete</span>
                <h1>Your preparation pack is ready.</h1>
                <p>Everything is unlocked and ready for <strong>{email}</strong>. Start with the timed paper, then use the key and solutions to evaluate your attempt.</p>
              </div>
            </div>
            <aside className="pv-order-summary">
              <span>Order summary</span>
              <div><small>Reference</small><strong>{order?.id}</strong></div>
              <div><small>Purchased</small><strong>{order?.date}</strong></div>
              <div><small>Total paid</small><strong>{priceLabel}</strong></div>
            </aside>
          </section>

          <section className="pv-library-content">
            <div className="pv-library-heading">
              <div><span className="pv-flow-eyebrow">Your files</span><h2>General Studies Paper II</h2></div>
              <button type="button" className="pv-button pv-button-primary" onClick={downloadPaper}>Download complete pack <span>↓</span></button>
            </div>
            <div className="pv-library-files">
              <LibraryFile type="PDF" number="01" title="Question paper" meta="6 questions · 90 marks" action="Open reader" onClick={() => setScreen('viewer')} featured />
              <LibraryFile type="KEY" number="02" title="Verified answer key" meta="Answer directions · PDF" action="Download" onClick={downloadPaper} />
              <LibraryFile type="SOL" number="03" title="Detailed solutions" meta="Model structure · PDF" action="Download" onClick={downloadPaper} />
            </div>
            {downloaded && <div className="pv-download-note" role="status">Your download has started successfully.</div>}
          </section>

          <section className="pv-library-next">
            <span className="pv-flow-eyebrow">A better way to practise</span>
            <h2>Attempt. Evaluate. Improve.</h2>
            <div>
              <p><span>1</span><strong>Set a timer</strong><small>Attempt the paper without opening the key.</small></p>
              <p><span>2</span><strong>Review honestly</strong><small>Mark the concepts and structure you missed.</small></p>
              <p><span>3</span><strong>Rewrite once</strong><small>Apply the model approach while it is fresh.</small></p>
            </div>
          </section>

          <footer className="pv-library-footer">
            <p>Need help with your order? Include reference <strong>{order?.id}</strong> when contacting support.</p>
            <button type="button" className="pv-flow-link" onClick={() => { setScreen('landing'); setShowPurchaseNotice(false) }}>← Return to storefront</button>
          </footer>
        </main>
      </div>
    )
  }

  if (screen === 'viewer') {
    return (
      <div className="pv-reader-page">
        <header className="pv-reader-header">
          <button type="button" className="pv-reader-brand" onClick={() => setScreen('success')}><span>L</span><strong>Learnova</strong></button>
          <div className="pv-reader-document"><span>Reading</span><strong>General Studies Paper II</strong></div>
          <div className="pv-reader-actions"><span className="pv-owned-pill">✓ Purchased</span><button type="button" className="pv-button pv-button-primary" onClick={downloadPaper}>Download PDF ↓</button></div>
        </header>

        <main className="pv-reader-layout">
          <aside className="pv-reader-sidebar">
            <button type="button" className="pv-flow-link" onClick={() => setScreen('success')}>← Back to your files</button>
            <div className="pv-reader-cover"><span>LEARNOVA</span><strong>GS<br />Paper II</strong><small>Practice Set · 2026</small></div>
            <div className="pv-reader-details"><span>Document</span><h2>Question paper</h2><p>{productTitle}</p></div>
            <div className="pv-reader-sections">
              <span>Sections</span>
              {SECTIONS.map((section, index) => (
                <button type="button" className={viewerPage === index ? 'active' : ''} key={section.label} onClick={() => setViewerPage(index)}><span>{String(index + 1).padStart(2, '0')}</span>{section.label}<small>{section.questions.length} questions</small></button>
              ))}
            </div>
            <div className="pv-reader-tip"><span>Tip</span><p>Give yourself 12 minutes for each 10-mark answer.</p></div>
          </aside>

          <section className="pv-reader-canvas">
            <div className="pv-paper-full">
              <div className="pv-paper-heading"><span>Learnova</span><h1>{productTitle}</h1><p>{examLabel} Examination · Practice Set 2026</p></div>
              <div className="pv-paper-rule" />
              <div className="pv-paper-instructions"><span>Instructions</span><p>Answer all questions. Marks and suggested word limits are indicated against each question.</p></div>
              <span className="pv-paper-section">{SECTIONS[viewerPage].label}</span>
              <div className="pv-question-list">
                {SECTIONS[viewerPage].questions.map((item) => (
                  <article key={item.q}><strong>{item.q}</strong><p>{item.text}</p><span>{item.meta}</span></article>
                ))}
              </div>
              <div className="pv-paper-page-number">— {viewerPage + 1} —</div>
            </div>
            <footer className="pv-reader-pagination">
              <button type="button" className="pv-button pv-button-secondary" disabled={viewerPage === 0} onClick={() => setViewerPage((p) => Math.max(0, p - 1))}>← Previous section</button>
              <span>Page {viewerPage + 1} of {SECTIONS.length}</span>
              <button type="button" className="pv-button pv-button-secondary" disabled={viewerPage === SECTIONS.length - 1} onClick={() => setViewerPage((p) => Math.min(SECTIONS.length - 1, p + 1))}>Next section →</button>
            </footer>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="pv-page pv-root">
      <header className="pv-header">
        <a className="pv-brand" href="#top" aria-label="Learnova home">
          <span className="pv-brand-mark">L</span>
          <span>Learnova<small>Practice with purpose</small></span>
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
              <div className="pv-paper-topline"><span>LEARNOVA</span><span>GS · II</span></div>
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
            <button type="button" className="pv-button pv-button-primary pv-pay-button" onClick={handlePay} disabled={paymentBusy}>{paymentBusy ? 'Preparing secure checkout…' : <>Pay {priceLabel} with Razorpay <span>→</span></>}</button>
            <div className="pv-payment-note"><span>◇</span> Razorpay secure checkout · One-time payment</div>
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
          <a className="pv-brand" href="#top"><span className="pv-brand-mark">L</span><span>Learnova<small>Practice with purpose</small></span></a>
        <p>Focused practice resources for aspirants who want to write better answers.</p>
          <span>© 2026 Learnova</span>
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

function FlowHeader({ label, onHome }) {
  return (
    <header className="pv-flow-header">
    <button type="button" className="pv-flow-brand" onClick={onHome} disabled={!onHome} aria-label={onHome ? 'Return to storefront' : 'Learnova'}>
      <span>L</span><strong>Learnova</strong><small>Practice with purpose</small>
      </button>
      <span>{label}</span>
      <div><i /> Private access</div>
    </header>
  )
}

function LibraryFile({ type, number, title, meta, action, onClick, featured = false }) {
  return (
    <article className={`pv-library-file${featured ? ' featured' : ''}`}>
      <div className="pv-library-file-icon"><span>{type}</span><small>{number}</small></div>
      <div><span>{featured ? 'Start here' : 'Included file'}</span><h3>{title}</h3><p>{meta}</p></div>
      <button type="button" onClick={onClick}>{action} <span>→</span></button>
    </article>
  )
}

function Faq({ question, children }) {
  return <details className="pv-faq-item"><summary>{question}<span>＋</span></summary><p>{children}</p></details>
}

export default PrashnavaliApp
