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
    if (!identifier.trim() || !identifier.includes('@')) { setError('Enter your purchase email first.'); return; }
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
  return <main className="access-page"><div className="container access-layout"><div className="access-copy"><div className="section-kicker">YOUR CIVILPRELIMS ACCOUNT</div><h1>Back to your<br/><em>practice.</em></h1><p>Use one sign-in. Students enter their purchase email and access code; the site recognises the admin password and opens the admin workspace automatically.</p><div className="access-aside"><BookOpen size={24}/><span>The main PDF and subject tests live together in your library.</span></div></div><div className="access-card"><div className="access-card-body"><div className="access-icon"><KeyRound size={24}/></div><h2>Sign in</h2><p>Enter your purchase email and access code, or the admin password.</p><form onSubmit={submit}><label htmlFor="login-identifier">Purchase email or admin ID</label><input id="login-identifier" type="text" required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com or admin"/><label htmlFor="login-secret">Give access code <span>(if you don’t know it, open your email and get the code there)</span></label><input id="login-secret" type="password" required autoComplete="current-password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="Enter your access code"/><button className="btn btn-coral" disabled={busy} type="submit">{busy ? 'Checking…' : 'Continue'} <ArrowRight size={18}/></button></form><button className="google-login" disabled={busy} onClick={googleLogin}><span className="google-mark">G</span> Continue with Google</button><button className="access-demo" disabled={busy} onClick={recover}>Forgot access code? Email it to me <ArrowRight size={16}/></button>{catalog.checkoutMode === 'test' && <button className="access-demo" onClick={localDemo}>Open local test admin <ArrowRight size={16}/></button>}{message && <p className="access-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</div></div></div></main>;
}
