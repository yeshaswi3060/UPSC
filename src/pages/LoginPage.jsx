import React, { useState } from 'react';
import { ArrowRight, BookOpen, KeyRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { signInWithGoogle } from '../lib/firebaseAuth';

export default function LoginPage() {
  const { navigate, refresh, catalog } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('login');

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'signup') {
        if (newPassword.length < 10) throw new Error('Choose a password with at least 10 characters.');
        if (newPassword !== confirmPassword) throw new Error('The passwords do not match.');
        const result = await api('/api/admin/signup', { method:'POST', body:JSON.stringify({ email:identifier, code:secret, password:newPassword }) });
        await refresh(); navigate(result.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        const result = await api('/api/login', { method:'POST', body:JSON.stringify({ identifier, secret }) });
        await refresh(); navigate(result.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const localDemo = async () => {
    setBusy(true); setError('');
    try { await api('/api/admin/login', { method:'POST', body:JSON.stringify({ localDemo:true }) }); await refresh(); navigate('admin'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const recover = async () => {
    if (!identifier.trim() || !identifier.includes('@')) { setError('Enter your email address first.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await api('/api/student/recover', { method:'POST', body:JSON.stringify({ email:identifier }) });
      setMessage(result.message);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const googleLogin = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const { idToken } = await signInWithGoogle();
      const result = await api('/api/google-login', { method:'POST', body:JSON.stringify({ idToken }) });
      await refresh(); navigate(result.role === 'admin' ? 'admin' : 'dashboard');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const switchMode = (nextMode) => { setMode(nextMode); setError(''); setMessage(''); };
  const signup = mode === 'signup';

  return <main className="access-page"><div className="container access-layout">
    <div className="access-copy">
      <div className="section-kicker">YOUR CIVILPRELIMS ACCOUNT</div>
      <h1>{signup ? <>Start your<br/><em>practice.</em></> : <>Back to your<br/><em>practice.</em></>}</h1>
      <p>Students get account access with a paper purchase. The configured admin email can verify once by email and set a password for future sign-ins.</p>
      <div className="access-aside"><BookOpen size={24}/><span>The main PDF and subject tests live together in your library.</span></div>
    </div>
    <div className="access-card">
      <div className="access-tabs" role="tablist" aria-label="Account access">
        <button type="button" role="tab" aria-selected={!signup} className={!signup ? 'active' : ''} onClick={() => switchMode('login')}>Log in</button>
        <button type="button" role="tab" aria-selected={signup} className={signup ? 'active' : ''} onClick={() => switchMode('signup')}>Sign up</button>
      </div>
      <div className="access-card-body">
        <div className="access-icon"><KeyRound size={24}/></div>
        <h2>{signup ? 'Create your admin account' : 'Log in'}</h2>
        <p>{signup ? 'Enter your admin email and the latest six-digit email code, then choose a password. Students get access with a paper purchase.' : 'Students use their purchase email and access code. Admins can use their email and password, or request a one-time code.'}</p>
        <form onSubmit={submit}>
          <label htmlFor="login-identifier">{signup ? 'Admin email' : 'Purchase email or admin email'}</label>
          <input id="login-identifier" type="email" required autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="you@example.com"/>
          <label htmlFor="login-secret">{signup ? 'Latest six-digit email code' : 'Purchase access code or admin password'}</label>
          <input id="login-secret" type={signup ? 'text' : 'password'} inputMode={signup ? 'numeric' : undefined} autoComplete={signup ? 'one-time-code' : 'current-password'} required value={secret} onChange={e => setSecret(e.target.value)} placeholder={signup ? 'Enter the code from your email' : 'Enter your code or password'}/>
          {signup && <>
            <label htmlFor="new-admin-password">Create password</label>
            <input id="new-admin-password" type="password" autoComplete="new-password" minLength={10} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 10 characters"/>
            <label htmlFor="confirm-admin-password">Confirm password</label>
            <input id="confirm-admin-password" type="password" autoComplete="new-password" minLength={10} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Enter the same password again"/>
          </>}
          <button className="btn btn-coral" disabled={busy} type="submit">{busy ? 'Checking…' : signup ? 'Create account & sign in' : 'Continue'} <ArrowRight size={18}/></button>
        </form>
        <button className="google-login" disabled={busy} onClick={googleLogin}><span className="google-mark">G</span> Continue with Google</button>
        <button className="access-demo" disabled={busy} onClick={recover}>{signup ? 'Email me a sign-up code' : 'Email me a sign-in code'} <ArrowRight size={16}/></button>
        {catalog.checkoutMode === 'test' && <button className="access-demo" onClick={localDemo}>Open local test admin <ArrowRight size={16}/></button>}
        {message && <p className="access-message" role="status">{message}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
  </div></main>;
}
