import React, { useState } from 'react';
import { ArrowRight, BookOpen, KeyRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { signInWithGoogle } from '../lib/firebaseAuth';

export default function LoginPage() {
  const { navigate, refresh, catalog } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('login');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const result = await api('/api/login', { method:'POST', body: JSON.stringify({ identifier, secret }) });
      await refresh(); navigate(result.role === 'admin' ? 'admin' : 'dashboard');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const localDemo = async () => {
    setBusy(true); setError('');
    try { await api('/api/admin/login', { method:'POST', body: JSON.stringify({ localDemo:true }) }); await refresh(); navigate('admin'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const recover = async () => {
    if (!identifier.trim() || !identifier.includes('@')) { setError('Enter your email address first.'); return; }
    setBusy(true); setError(''); setMessage('');
    try { const result = await api('/api/student/recover', {method:'POST', body:JSON.stringify({email: identifier})}); setMessage(result.message); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const googleLogin = async () => {
    setBusy(true); setError(''); setMessage('');
    try { const { idToken } = await signInWithGoogle(); const result = await api('/api/google-login', { method:'POST', body:JSON.stringify({ idToken }) }); await refresh(); navigate(result.role === 'admin' ? 'admin' : 'dashboard'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const switchMode = (nextMode) => { setMode(nextMode); setError(''); setMessage(''); };
  return <main className="access-page"><div className="container access-layout"><div className="access-copy"><div className="section-kicker">YOUR CIVILPRELIMS ACCOUNT</div><h1>{mode === 'signup' ? <>Start your<br/><em>practice.</em></> : <>Back to your<br/><em>practice.</em></>}</h1><p>Students get their account with a paper purchase and sign in with the purchase email and access code. The configured admin email gets the admin role after its one-time code or password is verified.</p><div className="access-aside"><BookOpen size={24}/><span>The main PDF and subject tests live together in your library.</span></div></div><div className="access-card"><div className="access-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Log in</button><button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Sign up</button></div><div className="access-card-body"><div className="access-icon"><KeyRound size={24}/></div><h2>{mode === 'signup' ? 'Create your account' : 'Log in'}</h2><p>{mode === 'signup' ? 'Students create access when they purchase a paper. The configured admin email can start here by requesting its admin sign-in code.' : 'Enter your purchase email and access code, or your admin email and sign-in code.'}</p><form onSubmit={submit}><label htmlFor="login-identifier">{mode === 'signup' ? 'Email address' : 'Purchase email or admin email'}</label><input id="login-identifier" type="email" required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com"/><label htmlFor="login-secret">{mode === 'signup' ? 'Access code' : 'Access code or admin sign-in code'} <span>(request a code by email below)</span></label><input id="login-secret" type="password" required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={secret} onChange={e => setSecret(e.target.value)} placeholder="Enter your code or admin password"/><button className="btn btn-coral" disabled={busy} type="submit">{busy ? 'Checking…' : mode === 'signup' ? 'Create account' : 'Log in'} <ArrowRight size={18}/></button></form><button className="google-login" disabled={busy} onClick={googleLogin}><span className="google-mark">G</span> Continue with Google</button><button className="access-demo" disabled={busy} onClick={recover}>{mode === 'signup' ? 'Email me a sign-up / sign-in code' : 'Email me a sign-in code'} <ArrowRight size={16}/></button>{catalog.checkoutMode === 'test' && <button className="access-demo" onClick={localDemo}>Open local test admin <ArrowRight size={16}/></button>}{message && <p className="access-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</div></div></div></main>;
}
