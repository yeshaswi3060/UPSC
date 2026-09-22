import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CreditCard, LockKeyhole, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Secure checkout could not load. Check your connection.'));
    document.head.appendChild(script);
  });
}

export default function CheckoutModal() {
  const { checkoutOpen, setCheckoutOpen, catalog, refresh, navigate } = useStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState('details');
  const [order, setOrder] = useState(null);
  const [access, setAccess] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!checkoutOpen) return;
    const onKey = (e) => { if (e.key === 'Escape' && stage !== 'processing') setCheckoutOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [checkoutOpen, setCheckoutOpen, stage]);
  if (!checkoutOpen) return null;
  const close = () => { if (busy) return; setCheckoutOpen(false); setStage('details'); setOrder(null); setError(''); };
  const finish = async (result) => { setAccess(result); await refresh(); setStage('success'); setBusy(false); };
  const begin = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const created = await api('/api/checkout/order', { method:'POST', body: JSON.stringify({ email, phone }) });
      setOrder(created);
      if (created.mode === 'test') { setStage('test'); setBusy(false); return; }
      await loadRazorpay();
      setBusy(false);
      const checkout = new window.Razorpay({
        key: created.keyId, amount: created.amount * 100, currency:'INR',
        name:'CivilPrelims', description:'UPSC Prelims Practice Papers', order_id: created.razorpayOrderId,
        prefill: { email, contact: phone }, theme: { color:'#173b35' },
        handler: async (payment) => {
          setBusy(true); setStage('processing');
          try {
            const verified = await api('/api/checkout/verify', { method:'POST', body: JSON.stringify({ checkoutId: created.checkoutId, ...payment }) });
            if (verified.pending) { setError(verified.message); setStage('pending'); setBusy(false); return; }
            await finish(verified);
          } catch (err) { setError(err.message); setStage('pending'); setBusy(false); }
        },
        modal: { ondismiss: () => { setStage('details'); setBusy(false); } }
      });
      checkout.on('payment.failed', response => { setError(response.error?.description || 'Payment failed. Please try again.'); setStage('details'); });
      checkout.open();
    } catch (err) { setError(err.message); setBusy(false); setStage('details'); }
  };
  const finishTest = async () => {
    setBusy(true); setError('');
    try { await finish(await api('/api/checkout/test-complete', { method:'POST', body: JSON.stringify({ checkoutId: order.checkoutId }) })); }
    catch (err) { setError(err.message); setBusy(false); }
  };
  return <div className="modal-overlay" onMouseDown={close}><div className="modal-content checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={e => e.stopPropagation()}>
    <button className="modal-close-btn" aria-label="Close checkout" onClick={close}><X size={21}/></button>
    <div className="modal-brand">CIVILPRELIMS <span>/</span> SECURE ACCESS</div>
    {stage === 'success' ? <div className="checkout-success"><div className="success-icon"><Check size={29}/></div><h2 id="checkout-title">Your library is ready.</h2><p>{access?.testMode ? 'Test order complete. No money was charged.' : 'Your payment was verified.'} Your paper and subject tests are now in your library.</p><div className="access-code-box"><span>YOUR ACCESS CODE</span><strong>{access?.accessCode}</strong><small>Save this code. Use it with {access?.email} when you sign in again.{access?.emailSent ? ' We also sent it to your email.' : ''}</small></div><button className="btn btn-coral" onClick={() => { close(); navigate('dashboard'); }}>Open my library <ArrowUpRight size={19}/></button></div>
    : stage === 'pending' ? <div className="checkout-pending"><h2 id="checkout-title">We are checking your payment.</h2><p>{error || 'If the payment was captured, your access code will be emailed after confirmation. Please do not pay again until you check your email.'}</p><button className="btn btn-dark" onClick={close}>Close</button></div>
    : stage === 'processing' ? <div className="checkout-pending"><h2 id="checkout-title">Verifying your payment…</h2><p>Please keep this window open for a moment.</p></div>
    : <><div className="checkout-step">01 / COMPLETE YOUR ORDER</div><h2 id="checkout-title">Your next study session starts here.</h2><p className="checkout-intro">One payment gives you the main PDF, answer explanations and every subject test.</p><div className="checkout-summary"><div><span>COMPLETE PRACTICE KIT</span><small>Paper PDF · explained answers · online tests</small></div><strong>₹{catalog.config.price}</strong></div>
      {catalog.checkoutMode === 'unavailable' ? <div className="checkout-unavailable"><LockKeyhole size={22}/><div><strong>Checkout is being prepared.</strong><p>The main PDF and payment setup must be ready before anyone can be charged.</p></div></div> : stage === 'test' ? <div className="test-payment"><span>LOCAL TEST CHECKOUT</span><p>This completes a test order for {email}. No money will be charged. You can then inspect the PDF and student test pages.</p><button className="btn btn-coral" disabled={busy} onClick={finishTest}>{busy ? 'Opening access…' : 'Complete test order'} <ArrowRight size={18}/></button><button className="checkout-back" onClick={() => setStage('details')}><ArrowLeft size={16}/> Edit details</button></div> : <form onSubmit={begin} className="checkout-form"><label htmlFor="buyer-email">Email address <small>For your access code</small></label><input id="buyer-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/><label htmlFor="buyer-phone">Mobile number <small>For your order</small></label><div className="phone-field"><span>+91</span><input id="buyer-phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} required autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="10-digit number"/></div><button className="btn btn-coral" type="submit" disabled={busy}>{busy ? 'Opening checkout…' : catalog.checkoutMode === 'test' ? 'Continue in test mode' : `Pay ₹${catalog.config.price} securely`} <ArrowUpRight size={19}/></button><div className="checkout-note"><CreditCard size={17}/><span>{catalog.checkoutMode === 'test' ? 'Local test mode · no charge' : 'Payment handled by Razorpay · verified before access'}</span></div></form>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </>}
  </div></div>;
}
