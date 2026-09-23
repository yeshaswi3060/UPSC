import React from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export default function Footer() {
  const { catalog, currentView, navigate, setCheckoutOpen } = useStore();
  const checkoutReady = catalog.checkoutMode !== 'unavailable';
  const jump = (id) => {
    if (currentView !== 'landing') { navigate('landing'); requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()); }
    else document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  };
  return <footer className="footer"><div className="container"><div className="footer-main"><div><button className="footer-brand" onClick={() => navigate('landing')}><span><BookOpen size={25}/></span>civil<em>prelims</em></button><p>Independent practice material for UPSC Prelims preparation. A paper to keep, tests to repeat, and answers to learn from.</p></div><div><h3>EXPLORE</h3><button onClick={() => jump('inside')}>What you get</button><button onClick={() => jump('sample')}>Sample question</button><button onClick={() => jump('how-it-works')}>How it works</button><button onClick={() => jump('faq')}>FAQs</button></div><div><h3>ACCESS</h3><button onClick={() => navigate('login')}>Log in / Sign up <ArrowUpRight size={15}/></button><button disabled={!checkoutReady} onClick={() => setCheckoutOpen(true)}>{checkoutReady ? `Get the paper · ₹${catalog.config.price}` : 'Launching soon'} <ArrowUpRight size={15}/></button><p>Questions are independently prepared. CivilPrelims is not affiliated with UPSC.</p></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} CivilPrelims</span><span>Read. Reason. Revise.</span></div></div></footer>;
}
