import React, { useState } from 'react';
import { ArrowRight, BookOpen, KeyRound, LockKeyhole } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

export default function LoginPage() {
  const { navigate, refresh, catalog } = useStore();
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (role === 'student') await api('/api/student/login', { method:'POST', body: JSON.stringify({ email, accessCode: code }) });
      else await api('/api/admin/login', { method:'POST', body: JSON.stringify({ password }) });
      await refresh(); navigate(role === 'student' ? 'dashboard' : 'admin');
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
    if (!email.trim()) { setError('Enter your purchase email first.'); return; }
    setBusy(true); setError(''); setMessage('');
    try { const result = await api('/api/student/recover', {method:'POST', body:JSON.stringify({email})}); setMessage(result.message); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <main className="access-page"><div className="container access-layout"><div className="access-copy"><div className="section-kicker">YOUR CIVILPRELIMS ACCOUNT</div><h1>Back to your<br/><em>practice.</em></h1><p>Open the paper, pick a subject, and carry on where you left off. Your purchase gives you access on any device.</p><div className="access-aside"><BookOpen size={24}/><span>The main PDF and subject tests live together in your library.</span></div></div><div className="access-card"><div className="access-tabs"><button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button><button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button></div><div className="access-card-body"><div className="access-icon">{role === 'student' ? <KeyRound size={24}/> : <LockKeyhole size={24}/>}</div><h2>{role === 'student' ? 'Sign in to your library' : 'Admin sign in'}</h2><p>{role === 'student' ? 'Use the email and access code from your purchase.' : 'Manage orders, the main PDF, price and test questions.'}</p><form onSubmit={submit}>{role === 'student' ? <><label htmlFor="login-email">Purchase email</label><input id="login-email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/><label htmlFor="login-code">Access code</label><input id="login-code" required value={code} onChange={e => setCode(e.target.value)} placeholder="Your private access code"/></> : <><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password"/></>}<button className="btn btn-coral" disabled={busy} type="submit">{busy ? 'Checking…' : role === 'student' ? 'Open my library' : 'Open admin'} <ArrowRight size={18}/></button></form>{role === 'student' && catalog.checkoutMode === 'live' && <button className="access-demo" disabled={busy} onClick={recover}>Email my access code <ArrowRight size={16}/></button>}{role === 'admin' && catalog.checkoutMode === 'test' && <button className="access-demo" onClick={localDemo}>Open local test admin <ArrowRight size={16}/></button>}{message && <p className="access-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</div></div></div></main>;
}
