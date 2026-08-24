/**
 * Learnova payment tracking → Google Sheets
 *
 * Script Properties required:
 *   SHEET_ID          Google Spreadsheet ID
 *   SHEET_SYNC_SECRET Long random secret shared ONLY with your payment backend
 *
 * Browser events are useful for lead/checkout tracking but are never trusted as
 * proof of payment. Only a server-signed envelope may set a paid/verified state.
 */

const PAYMENT_SHEET = 'Payments';
const EVENT_SHEET = 'Payment Events';

const PAYMENT_HEADERS = [
  'created_at',
  'updated_at',
  'lead_id',
  'session_id',
  'buyer_name',
  'email',
  'phone',
  'product_id',
  'product_title',
  'amount_paise',
  'amount_inr',
  'currency',
  'source_url',
  'referrer',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'latest_event',
  'payment_status',
  'razorpay_order_id',
  'razorpay_payment_id',
  'payment_method',
  'failure_code',
  'failure_description',
  'failure_step',
  'failure_reason',
  'attempt_count',
  'payment_verified',
  'paid_at',
  'fulfilled_at',
  'notes',
];

const EVENT_HEADERS = [
  'received_at',
  'event_id',
  'lead_id',
  'session_id',
  'event',
  'trusted_server_event',
  'payment_status',
  'razorpay_order_id',
  'razorpay_payment_id',
  'email',
  'phone',
  'failure_code',
  'failure_description',
  'payload_json',
];

const SERVER_ONLY_EVENTS = [
  'payment_verified',
  'payment_captured',
  'order_paid',
  'fulfilment_completed',
];

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Learnova payment tracker',
    timestamp: new Date().toISOString(),
  });
}

function doPost(e) {
  try {
    const request = parseRequest_(e);
    const payload = request.payload;

    validatePayload_(payload, request.trusted);
    const result = recordPaymentEvent_(payload, request.trusted);

    return jsonResponse_({ ok: true, lead_id: result.leadId });
  } catch (error) {
    console.error('Payment tracker error: ' + error.message);
    return jsonResponse_({ ok: false, error: error.message });
  }
}

/** Run once from the Apps Script editor before deploying the web app. */
function setupSheets() {
  const spreadsheet = getSpreadsheet_();
  setupSheet_(spreadsheet, PAYMENT_SHEET, PAYMENT_HEADERS, '#0c1b2a');
  setupSheet_(spreadsheet, EVENT_SHEET, EVENT_HEADERS, '#b96c15');

  const payments = spreadsheet.getSheetByName(PAYMENT_SHEET);
  payments.setFrozenColumns(3);
  payments.getRange('J:J').setNumberFormat('0');
  payments.getRange('K:K').setNumberFormat('₹0.00');
  payments.getRange('AA:AA').setNumberFormat('0');

  return 'Learnova payment sheets are ready.';
}

function parseRequest_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing request body.');
  }

  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (error) {
    throw new Error('Request body must be valid JSON.');
  }

  // Secure server-to-server events use a signed envelope. The exact payload
  // string is signed so field order and JSON formatting cannot cause mismatch.
  if (body.payload && body.signature) {
    verifyServerEnvelope_(String(body.payload), String(body.signature));
    return { payload: JSON.parse(body.payload), trusted: true };
  }

  return { payload: body, trusted: false };
}

function verifyServerEnvelope_(rawPayload, receivedSignature) {
  const secret = getRequiredProperty_('SHEET_SYNC_SECRET');
  const expectedSignature = hmacHex_(rawPayload, secret);
  if (!constantTimeEqual_(expectedSignature, receivedSignature)) {
    throw new Error('Invalid server signature.');
  }
}

function validatePayload_(payload, trusted) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid payload.');
  if (!payload.event) throw new Error('event is required.');
  if (!payload.lead_id && !(trusted && payload.razorpay_order_id)) {
    throw new Error('lead_id or a trusted razorpay_order_id is required.');
  }

  if (SERVER_ONLY_EVENTS.indexOf(payload.event) !== -1 && !trusted) {
    throw new Error('This event requires a trusted server signature.');
  }

  if (payload.email && !/^\S+@\S+\.\S+$/.test(String(payload.email))) {
    throw new Error('Invalid email address.');
  }

  if (payload.phone && String(payload.phone).replace(/\D/g, '').length < 10) {
    throw new Error('Invalid phone number.');
  }

  if (payload.amount_paise !== undefined) {
    const amount = Number(payload.amount_paise);
    if (!Number.isInteger(amount) || amount < 0 || amount > 100000000) {
      throw new Error('Invalid amount.');
    }
  }
}

