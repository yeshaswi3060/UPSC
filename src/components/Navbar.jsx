import React, { useState } from 'react';
import { ArrowUpRight, BookOpen, Menu, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar() {
  const { catalog, session, currentView, navigate, openCheckout, logout } = useStore();
  const [open, setOpen] = useState(false);
  const checkoutReady = catalog.checkoutMode !== 'unavailable';
  const go = (view) => { navigate(view); setOpen(false); };
  const jump = (id) => {
    if (currentView !== 'landing') {
      navigate('landing');
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    } else document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setOpen(false);
  };
  return <header className="site-header">
    <div className="utility-bar"><div className="container"><span>INDEPENDENT UPSC PRELIMS PRACTICE</span><span>2026 PAPER SERIES <span className="utility-star">✳</span> BUILT FOR SERIOUS REVISION</span></div></div>
    <div className="container nav-inner">
      <button className="brand" onClick={() => go('landing')} aria-label="CivilPrelims home"><span className="brand-icon"><BookOpen size={24} strokeWidth={1.8}/></span><span className="brand-word">civil<span>prelims</span><small>QUESTION PAPERS · TEST PRACTICE</small></span></button>
      <nav className={open ? 'nav-menu open' : 'nav-menu'} aria-label="Main navigation">
        <button onClick={() => jump('inside')}>What you get</button>
        <button onClick={() => jump('sample')}>Sample question</button>
        <button onClick={() => jump('how-it-works')}>How it works</button>
        {session?.role === 'student' && <button onClick={() => go('dashboard')}>My library</button>}
        {session?.role === 'student' && <button onClick={() => go('profile')}>My progress</button>}
        {session?.role === 'admin' && <button onClick={() => go('admin')}>Admin</button>}
        {!session && <button onClick={() => go('login')}>Log in / Sign up</button>}
        {session && <button className="mobile-only" onClick={async () => { await logout(); setOpen(false); }}>Sign out</button>}
        {!session && <button className="mobile-only" disabled={!checkoutReady} onClick={() => { openCheckout(); setOpen(false); }}>{checkoutReady ? `Get paper · ₹${catalog.config.price}` : 'Launching soon'}</button>}
      </nav>
      <div className="nav-actions">
        {session ? <button className="nav-text-action" onClick={logout}>Sign out</button> : <button className="nav-text-action" onClick={() => go('login')}>Log in / Sign up</button>}
        {session?.role === 'student' ? <button className="nav-buy" onClick={() => go('dashboard')}>My library <ArrowUpRight size={18}/></button> : session?.role === 'admin' ? <button className="nav-buy" onClick={() => go('landing')}>View site <ArrowUpRight size={18}/></button> : <button className="nav-buy" onClick={openCheckout} disabled={!checkoutReady}><span className="nav-buy-desktop">{checkoutReady ? 'Get the paper' : 'Launching soon'}</span><span className="nav-buy-mobile">{checkoutReady ? 'Get' : 'Soon'}</span>{checkoutReady && <strong>₹{catalog.config.price}</strong>}<ArrowUpRight size={18}/></button>}
        <button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={24}/> : <Menu size={24}/>}</button>
      </div>
    </div>
  </header>;
}
