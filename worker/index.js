const PRODUCT = Object.freeze({
  id: 'learnova-upsc-gs2-complete-set',
  title: 'General Studies Paper II — Complete Question Set',
  amountPaise: 9900,
  currency: 'INR',
  brand: 'Learnova',
})

export default {
  async fetch(request, env, ctx = { waitUntil() {} }) {
    const url = new URL(request.url)

    if (url.pathname === '/api/create-order') {
      return handleCreateOrder(request, env, ctx)
    }
    if (url.pathname === '/api/verify-payment') {
      return handleVerifyPayment(request, env, ctx)
    }
    if (url.pathname === '/api/razorpay-webhook') {
      return handleWebhook(request, env, ctx)
    }
    if (url.pathname === '/api/payment-health') {
      return jsonResponse({ ok: true, brand: PRODUCT.brand, mode: keyMode(env.RAZORPAY_KEY_ID) })
    }

    let response = await env.ASSETS.fetch(request)
    if (response.status === 404 && ['GET', 'HEAD'].includes(request.method)) {
      const fallbackUrl = new URL(request.url)
      fallbackUrl.pathname = '/'
      response = await env.ASSETS.fetch(new Request(fallbackUrl, request))
    }

    if (response.headers.get('content-type')?.includes('text/html')) {
      const socialImage = new URL('/og.png', request.url).href
      const html = (await response.text()).replaceAll('content="/og.png"', `content="${socialImage}"`)
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      })
    }

    return response
  },
}

async function handleCreateOrder(request, env, ctx) {
  if (request.method !== 'POST') return methodNotAllowed()
  const originError = validateOrigin(request, env)
  if (originError) return originError

  try {
    requirePaymentSecrets(env)
    const buyer = validateBuyer(await request.json())
    const baseEvent = paymentEvent(buyer, request)

    ctx.waitUntil(syncToSheet(env, { ...baseEvent, event: 'lead_captured' }))

    const receipt = `LRN-${Date.now()}-${buyer.lead_id.slice(-8)}`.slice(0, 40)
    const order = await razorpayRequest(env, '/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: PRODUCT.amountPaise,
        currency: PRODUCT.currency,
        receipt,
        notes: {
          lead_id: buyer.lead_id,
          product_id: PRODUCT.id,
        },
      }),
    })

    ctx.waitUntil(syncToSheet(env, {
      ...baseEvent,
      event: 'order_created',
      razorpay_order_id: order.id,
    }))

    return jsonResponse({
      ok: true,
      key_id: env.RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      brand: PRODUCT.brand,
      product_title: PRODUCT.title,
      lead_id: buyer.lead_id,
    })
  } catch (error) {
    const safeMessage = paymentErrorMessage(error)
    return jsonResponse({ ok: false, error: safeMessage }, 502)
  }
}

async function handleVerifyPayment(request, env, ctx) {
  if (request.method !== 'POST') return methodNotAllowed()
  const originError = validateOrigin(request, env)
  if (originError) return originError

  try {
    requirePaymentSecrets(env)
    const body = await request.json()
    const leadId = requiredText(body.lead_id, 'lead_id', 100)
    const orderId = requiredText(body.razorpay_order_id, 'razorpay_order_id', 100)
    const paymentId = requiredText(body.razorpay_payment_id, 'razorpay_payment_id', 100)
    const signature = requiredText(body.razorpay_signature, 'razorpay_signature', 200)

    const order = await razorpayRequest(env, `/orders/${encodeURIComponent(orderId)}`)
    if (
      order.id !== orderId ||
      Number(order.amount) !== PRODUCT.amountPaise ||
      order.currency !== PRODUCT.currency ||
      String(order.notes?.lead_id || '') !== leadId
    ) {
      throw new Error('Order validation failed.')
    }

    const expectedSignature = await hmacHex(`${order.id}|${paymentId}`, env.RAZORPAY_KEY_SECRET)
    if (!constantTimeEqual(expectedSignature, signature)) {
      throw new Error('Payment signature verification failed.')
    }

    const payment = await razorpayRequest(env, `/payments/${encodeURIComponent(paymentId)}`)
    if (
      payment.id !== paymentId ||
      payment.order_id !== order.id ||
      Number(payment.amount) !== PRODUCT.amountPaise ||
      payment.currency !== PRODUCT.currency
    ) {
      throw new Error('Payment details do not match the order.')
    }

    const captured = payment.status === 'captured'
    const verifiedEvent = {
      event: captured ? 'payment_captured' : 'payment_verified',
      event_id: `verify_${payment.id}_${payment.status}`,
      lead_id: leadId,
      product_id: PRODUCT.id,
      product_title: PRODUCT.title,
      amount_paise: PRODUCT.amountPaise,
      currency: PRODUCT.currency,
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      payment_method: payment.method || '',
      payment_status: payment.status,
      paid_at: captured ? new Date().toISOString() : '',
    }
    ctx.waitUntil(syncToSheet(env, verifiedEvent))

    return jsonResponse({
      ok: true,
      verified: true,
      paid: captured,
      status: payment.status,
      order_id: order.id,
      payment_id: payment.id,
    })
  } catch (error) {
    return jsonResponse({ ok: false, verified: false, error: paymentErrorMessage(error) }, 400)
  }
}