function recordPaymentEvent_(payload, trusted) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const spreadsheet = getSpreadsheet_();
    const payments = getOrCreateSheet_(spreadsheet, PAYMENT_SHEET, PAYMENT_HEADERS);
    const events = getOrCreateSheet_(spreadsheet, EVENT_SHEET, EVENT_HEADERS);
    const now = new Date().toISOString();
    const requestedLeadId = cleanText_(payload.lead_id, 100);
    const orderId = cleanText_(payload.razorpay_order_id, 100);
    const paymentRow = findPaymentRow_(payments, requestedLeadId, orderId);
    const previous = paymentRow ? rowToObject_(payments, paymentRow, PAYMENT_HEADERS) : {};
    const leadId = requestedLeadId || cleanText_(previous.lead_id, 100) || ('unmatched_' + orderId);
    const next = mergePayment_(previous, payload, trusted, now, leadId);

    const values = PAYMENT_HEADERS.map(function (header) {
      return safeCell_(next[header]);
    });

    if (paymentRow) {
      payments.getRange(paymentRow, 1, 1, PAYMENT_HEADERS.length).setValues([values]);
    } else {
      payments.appendRow(values);
    }

    appendEvent_(events, payload, trusted, now, leadId);
    return { leadId: leadId };
  } finally {
    lock.releaseLock();
  }
}

function mergePayment_(previous, payload, trusted, now, leadId) {
  const event = cleanText_(payload.event, 80);
  const next = Object.assign({}, previous);
  const status = statusForEvent_(event, trusted, previous.payment_status);

  next.created_at = previous.created_at || cleanText_(payload.created_at, 50) || now;
  next.updated_at = now;
  next.lead_id = leadId;
  next.session_id = cleanText_(payload.session_id, 100) || previous.session_id;
  next.buyer_name = cleanText_(payload.buyer_name, 120) || previous.buyer_name;
  next.email = cleanText_(payload.email, 200) || previous.email;
  next.phone = cleanText_(payload.phone, 30) || previous.phone;
  next.product_id = cleanText_(payload.product_id, 100) || previous.product_id;
  next.product_title = cleanText_(payload.product_title, 200) || previous.product_title;
  next.amount_paise = numericOrPrevious_(payload.amount_paise, previous.amount_paise);
  next.amount_inr = next.amount_paise === '' || next.amount_paise === undefined ? '' : Number(next.amount_paise) / 100;
  next.currency = cleanText_(payload.currency, 10) || previous.currency || 'INR';
  next.source_url = cleanText_(payload.source_url, 500) || previous.source_url;
  next.referrer = cleanText_(payload.referrer, 500) || previous.referrer;
  next.utm_source = cleanText_(payload.utm_source, 100) || previous.utm_source;
  next.utm_medium = cleanText_(payload.utm_medium, 100) || previous.utm_medium;
  next.utm_campaign = cleanText_(payload.utm_campaign, 150) || previous.utm_campaign;
  next.latest_event = event;
  next.payment_status = status;
  next.razorpay_order_id = cleanText_(payload.razorpay_order_id, 100) || previous.razorpay_order_id;
  next.razorpay_payment_id = cleanText_(payload.razorpay_payment_id, 100) || previous.razorpay_payment_id;
  next.payment_method = cleanText_(payload.payment_method, 50) || previous.payment_method;
  next.failure_code = cleanText_(payload.failure_code, 100) || (status === 'PAID' ? '' : previous.failure_code);
  next.failure_description = cleanText_(payload.failure_description, 500) || (status === 'PAID' ? '' : previous.failure_description);
  next.failure_step = cleanText_(payload.failure_step, 100) || (status === 'PAID' ? '' : previous.failure_step);
  next.failure_reason = cleanText_(payload.failure_reason, 100) || (status === 'PAID' ? '' : previous.failure_reason);
  next.attempt_count = attemptCount_(event, previous.attempt_count);
  next.payment_verified = trusted && SERVER_ONLY_EVENTS.indexOf(event) !== -1 ? 'YES' : (previous.payment_verified || 'NO');
  next.paid_at = status === 'PAID' ? (cleanText_(payload.paid_at, 50) || previous.paid_at || now) : previous.paid_at;
  next.fulfilled_at = event === 'fulfilment_completed' ? (cleanText_(payload.fulfilled_at, 50) || now) : previous.fulfilled_at;
  next.notes = cleanText_(payload.notes, 500) || previous.notes;
  return next;
}

