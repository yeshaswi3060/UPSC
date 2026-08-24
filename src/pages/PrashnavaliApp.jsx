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

function PrashnavaliApp({
  productTitle = 'General Studies Paper II — Complete Question Set',
  examLabel = 'UPSC Civil Services · Mains',
  price = 99,
}) {
  const [screen, setScreen] = useState('landing')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [viewerPage, setViewerPage] = useState(0)
  const [downloaded, setDownloaded] = useState(false)

  const orderRef = useRef({
    id: 'PRV-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  })

  const priceLabel = '₹' + price

  function handlePay() {
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    setError('')
    setScreen('processing')
    setTimeout(() => setScreen('success'), 1400)
  }

  function downloadPaper() {
    const content = `PRASHNAVALI\n${examLabel} Examination\n${productTitle}\n\nIncludes: Question Paper, Answer Key, Detailed Solutions\nAmount paid: ₹${price}\nBuyer email: ${email}\nBuyer phone: ${phone}\nOrder: ${orderRef.current.id}\n\nThis is a sample deliverable generated for preview purposes.`
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

  return (
    <div className="pv-page">
      <div className="pv-root pv-app">
        {screen === 'landing' && (
          <div style={{ padding: '32px 22px 44px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 21 }}>Prashnavali</div>
              <span className="tag tag-neutral">{priceLabel}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span className="tag tag-outline" style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>
                {examLabel}
              </span>
              <h1 style={{ fontSize: 28, margin: '6px 0 0' }}>{productTitle}</h1>
              <p style={{ fontSize: 14, opacity: 0.75, margin: 0 }}>
                The exact paper pattern, a verified answer key, and detailed solutions — everything you need to
                self-assess before exam day.
              </p>
            </div>

            <div className="hr" style={{ margin: 0 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h6 style={{ margin: 0 }}>What you'll get</h6>

              <FeatureRow
                title="Question Paper (PDF)"
                subtitle="Full paper, formatted exactly like the exam"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                }
              />
              <FeatureRow
                title="Answer Key"
                subtitle="Verified, model answers for every question"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                }
              />
              <FeatureRow
                title="Detailed Solutions"
                subtitle="Step-by-step reasoning behind each answer"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 7v14" />
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                  </svg>
                }
              />
            </div>

            <div className="card elev-sm" style={{ alignItems: 'center', textAlign: 'center', gap: 4, padding: '22px 16px' }}>
              <div className="card-kicker">One-time payment</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 42, lineHeight: 1 }}>
                {priceLabel}
              </div>
              <div className="card-body" style={{ textAlign: 'center', flex: 'none' }}>
                No subscription — pay once, keep it forever.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h6 style={{ margin: 0 }}>Your details</h6>
              <div className="field">
                <label htmlFor="pv-email">Email address</label>
                <input
                  id="pv-email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="pv-phone">Phone number</label>
                <input
                  id="pv-phone"
                  className="input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {error && (
                <div style={{ fontSize: 12.5, color: 'var(--color-accent-800)', fontWeight: 600 }}>{error}</div>
              )}
              <button
                type="button"
                className="btn btn-primary btn-block"
                style={{ height: 50, fontSize: 15, marginTop: 2 }}
                onClick={handlePay}
              >
                Pay {priceLabel} — Get Instant Access
              </button>
              <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.55 }}>
                Secure checkout · Delivered instantly to your email
              </div>
            </div>
          </div>
        )}

        {screen === 'processing' && (
          <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                border: '3px solid var(--color-divider)',
                borderTopColor: 'var(--color-accent)',
                animation: 'pv-spinRing 0.9s linear infinite',
              }}
            />
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
              Processing your payment…
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.6 }}>Please don't close this screen</div>
          </div>
        )}

        {screen === 'success' && (
          <div style={{ padding: '40px 22px 44px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '10px 0 4px',
                animation: 'pv-fadeInUp 0.5s ease both',
              }}
            >
              <svg width="60" height="60" viewBox="0 0 64 64" style={{ animation: 'pv-ringPop 0.5s ease both' }}>
                <circle cx="32" cy="32" r="29" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
                <path
                  d="M20 33l8 8 16-18"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  strokeDashoffset="40"
                  style={{ animation: 'pv-checkDraw 0.5s ease 0.35s forwards' }}
                />
              </svg>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 22 }}>
                Payment Successful
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.6 }}>
                Order {orderRef.current.id} · {orderRef.current.date}
              </div>
            </div>

            <div className="card" style={{ gap: 10 }}>
              <div className="card-kicker">Your details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13.5 }}>
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Phone" value={phone} />
                <SummaryRow label="Amount paid" value={priceLabel} />
              </div>
            </div>

            <div className="card elev-sm" style={{ gap: 10 }}>
              <div className="card-kicker">Your question paper</div>
              <div className="card-title">{productTitle}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tag tag-accent">Question Paper</span>
                <span className="tag tag-accent">Answer Key</span>
                <span className="tag tag-accent">Solutions</span>
              </div>
              <div className="card-meta">3 files · PDF · 4.2 MB</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-primary" style={{ flex: 1, height: 48 }} onClick={downloadPaper}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, height: 48 }}
                onClick={() => setScreen('viewer')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View
              </button>
            </div>
            {downloaded && (
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-accent-700)', fontWeight: 600 }}>
                Download started
              </div>
            )}
          </div>
        )}

        {screen === 'viewer' && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '70vh' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 18px 14px', borderBottom: '1px solid var(--color-divider)' }}>
              <button
                type="button"
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: '50%',
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onClick={() => setScreen('success')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </button>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>
                  Question Paper Preview
                </div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>{productTitle}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 6px' }}>
              <div className="plate" style={{ padding: '24px 18px', background: 'var(--color-bg)' }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Prashnavali
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{examLabel} Examination</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{productTitle}</div>
                </div>
                <div className="hr" style={{ margin: '12px 0' }} />

                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '6px 0 12px' }}>
                  {SECTIONS[viewerPage].label}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14, lineHeight: 1.6 }}>
                  {SECTIONS[viewerPage].questions.map((item) => (
                    <div key={item.q}>
                      <strong>{item.q}</strong> {item.text} <span style={{ opacity: 0.55, fontSize: 12 }}>{item.meta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={viewerPage === 0}
                onClick={() => setViewerPage((p) => Math.max(0, p - 1))}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Prev
              </button>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{viewerPage + 1} / {SECTIONS.length}</div>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={viewerPage === SECTIONS.length - 1}
                onClick={() => setViewerPage((p) => Math.min(SECTIONS.length - 1, p + 1))}
              >
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ margin: '0 20px 20px', height: 46 }}
              onClick={downloadPaper}
            >
              Download Full PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureRow({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 'none',
          color: 'var(--color-accent)',
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12.5, opacity: 0.7 }}>{subtitle}</div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ opacity: 0.6 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export default PrashnavaliApp
