import http from 'node:http';
import { existsSync, mkdirSync, readFileSync, createReadStream, copyFileSync, statSync } from 'node:fs';
import { writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SEED_STATE } from './seed.js';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const localEnv = path.join(root, '.env.local');
if (existsSync(localEnv)) process.loadEnvFile(localEnv);
let firebaseDb = null;
let firebaseBucket = null;
try {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_B64;
  if (encoded) {
    const serviceAccount = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    const app = getApps()[0] || initializeApp({ credential: cert(serviceAccount), storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET });
    firebaseDb = getFirestore(app);
    firebaseBucket = getStorage(app).bucket();
  }
} catch (error) {
  console.error('Firebase persistence unavailable:', error.message);
}
const isProduction = process.env.NODE_ENV === 'production';
const host = process.env.HOST || (isProduction ? '0.0.0.0' : '127.0.0.1');
const port = Number(process.env.PORT || 5174);
const dataDir = path.resolve(process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/civilprelims-data' : path.join(root, '.civilprelims-data')));
mkdirSync(dataDir, { recursive: true });
const stateFile = path.join(dataDir, 'state.json');
const pdfFile = path.join(dataDir, 'main-paper.pdf');
const secretFile = path.join(dataDir, 'secret');
if (!existsSync(secretFile)) await writeFile(secretFile, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
const secret = process.env.SESSION_SECRET || readFileSync(secretFile, 'utf8').trim();
const remoteState = firebaseDb ? (await firebaseDb.doc('app/state').get()).data()?.value : null;
const loadedState = remoteState || (existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : null);
let state = { ...structuredClone(SEED_STATE), ...(loadedState || {}) };
state.analytics = { events: [], ...state.analytics };
state.userRoles = { ...(state.userRoles || {}) };
let saveQueue = Promise.resolve();
const save = () => {
  const snapshot = JSON.stringify(state, null, 2);
  saveQueue = saveQueue.then(async () => {
    const temp = stateFile + '.tmp';
    await writeFile(temp, snapshot, { mode: 0o600 });
    await rename(temp, stateFile);
    if (firebaseDb) await firebaseDb.doc('app/state').set({ value: state, updatedAt: new Date().toISOString() });
  });
  return saveQueue;
};
if (loadedState && !loadedState.seedVersion) {
  const known = new Set(state.questions.map(q => q.id));
  state.questions.push(...SEED_STATE.questions.filter(q => !known.has(q.id)));
  state.seedVersion = 2;
  await save();
} else if (!loadedState) await save();

const configuredLive = Boolean(
  process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_') &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_WEBHOOK_SECRET &&
  process.env.RESEND_API_KEY &&
  process.env.FROM_EMAIL && !process.env.FROM_EMAIL.endsWith('@resend.dev') &&
  process.env.PUBLIC_URL?.startsWith('https://') &&
  process.env.ADMIN_PASSWORD &&
  process.env.SESSION_SECRET
  // A Vercel function's /tmp directory is not durable. Do not ever accept
  // real payments there unless the shared Firebase store connected correctly.
  && (!process.env.VERCEL || firebaseDb)
);
const demoMode = !isProduction && !configuredLive;
const demoPdf = path.join(root, 'output', 'pdf', 'civilprelims-demo-paper.pdf');
if (demoMode && !state.pdf && existsSync(demoPdf)) {
  copyFileSync(demoPdf, pdfFile);
  state.pdf = { name: 'Local test paper — 3 questions.pdf', size: statSync(pdfFile).size, updatedAt: new Date().toISOString(), demo: true };
  await save();
}
const hasPdf = () => Boolean(state.pdf && (existsSync(pdfFile) || firebaseBucket));
const checkoutMode = () => !hasPdf() ? 'unavailable' : configuredLive && !state.pdf.demo ? 'live' : demoMode ? 'test' : 'unavailable';
const hash = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');
const same = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const token = () => crypto.randomBytes(24).toString('base64url');
const sessionCookie = (req, value, age = 2592000) => `cp_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
const visitorCookie = (req, value) => `cp_visitor=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
const visitorFrom = (req) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('cp_visitor='))?.slice(11);
const indiaOffset = 330 * 60000;
const dayKey = (stamp) => new Date(new Date(stamp).getTime() + indiaOffset).toISOString().slice(0, 10);
const publicOrder = o => ({ id:o.id, email:o.email, phone:o.phone, amount:o.amount, mode:o.mode, status:o.status, createdAt:o.createdAt, paidAt:o.paidAt, paymentId:o.paymentId, emailSent:o.emailSent });
async function recordEvent(type, visitorId, email = '', detail = '') {
  state.analytics.events.push({ id: crypto.randomUUID(), type, visitorId, email, detail, at: new Date().toISOString() });
  await save();
}
function dateRange(url) {
  const days = Math.min(365, Math.max(1, Number.parseInt(url.searchParams.get('days'), 10) || 30));
  const nowIndia = new Date(Date.now() + indiaOffset);
  const todayStart = Date.UTC(nowIndia.getUTCFullYear(), nowIndia.getUTCMonth(), nowIndia.getUTCDate()) - indiaOffset;
  return { start: new Date(todayStart - (days - 1) * 86400000).toISOString(), end: new Date(todayStart + 86400000 - 1).toISOString(), days };
}
const json = (res, status, value, extra = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(JSON.stringify(value));
};
const fail = (res, status, error) => json(res, status, { ok: false, error });
async function body(req, limit = 1024 * 1024) {
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Upload is too large.'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('Invalid JSON.'), { status: 400 }); }
}
function ensureOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  try { if (new URL(origin).host === req.headers.host) return; } catch { /* denied */ }
  throw Object.assign(new Error('Invalid request origin.'), { status: 403 });
}
function getSession(req) {
  const value = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('cp_session='))?.slice(11);
  if (!value) return null;
  return state.sessions.find(s => s.hash === hash(value) && s.expiresAt > Date.now()) || null;
}
async function createSession(req, res, role, email = '') {
  const value = token();
  state.sessions.push({ hash: hash(value), role, email, expiresAt: Date.now() + 30 * 86400000 });
  state.sessions = state.sessions.filter(s => s.expiresAt > Date.now());
  await save();
  res.setHeader('Set-Cookie', sessionCookie(req, value));
}
function requireRole(req, role) {
  const session = getSession(req);
  if (!session || (role && session.role !== role)) throw Object.assign(new Error('Sign in to continue.'), { status: 401 });
  return session;
}
function paidOrder(email) {
  return state.orders.find(o => o.status === 'paid' && o.email === email);
}
function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.createHash('sha256').update(secret).digest(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(x => x.toString('base64url')).join('.');
}
function decrypt(value) {
  const [iv, tag, data] = value.split('.').map(x => Buffer.from(x, 'base64url'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.createHash('sha256').update(secret).digest(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}
async function sendAccessEmail(order, accessCode, messageId = order.id) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return false;
  const paperName = state.pdf?.name || 'civilprelims-practice-paper.pdf';
  const paperBytes = existsSync(pdfFile) ? readFileSync(pdfFile) : (firebaseBucket && state.pdf ? (await firebaseBucket.file('main-paper.pdf').download())[0] : null);
  const paperAttachment = paperBytes ? [{ filename: paperName, content: paperBytes.toString('base64') }] : [];
  const loginUrl = `${process.env.PUBLIC_URL || 'your CivilPrelims website'}/login`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `civilprelims-access-${messageId}` },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL, to: [order.email],
      subject: 'Your CivilPrelims paper and access code',
      text: `Your CivilPrelims access is ready.\n\nSign-in email: ${order.email}\nAccess code: ${accessCode}\n\nOpen your student library: ${loginUrl}\n\nYour practice paper is attached to this email. Keep this access code private.`,
      html: `<div style="font-family:Arial,sans-serif;color:#173d34;line-height:1.6"><h2>Your CivilPrelims access is ready</h2><p>Thank you for your purchase. Your practice paper is attached.</p><div style="background:#f2f5ed;border:1px solid #d6e1d2;padding:18px;margin:20px 0"><p style="margin:0"><strong>Sign-in email</strong><br>${order.email}</p><p style="margin:14px 0 0"><strong>Access code</strong><br><span style="font-size:22px;letter-spacing:2px">${accessCode}</span></p></div><p><a href="${loginUrl}" style="display:inline-block;background:#f4775b;color:#173d34;padding:12px 18px;text-decoration:none;font-weight:bold">Open your student library</a></p><p style="font-size:12px;color:#5c7167">Keep this access code private. The same paper and subject tests are also available in your library.</p></div>`,
      attachments: paperAttachment
    })
  });
  if (!response.ok) throw new Error('Access email could not be sent.');
  return true;
}
async function finishOrder(order) {
  if (order.status === 'paid') {
    const code = decrypt(order.accessCodeEncrypted);
    if (!order.emailSent) { try { order.emailSent = await sendAccessEmail(order, code, `${order.id}-retry-${dayKey(new Date())}`); await save(); } catch { /* retry later */ } }
    return code;
  }
  const code = crypto.randomBytes(12).toString('base64url');
  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  order.accessCodeHash = hash(code);
  order.accessCodeEncrypted = encrypt(code);
  await recordEvent('purchase', order.visitorId || '', order.email, order.mode);
  try { order.emailSent = await sendAccessEmail(order, code); }
  catch { order.emailSent = false; }
  await save();
  return code;
}
async function razorpay(pathname, options = {}) {
  const credentials = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1${pathname}`, {
    ...options, headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Payment service is unavailable. Please try later.');
  return result;
}
const rate = new Map();
function limit(req, key, max = 12) {
  const id = `${req.socket.remoteAddress}:${key}`, now = Date.now();
  const prior = (rate.get(id) || []).filter(t => now - t < 60000);
  if (prior.length >= max) throw Object.assign(new Error('Too many attempts. Please wait a minute.'), { status: 429 });
  prior.push(now); rate.set(id, prior);
}

async function api(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname === '/api' && url.searchParams.get('__path') ? `/api/${url.searchParams.get('__path')}` : url.pathname;
  if (!p.startsWith('/api/')) return false;
  try {
    if (!['GET', 'HEAD'].includes(req.method)) ensureOrigin(req);
    if (p === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true });
    if (p === '/api/track' && req.method === 'POST') {
      limit(req, 'track', 90);
      const input = await body(req, 4096);
      const type = String(input.type || '');
      if (!['page_view', 'buy_click', 'checkout_open'].includes(type)) return fail(res, 400, 'Unknown event.');
      const pathName = String(input.path || '/').slice(0, 100);
      const known = visitorFrom(req);
      const visitorId = known && /^[a-f0-9]{32}$/.test(known) ? known : crypto.randomBytes(16).toString('hex');
      const session = getSession(req);
      if (session?.role === 'admin' || pathName.startsWith('/admin')) return json(res, 200, { ok: true });
      if (!known) res.setHeader('Set-Cookie', visitorCookie(req, visitorId));
      await recordEvent(type, visitorId, session?.role === 'student' ? session.email : '', pathName);
      return json(res, 200, { ok: true });
    }
    if (p === '/api/catalog' && req.method === 'GET') return json(res, 200, {
      ok: true, config: state.config, subjects: state.subjects.map(s => ({ ...s, count: state.questions.filter(q => q.subjectId === s.id).length })),
      pdf: hasPdf() ? state.pdf : null, checkoutMode: checkoutMode()
    });
    if (p === '/api/session' && req.method === 'GET') {
      const session = getSession(req);
      return json(res, 200, { ok: true, user: session ? { role: session.role, email: session.email, hasPurchase: session.role === 'student' ? Boolean(paidOrder(session.email)) : true } : null });
    }
    if (p === '/api/logout' && req.method === 'POST') {
      const session = getSession(req);
      if (session) state.sessions = state.sessions.filter(s => s !== session);
      await save();
      res.setHeader('Set-Cookie', sessionCookie(req, '', 0));
      return json(res, 200, { ok: true });
    }
      if (p === '/api/admin/login' && req.method === 'POST') {
      limit(req, 'admin', 6);
      const input = await body(req);
      const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      const valid = process.env.ADMIN_PASSWORD ? same(input.password || '', process.env.ADMIN_PASSWORD) : demoMode && loopback && input.localDemo === true;
      if (!valid) return fail(res, 401, 'Incorrect admin password.');
      await createSession(req, res, 'admin');
      return json(res, 200, { ok: true, localDemo: !process.env.ADMIN_PASSWORD });
    }
    if (p === '/api/student/login' && req.method === 'POST') {
      limit(req, 'student', 8);
      const input = await body(req);
      const email = String(input.email || '').trim().toLowerCase();
      const code = String(input.accessCode || '').trim();
      const order = state.orders.find(o => o.status === 'paid' && o.email === email && same(o.accessCodeHash, hash(code)));
      if (!order) return fail(res, 401, 'Email or access code is incorrect.');
      await createSession(req, res, 'student', email);
      return json(res, 200, { ok: true });
    }
    if (p === '/api/login' && req.method === 'POST') {
      limit(req, 'login', 10);
      const input = await body(req);
      const identifier = String(input.identifier || '').trim().toLowerCase();
      const credential = String(input.secret || '');
      if (process.env.ADMIN_PASSWORD && same(credential, process.env.ADMIN_PASSWORD)) {
        await createSession(req, res, 'admin');
        return json(res, 200, { ok: true, role: 'admin', redirect: '/admin' });
      }
      const order = state.orders.find(item => item.status === 'paid' && item.email === identifier && same(item.accessCodeHash, hash(credential)));
      if (!order) return fail(res, 401, 'We could not verify those details. Use your purchase email and access code, or the admin password.');
      const role = state.userRoles[identifier] === 'admin' ? 'admin' : 'student';
      await createSession(req, res, role, identifier);
      return json(res, 200, { ok: true, role, redirect: role === 'admin' ? '/admin' : '/library' });
    }
    if (p === '/api/student/recover' && req.method === 'POST') {
      limit(req, 'recover', 3);
      const input = await body(req);
      const email = String(input.email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'Enter a valid purchase email.');
      const order = paidOrder(email);
      if (order && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
        try { await sendAccessEmail(order, decrypt(order.accessCodeEncrypted), `${order.id}-recovery-${crypto.randomUUID()}`); }
        catch { /* keep response neutral */ }
      }
      return json(res, 200, { ok:true, message:'If this email has a purchase, the access code has been sent.' });
    }
    if (p === '/api/google-login' && req.method === 'POST') {
      limit(req, 'google-login', 8);
      const { idToken = '' } = await body(req);
      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      if (!apiKey || !idToken) return fail(res, 400, 'Google sign-in is not configured.');
      const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ idToken }) });
      const result = await lookup.json().catch(() => ({}));
      const email = String(result.users?.[0]?.email || '').toLowerCase();
      if (!email) return fail(res, 401, 'Google account could not be verified.');
      const order = paidOrder(email);
      const isAdmin = email === String(process.env.ADMIN_EMAIL || '').trim().toLowerCase() || state.userRoles[email] === 'admin';
      if (!order && !isAdmin) return fail(res, 403, 'This Google account does not have a CivilPrelims purchase yet.');
      const role = isAdmin ? 'admin' : 'student';
      await createSession(req, res, role, email);
      return json(res, 200, { ok:true, role, redirect: role === 'admin' ? '/admin' : '/library' });
    }
    if (p === '/api/checkout/order' && req.method === 'POST') {
      limit(req, 'checkout', 8);
      const mode = checkoutMode();
      if (mode === 'unavailable') return fail(res, 503, 'Checkout will open after the paper and payment settings are ready.');
      const input = await body(req);
      const email = String(input.email || '').trim().toLowerCase();
      const phone = String(input.phone || '').replace(/\D/g, '');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[6-9]\d{9}$/.test(phone)) return fail(res, 400, 'Enter a valid email and 10-digit mobile number.');
      const order = { id: crypto.randomUUID(), email, phone, visitorId: visitorFrom(req) || '', amount: Number(state.config.price), mode, status: 'pending', createdAt: new Date().toISOString() };
      if (mode === 'live') {
        const rz = await razorpay('/orders', { method: 'POST', body: JSON.stringify({ amount: order.amount * 100, currency: 'INR', receipt: order.id.slice(0, 40), notes: { checkout_id: order.id } }) });
        order.razorpayOrderId = rz.id;
      }
      state.orders.unshift(order); await recordEvent('checkout_started', order.visitorId, email);
      return json(res, 200, { ok: true, mode, checkoutId: order.id, amount: order.amount, razorpayOrderId: order.razorpayOrderId, keyId: mode === 'live' ? process.env.RAZORPAY_KEY_ID : undefined });
    }
    if (p === '/api/checkout/test-complete' && req.method === 'POST') {
      if (!demoMode || checkoutMode() !== 'test') return fail(res, 403, 'Test checkout is unavailable.');
      const input = await body(req);
      const order = state.orders.find(o => o.id === input.checkoutId && o.mode === 'test');
      if (!order) return fail(res, 404, 'Order not found.');
      const code = await finishOrder(order);
      await createSession(req, res, 'student', order.email);
      return json(res, 200, { ok: true, email: order.email, accessCode: code, orderId: order.id, testMode: true });
    }
    if (p === '/api/checkout/verify' && req.method === 'POST') {
      const input = await body(req);
      const order = state.orders.find(o => o.id === input.checkoutId && o.mode === 'live');
      if (!order || !same(order.razorpayOrderId, input.razorpay_order_id)) return fail(res, 400, 'Order mismatch.');
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${order.razorpayOrderId}|${input.razorpay_payment_id}`).digest('hex');
      if (!same(expected, input.razorpay_signature)) return fail(res, 400, 'Payment signature could not be verified.');
      const payment = await razorpay(`/payments/${encodeURIComponent(input.razorpay_payment_id)}`);
      if (payment.order_id !== order.razorpayOrderId || Number(payment.amount) !== order.amount * 100 || payment.currency !== 'INR') return fail(res, 400, 'Payment details do not match the order.');
      if (payment.status !== 'captured') return json(res, 202, { ok: true, pending: true, message: 'Payment is processing. Access will be emailed after confirmation.' });
      order.paymentId = payment.id;
      const code = await finishOrder(order);
      await createSession(req, res, 'student', order.email);
      return json(res, 200, { ok: true, email: order.email, accessCode: code, orderId: order.id, emailSent: order.emailSent });
    }
    if (p === '/api/razorpay-webhook' && req.method === 'POST') {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) return fail(res, 503, 'Webhook unavailable.');
      const chunks = []; for await (const c of req) chunks.push(c);
      const raw = Buffer.concat(chunks);
      const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
      if (!same(expected, req.headers['x-razorpay-signature'] || '')) return fail(res, 401, 'Invalid signature.');
      const event = JSON.parse(raw.toString('utf8'));
      if (event.event === 'payment.captured') {
        const payment = event.payload?.payment?.entity;
        const order = state.orders.find(o => o.razorpayOrderId === payment?.order_id && o.mode === 'live');
        if (order && Number(payment.amount) === order.amount * 100 && payment.currency === 'INR') {
          order.paymentId = payment.id; await finishOrder(order);
        }
      }
      return json(res, 200, { ok: true });
    }
    if (p === '/api/pdf' && req.method === 'GET') {
      const session = requireRole(req);
      if (session.role !== 'admin' && !(session.role === 'student' && paidOrder(session.email))) return fail(res, 403, 'Purchase required.');
      if (!hasPdf()) return fail(res, 404, 'Paper has not been uploaded yet.');
      await recordEvent(url.searchParams.get('download') === '1' ? 'pdf_download' : 'pdf_view', visitorFrom(req) || '', session.role === 'student' ? session.email : '');
      const pdfBytes = existsSync(pdfFile) ? readFileSync(pdfFile) : (await firebaseBucket.file('main-paper.pdf').download())[0];
      res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': String(pdfBytes.length), 'Content-Disposition': `${url.searchParams.get('download') === '1' ? 'attachment' : 'inline'}; filename="civilprelims-paper.pdf"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(pdfBytes); return true;
    }
    if (p.startsWith('/api/questions/') && req.method === 'GET') {
      const session = requireRole(req);
      if (session.role !== 'admin' && !(session.role === 'student' && paidOrder(session.email))) return fail(res, 403, 'Purchase required.');
      const subjectId = p.split('/')[3];
      if (!state.subjects.some(s => s.id === subjectId)) return fail(res, 404, 'Subject not found.');
      return json(res, 200, { ok: true, questions: state.questions.filter(q => q.subjectId === subjectId).map(q => ({ id:q.id, subjectId:q.subjectId, prompt:q.prompt, options:q.options })) });
    }
    if (p.match(/^\/api\/tests\/[^/]+\/submit$/) && req.method === 'POST') {
      const session = requireRole(req, 'student');
      if (!paidOrder(session.email)) return fail(res, 403, 'Purchase required.');
      limit(req, `test-${session.email}`, 20);
      const subjectId = p.split('/')[3];
      const subject = state.subjects.find(s => s.id === subjectId);
      if (!subject) return fail(res, 404, 'Subject not found.');
      const input = await body(req, 32 * 1024);
      const answers = input.answers && typeof input.answers === 'object' ? input.answers : {};
      const questions = state.questions.filter(q => q.subjectId === subjectId);
      const review = questions.map(q => ({ ...q, answer: Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] <= 3 ? answers[q.id] : null }));
      const attempted = review.filter(q => q.answer !== null).length;
      const correct = review.filter(q => q.answer === q.correctIndex).length;
      const attempt = { id: crypto.randomUUID(), email: session.email, subjectId, subjectName: subject.name, correct, attempted, total: questions.length, at: new Date().toISOString() };
      state.attempts.unshift(attempt); await recordEvent('test_completed', visitorFrom(req) || '', session.email, subjectId);
      return json(res, 200, { ok: true, attempt, review });
    }
    if (p === '/api/profile' && req.method === 'GET') {
      const session = requireRole(req, 'student');
      const orders = state.orders.filter(o => o.status === 'paid' && o.email === session.email);
      if (!orders.length) return fail(res, 403, 'Purchase required.');
      const attempts = state.attempts.filter(a => a.email === session.email);
      const days = Array.from({ length: 7 }, (_, i) => dayKey(new Date(Date.now() - (6 - i) * 86400000)));
      const daily = days.map(date => { const items = attempts.filter(a => dayKey(a.at) === date); return { date, tests: items.length, correct: items.reduce((n,a) => n + a.correct, 0), total: items.reduce((n,a) => n + a.total, 0) }; });
      const subjects = state.subjects.map(s => { const items = attempts.filter(a => a.subjectId === s.id); return { id:s.id, name:s.name, tests:items.length, best:items.length ? Math.max(...items.map(a => Math.round(a.correct / Math.max(a.total, 1) * 100))) : null, latest:items[0]?.at || null }; });
      const activity = state.analytics.events.filter(e => e.email === session.email && ['test_completed', 'pdf_view', 'pdf_download'].includes(e.type)).slice(-20).reverse();
      return json(res, 200, { ok:true, email:session.email, joinedAt:orders[orders.length-1]?.paidAt, attempts:attempts.slice(0,30), daily, subjects, activity, updates:state.updates.slice(0,10), totalTests:attempts.length, averageScore:attempts.length ? Math.round(attempts.reduce((n,a) => n + a.correct / Math.max(a.total,1) * 100,0) / attempts.length) : 0 });
    }
    if (p.startsWith('/api/admin/')) {
      requireRole(req, 'admin');
      if (p === '/api/admin/overview' && req.method === 'GET') {
        const range = dateRange(url);
        const events = state.analytics.events.filter(e => e.at >= range.start && e.at <= range.end);
        const orders = state.orders.filter(o => o.createdAt >= range.start && o.createdAt <= range.end);
        const paid = state.orders.filter(o => o.status === 'paid' && o.mode === 'live' && o.paidAt >= range.start && o.paidAt <= range.end);
        const testPaid = state.orders.filter(o => o.status === 'paid' && o.mode === 'test' && o.paidAt >= range.start && o.paidAt <= range.end);
        const unique = type => new Set(events.filter(e => e.type === type && e.visitorId).map(e => e.visitorId));
        const visitors = unique('page_view');
        const interested = unique('buy_click');
        const checkoutVisitors = unique('checkout_started');
        const buyerIds = new Set(state.orders.filter(o => o.status === 'paid' && o.mode === 'live').map(o => o.visitorId).filter(Boolean));
        const clickNoPurchase = [...interested].filter(id => !buyerIds.has(id)).length;
        const pageCounts = new Map();
        for (const event of events.filter(e => e.type === 'page_view')) pageCounts.set(event.detail || '/', (pageCounts.get(event.detail || '/') || 0) + 1);
        const topPages = [...pageCounts].map(([pathName, views]) => ({ path:pathName, views })).sort((a,b) => b.views-a.views).slice(0,8);
        const dates = Array.from({ length: range.days }, (_, i) => dayKey(new Date(Date.parse(range.start) + i * 86400000)));
        const daily = dates.map(date => {
          const ev = events.filter(e => dayKey(e.at) === date);
          const dayOrders = paid.filter(o => dayKey(o.paidAt) === date);
          return { date, visitors:new Set(ev.filter(e => e.type === 'page_view').map(e => e.visitorId)).size, pageViews:ev.filter(e => e.type === 'page_view').length, buyClicks:new Set(ev.filter(e => e.type === 'buy_click').map(e => e.visitorId)).size, checkouts:ev.filter(e => e.type === 'checkout_started').length, purchases:dayOrders.length, revenue:dayOrders.reduce((n,o) => n + o.amount, 0) };
        });
        const customers = [...new Set(state.orders.filter(o => o.status === 'paid').map(o => o.email))].map(email => {
          const ownOrders = state.orders.filter(o => o.status === 'paid' && o.email === email);
          const attempts = state.attempts.filter(a => a.email === email);
          const lastEvent = state.analytics.events.filter(e => e.email === email).at(-1);
          return { email, phone:ownOrders[0]?.phone || '', accessCode:ownOrders[0]?.accessCodeEncrypted ? decrypt(ownOrders[0].accessCodeEncrypted) : '', role:state.userRoles[email] || 'student', joinedAt:ownOrders.at(-1)?.paidAt, purchases:ownOrders.length, paidRevenue:ownOrders.filter(o => o.mode === 'live').reduce((n,o) => n + o.amount,0), tests:attempts.length, averageScore:attempts.length ? Math.round(attempts.reduce((n,a) => n + a.correct / Math.max(a.total,1) * 100,0) / attempts.length) : null, lastActive:lastEvent?.at || ownOrders[0]?.paidAt, lastSubject:attempts[0]?.subjectName || null, testMode:ownOrders.every(o => o.mode === 'test') };
        });
        return json(res, 200, { ok:true, range, purchases:paid.length, testPurchases:testPaid.length, revenue:paid.reduce((n,o) => n + o.amount,0), lifetimePurchases:state.orders.filter(o => o.status === 'paid' && o.mode === 'live').length, lifetimeRevenue:state.orders.filter(o => o.status === 'paid' && o.mode === 'live').reduce((n,o) => n + o.amount,0), lifetimeStudents:new Set(state.orders.filter(o => o.status === 'paid' && o.mode === 'live').map(o => o.email)).size, totalTestAttempts:state.attempts.length, visitors:visitors.size, pageViews:events.filter(e => e.type === 'page_view').length, buyClicks:interested.size, checkouts:orders.length, checkoutVisitors:checkoutVisitors.size, clickNoPurchase, conversion:visitors.size ? Math.round(new Set(paid.map(o => o.visitorId).filter(Boolean)).size / visitors.size * 1000) / 10 : 0, daily, topPages, customers:customers.sort((a,b) => b.lastActive.localeCompare(a.lastActive)), orders:state.orders.filter(o => o.status === 'paid').map(publicOrder).slice(0, 100), questions:state.questions, config:state.config, pdf:state.pdf, updates:state.updates });
      }
      if (p.startsWith('/api/admin/students/') && req.method === 'GET') {
        const email = decodeURIComponent(p.slice('/api/admin/students/'.length));
        if (!state.orders.some(o => o.status === 'paid' && o.email === email)) return fail(res, 404, 'Student not found.');
        const orders = state.orders.filter(o => o.status === 'paid' && o.email === email).map(publicOrder);
        const attempts = state.attempts.filter(a => a.email === email);
        const events = state.analytics.events.filter(e => e.email === email && ['test_completed','pdf_view','pdf_download','checkout_started','purchase'].includes(e.type)).slice(-50).reverse();
        return json(res, 200, { ok:true, email, role:state.userRoles[email] || 'student', accessCode:orders[0]?.accessCodeEncrypted ? decrypt(orders[0].accessCodeEncrypted) : '', orders, attempts, events });
      }
      if (p.startsWith('/api/admin/students/') && req.method === 'PUT') {
        const email = decodeURIComponent(p.slice('/api/admin/students/'.length));
        const input = await body(req);
        if (!['student','admin'].includes(input.role)) return fail(res, 400, 'Role must be student or admin.');
        state.userRoles[email] = input.role; await save();
        return json(res, 200, { ok:true, email, role:input.role });
      }
      if (p === '/api/admin/updates' && req.method === 'POST') {
        const input = await body(req);
        const title = String(input.title || '').trim().slice(0,120);
        const message = String(input.message || '').trim().slice(0,800);
        if (title.length < 3 || message.length < 10) return fail(res, 400, 'Add a title and a useful update message.');
        state.updates.unshift({ id:crypto.randomUUID(), title, message, at:new Date().toISOString() });
        await save(); return json(res, 201, { ok:true });
      }
      if (p.match(/^\/api\/admin\/updates\/[^/]+$/) && req.method === 'DELETE') {
        state.updates = state.updates.filter(u => u.id !== p.split('/')[4]);
        await save(); return json(res, 200, { ok:true });
      }
      if (p === '/api/admin/config' && req.method === 'PUT') {
        const input = await body(req);
        const price = Number(input.price);
        if (!Number.isInteger(price) || price < 1 || price > 50000) return fail(res, 400, 'Price must be between ₹1 and ₹50,000.');
        state.config = { ...state.config, price, title: String(input.title || '').trim().slice(0,120), subtitle: String(input.subtitle || '').trim().slice(0,250), paperLabel: String(input.paperLabel || '').trim().slice(0,120) };
        await save(); return json(res, 200, { ok: true, config: state.config });
      }
      if (p === '/api/admin/pdf' && req.method === 'POST') {
        const input = await body(req, 36 * 1024 * 1024);
        const data = Buffer.from(String(input.base64 || ''), 'base64');
        if (data.length < 100 || data.length > 25 * 1024 * 1024 || data.subarray(0,5).toString() !== '%PDF-') return fail(res, 400, 'Upload a valid PDF smaller than 25 MB.');
        const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
        const isDemo = existsSync(demoPdf) && same(digest(data), digest(readFileSync(demoPdf)));
        const temp = pdfFile + '.tmp'; await writeFile(temp, data, { mode: 0o600 }); await rename(temp, pdfFile);
        if (firebaseBucket) await firebaseBucket.file('main-paper.pdf').save(data, { resumable: false, metadata: { contentType: 'application/pdf' } });
        state.pdf = { name: String(input.name || 'Main paper.pdf').slice(0,120), size: data.length, updatedAt: new Date().toISOString(), demo:isDemo };
        await save(); return json(res, 200, { ok: true, pdf: state.pdf });
      }
      if (p === '/api/admin/questions' && req.method === 'POST') {
        const input = await body(req);
        const q = validateQuestion(input);
        q.id = crypto.randomUUID(); state.questions.push(q); await save();
        return json(res, 201, { ok: true, question: q });
      }
      const match = p.match(/^\/api\/admin\/questions\/([^/]+)$/);
      if (match && req.method === 'PUT') {
        const i = state.questions.findIndex(q => q.id === match[1]);
        if (i < 0) return fail(res, 404, 'Question not found.');
        state.questions[i] = { ...validateQuestion(await body(req)), id: match[1] }; await save();
        return json(res, 200, { ok: true, question: state.questions[i] });
      }
      if (match && req.method === 'DELETE') {
        state.questions = state.questions.filter(q => q.id !== match[1]); await save();
        return json(res, 200, { ok: true });
      }
    }
    return fail(res, 404, 'Not found.');
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error('API error:', error);
    return fail(res, status, status === 500 ? 'Something went wrong. Please try again.' : error.message);
  }
}
function validateQuestion(input) {
  const subjectId = String(input.subjectId || '');
  const prompt = String(input.prompt || '').trim();
  const options = Array.isArray(input.options) ? input.options.map(o => String(o).trim()) : [];
  const correctIndex = Number(input.correctIndex);
  const explanation = String(input.explanation || '').trim();
  if (!state.subjects.some(s => s.id === subjectId) || prompt.length < 15 || options.length !== 4 || options.some(o => !o) || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || explanation.length < 10) throw Object.assign(new Error('Complete the subject, question, four options, correct answer and explanation.'), { status: 400 });
  return { subjectId, prompt: prompt.slice(0,2000), options: options.map(o => o.slice(0,500)), correctIndex, explanation: explanation.slice(0,3000) };
}

let vite;
if (!isProduction) vite = await (await import('vite')).createServer({ server: { middlewareMode: true }, appType: 'spa' });
export const requestHandler = async (req, res) => {
  if (req.url.startsWith('/api/')) return api(req, res);
  if (vite) return vite.middlewares(req, res);
  const url = new URL(req.url, 'http://localhost');
  const distRoot = path.join(root, 'dist');
  let target = '';
  try { target = path.join(distRoot, decodeURIComponent(url.pathname)); } catch { /* use app shell */ }
  const relative = target ? path.relative(distRoot, target) : '..';
  const safe = relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
  const file = safe && existsSync(target) && statSync(target).isFile() ? target : path.join(distRoot, 'index.html');
  const ext = path.extname(file);
  const type = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options':'nosniff' });
  createReadStream(file).pipe(res);
};

if (!process.env.VERCEL) {
  const server = http.createServer(requestHandler);
  server.listen(port, host, () => console.log(`CivilPrelims running at http://${host}:${port} (${checkoutMode()} checkout)`));
}