function appendEvent_(sheet, payload, trusted, now, leadId) {
  const eventRecord = {
    received_at: now,
    event_id: cleanText_(payload.event_id, 100) || Utilities.getUuid(),
    lead_id: leadId,
    session_id: cleanText_(payload.session_id, 100),
    event: cleanText_(payload.event, 80),
    trusted_server_event: trusted ? 'YES' : 'NO',
    payment_status: statusForEvent_(payload.event, trusted, ''),
    razorpay_order_id: cleanText_(payload.razorpay_order_id, 100),
    razorpay_payment_id: cleanText_(payload.razorpay_payment_id, 100),
    email: cleanText_(payload.email, 200),
    phone: cleanText_(payload.phone, 30),
    failure_code: cleanText_(payload.failure_code, 100),
    failure_description: cleanText_(payload.failure_description, 500),
    payload_json: cleanText_(JSON.stringify(redactPayload_(payload)), 45000),
  };
  sheet.appendRow(EVENT_HEADERS.map(function (header) { return safeCell_(eventRecord[header]); }));
}

function statusForEvent_(event, trusted, previousStatus) {
  const statuses = {
    lead_captured: 'LEAD_CAPTURED',
    checkout_opened: 'PAYMENT_STARTED',
    checkout_closed: 'CHECKOUT_CLOSED',
    payment_failed: 'PAYMENT_FAILED',
    payment_callback_received: 'VERIFYING',
    order_created: 'ORDER_CREATED',
  };

  if (trusted && event === 'payment_verified') return 'VERIFIED';
  if (trusted && ['payment_captured', 'order_paid', 'fulfilment_completed'].indexOf(event) !== -1) {
    return 'PAID';
  }
  return statuses[event] || previousStatus || 'UNKNOWN';
}

function attemptCount_(event, previous) {
  const count = Number(previous || 0);
  return event === 'checkout_opened' ? count + 1 : count;
}

function findPaymentRow_(sheet, leadId, orderId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const values = sheet.getRange(2, 3, lastRow - 1, 18).getDisplayValues();
  for (let index = 0; index < values.length; index += 1) {
    if (leadId && values[index][0] === leadId) return index + 2;
    if (orderId && values[index][17] === orderId) return index + 2;
  }
  return null;
}

function rowToObject_(sheet, row, headers) {
  const values = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  return headers.reduce(function (record, header, index) {
    record[header] = values[index];
    return record;
  }, {});
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(getRequiredProperty_('SHEET_ID'));
}

function getRequiredProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value) throw new Error('Missing Script Property: ' + name);
  return value;
}

function getOrCreateSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) setupSheet_(spreadsheet, name, headers, '#0c1b2a');
  return sheet;
}

function setupSheet_(spreadsheet, name, headers, colour) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground(colour)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setWrap(true);
  sheet.setFrozenRows(1);
  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), headers.length).createFilter();
  }
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function hmacHex_(value, secret) {
  const bytes = Utilities.computeHmacSha256Signature(value, secret, Utilities.Charset.UTF_8);
  return bytes.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function constantTimeEqual_(left, right) {
  const a = String(left);
  const b = String(right);
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a.charCodeAt(index % Math.max(a.length, 1)) || 0) ^ (b.charCodeAt(index % Math.max(b.length, 1)) || 0);
  }
  return mismatch === 0;
}

function redactPayload_(payload) {
  const copy = Object.assign({}, payload);
  delete copy.razorpay_signature;
  delete copy.server_signature;
  delete copy.card;
  delete copy.vpa;
  return copy;
}

function cleanText_(value, maxLength) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function numericOrPrevious_(value, previous) {
  if (value === undefined || value === null || value === '') return previous === undefined ? '' : previous;
  return Number(value);
}

function safeCell_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number' || value instanceof Date) return value;
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