async function handleWebhook(request, env, ctx) {
  if (request.method !== 'POST') return methodNotAllowed()
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return jsonResponse({ ok: false, error: 'Webhook is not configured.' }, 503)
  }

  const rawBody = await request.text()
  const receivedSignature = request.headers.get('x-razorpay-signature') || ''
  const expectedSignature = await hmacHex(rawBody, env.RAZORPAY_WEBHOOK_SECRET)

  if (!constantTimeEqual(expectedSignature, receivedSignature)) {
    return jsonResponse({ ok: false, error: 'Invalid webhook signature.' }, 401)
  }

  let webhook
  try {
    webhook = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid webhook body.' }, 400)
  }

  const mapped = mapWebhookEvent(webhook)
  if (mapped) ctx.waitUntil(syncToSheet(env, mapped))

  // Return immediately. Sheet synchronisation continues in the background.
  return jsonResponse({ ok: true })
}

function mapWebhookEvent(webhook) {
  const eventMap = {
    'payment.captured': 'payment_captured',
    'payment.failed': 'payment_failed',
    'order.paid': 'order_paid',
  }
  const mappedEvent = eventMap[webhook.event]
  if (!mappedEvent) return null

  const payment = webhook.payload?.payment?.entity || {}
  const order = webhook.payload?.order?.entity || {}
  const orderId = payment.order_id || order.id || ''
  const leadId = payment.notes?.lead_id || order.notes?.lead_id || ''
  const entityId = payment.id || order.id || 'unknown'

  return {
    event: mappedEvent,
    event_id: `webhook_${webhook.event}_${entityId}_${webhook.created_at || ''}`,
    lead_id: leadId,
    product_id: PRODUCT.id,
    product_title: PRODUCT.title,
    amount_paise: payment.amount || order.amount || PRODUCT.amountPaise,
    currency: payment.currency || order.currency || PRODUCT.currency,
    razorpay_order_id: orderId,
    razorpay_payment_id: payment.id || '',
    payment_method: payment.method || '',
    payment_status: payment.status || order.status || '',
    failure_code: payment.error_code || '',
    failure_description: payment.error_description || '',
    failure_step: payment.error_step || '',
    failure_reason: payment.error_reason || '',
    paid_at: mappedEvent === 'payment_captured' || mappedEvent === 'order_paid'
      ? new Date((webhook.created_at || Math.floor(Date.now() / 1000)) * 1000).toISOString()
      : '',
  }
}

async function syncToSheet(env, event) {
  if (!env.GOOGLE_SCRIPT_URL || !env.SHEET_SYNC_SECRET) return

  const payload = JSON.stringify(event)
  const signature = await hmacHex(payload, env.SHEET_SYNC_SECRET)
  const response = await fetch(env.GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ payload, signature }),
  })

  if (!response.ok) throw new Error('Sheet synchronisation failed.')
}

async function razorpayRequest(env, path, options = {}) {
  const authorization = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body.error?.description || body.error?.reason || 'Razorpay request failed.'
    const error = new Error(message)
    error.safePaymentError = true
    throw error
  }
  return body
}

function validateBuyer(body) {
  const leadId = requiredText(body.lead_id, 'lead_id', 100)
  const email = requiredText(body.email, 'email', 200).toLowerCase()
  const phone = requiredText(body.phone, 'phone', 30).replace(/\D/g, '')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.')
  if (phone.length < 10 || phone.length > 15) throw new Error('Enter a valid mobile number.')
  return { lead_id: leadId, email, phone }
}

function paymentEvent(buyer, request) {
  return {
    event_id: crypto.randomUUID(),
    lead_id: buyer.lead_id,
    email: buyer.email,
    phone: buyer.phone,
    product_id: PRODUCT.id,
    product_title: PRODUCT.title,
    amount_paise: PRODUCT.amountPaise,
    currency: PRODUCT.currency,
    source_url: request.headers.get('referer') || '',
  }
}

function validateOrigin(request, env) {
  const origin = request.headers.get('origin')
  const requestOrigin = new URL(request.url).origin
  const allowed = env.ALLOWED_ORIGIN || requestOrigin
  if (!origin || (origin !== requestOrigin && origin !== allowed)) {
    return jsonResponse({ ok: false, error: 'Request origin is not allowed.' }, 403)
  }
  return null
}

function requirePaymentSecrets(env) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Payment service is not configured.')
  }
}

function requiredText(value, field, maxLength) {
  const text = String(value || '').trim()
  if (!text) throw new Error(`${field} is required.`)
  return text.slice(0, maxLength)
}

function paymentErrorMessage(error) {
  if (error?.safePaymentError) return error.message
  const safeMessages = [
    'Enter a valid email address.',
    'Enter a valid mobile number.',
    'Payment service is not configured.',
    'Order validation failed.',
    'Payment signature verification failed.',
    'Payment details do not match the order.',
  ]
  return safeMessages.includes(error?.message) ? error.message : 'Payment could not be completed. Please try again.'
}

async function hmacHex(value, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left, right) {
  const a = String(left)
  const b = String(right)
  let mismatch = a.length ^ b.length
  const length = Math.max(a.length, b.length)
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index % Math.max(a.length, 1)) || 0) ^
      (b.charCodeAt(index % Math.max(b.length, 1)) || 0)
  }
  return mismatch === 0
}

function keyMode(keyId = '') {
  return keyId.startsWith('rzp_live_') ? 'live' : 'test'
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function methodNotAllowed() {
  return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405)
}
