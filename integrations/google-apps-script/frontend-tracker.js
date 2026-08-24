/**
 * Copy the relevant functions into the website integration.
 * This intentionally sends only non-authoritative browser events. A browser
 * event must never unlock files or mark an order as paid.
 */

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
const LEAD_KEY = 'prashnavali_lead_id';
const SESSION_KEY = 'prashnavali_session_id';

export function getLeadId() {
  return getOrCreateId_(LEAD_KEY, 'lead');
}

export function getPaymentSessionId() {
  return getOrCreateId_(SESSION_KEY, 'session');
}

export function trackBrowserPaymentEvent(event, details = {}) {
  if (!GOOGLE_SCRIPT_URL) return false;

  const query = new URLSearchParams(window.location.search);
  const payload = {
    event,
    event_id: makeId_('event'),
    created_at: new Date().toISOString(),
    lead_id: details.lead_id || getLeadId(),
    session_id: details.session_id || getPaymentSessionId(),
    product_id: 'upsc-gs2-complete-set',
    product_title: 'General Studies Paper II — Complete Question Set',
    amount_paise: 9900,
    currency: 'INR',
    source_url: window.location.href,
    referrer: document.referrer,
    utm_source: query.get('utm_source') || '',
    utm_medium: query.get('utm_medium') || '',
    utm_campaign: query.get('utm_campaign') || '',
    ...details,
  };

  const body = JSON.stringify(payload);

  // Beacon survives page closes better. Fetch is the fallback for browsers
  // where Beacon is unavailable. text/plain keeps the request simple.
  if (navigator.sendBeacon) {
    return navigator.sendBeacon(
      GOOGLE_SCRIPT_URL,
      new Blob([body], { type: 'text/plain;charset=UTF-8' }),
    );
  }

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body,
  }).catch(() => {});
  return true;
}

function getOrCreateId_(key, prefix) {
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = makeId_(prefix);
  localStorage.setItem(key, id);
  return id;
}

function makeId_(prefix) {
  const value = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${value}`;
}
