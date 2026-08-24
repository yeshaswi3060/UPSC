const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const LEAD_KEY = 'learnova_lead_id'
const SESSION_KEY = 'learnova_payment_session_id'

export function getLeadId() {
  return getOrCreateId(LEAD_KEY, 'lead')
}

export async function beginRazorpayCheckout({ email, phone }) {
  const leadId = getLeadId()
  const sessionId = getOrCreateId(SESSION_KEY, 'session')
  const buyer = { lead_id: leadId, session_id: sessionId, email, phone }

  trackBrowserEvent('lead_captured', buyer)
  await loadRazorpay()

  const order = await postJson('/api/create-order', buyer)
  trackBrowserEvent('checkout_opened', {
    ...buyer,
    razorpay_order_id: order.order_id,
  })

  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (result) => {
      if (settled) return
      settled = true
      resolve({ ...result, leadId })
    }

    const checkout = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: order.brand,
      description: order.product_title,
      order_id: order.order_id,
      prefill: {
        email,
        contact: phone,
      },
      notes: {
        lead_id: leadId,
        product_id: 'learnova-upsc-gs2-complete-set',
      },
      theme: { color: '#db8a2a' },
      modal: {
        confirm_close: true,
        ondismiss() {
          trackBrowserEvent('checkout_closed', {
            ...buyer,
            razorpay_order_id: order.order_id,
          })
          finish({ status: 'dismissed' })
        },
      },
      handler(response) {
        trackBrowserEvent('payment_callback_received', {
          ...buyer,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
        })
        finish({ status: 'callback', response })
      },
    })

    checkout.on('payment.failed', (response) => {
      const paymentError = response.error || {}
      trackBrowserEvent('payment_failed', {
        ...buyer,
        razorpay_order_id: paymentError.metadata?.order_id || order.order_id,
        razorpay_payment_id: paymentError.metadata?.payment_id || '',
        failure_code: paymentError.code || '',
        failure_description: paymentError.description || '',
        failure_step: paymentError.step || '',
        failure_reason: paymentError.reason || '',
      })
      finish({
        status: 'failed',
        error: paymentError.description || 'Payment failed. Please try again.',
      })
    })

    try {
      checkout.open()
    } catch (error) {
      reject(error)
    }
  })
}

export async function verifyRazorpayPayment(response, leadId) {
  let lastResult

  for (let attempt = 0; attempt < 5; attempt += 1) {
    lastResult = await postJson('/api/verify-payment', {
      lead_id: leadId,
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    })

    if (lastResult.paid) return lastResult
    if (!lastResult.verified || lastResult.status !== 'authorized') return lastResult
    await wait(1400)
  }

  return lastResult
}

export function trackBrowserEvent(event, details = {}) {
  if (!GOOGLE_SCRIPT_URL) return false

  const query = new URLSearchParams(window.location.search)
  const payload = {
    event,
    event_id: makeId('event'),
    created_at: new Date().toISOString(),
    lead_id: details.lead_id || getLeadId(),
    session_id: details.session_id || getOrCreateId(SESSION_KEY, 'session'),
    product_id: 'learnova-upsc-gs2-complete-set',
    product_title: 'General Studies Paper II — Complete Question Set',
    amount_paise: 9900,
    currency: 'INR',
    source_url: window.location.href,
    referrer: document.referrer,
    utm_source: query.get('utm_source') || '',
    utm_medium: query.get('utm_medium') || '',
    utm_campaign: query.get('utm_campaign') || '',
    ...details,
  }
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    return navigator.sendBeacon(
      GOOGLE_SCRIPT_URL,
      new Blob([body], { type: 'text/plain;charset=UTF-8' }),
    )
  }

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body,
  }).catch(() => {})
  return true
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Payment service is unavailable. Please try again.')
  }
  return result
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-learnova-razorpay]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', () => reject(new Error('Razorpay checkout could not load.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.learnovaRazorpay = 'true'
    script.onload = resolve
    script.onerror = () => reject(new Error('Razorpay checkout could not load. Check your connection and try again.'))
    document.head.appendChild(script)
  })
}

function getOrCreateId(key, prefix) {
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const id = makeId(prefix)
  localStorage.setItem(key, id)
  return id
}

function makeId(prefix) {
  const value = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${value}`
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
