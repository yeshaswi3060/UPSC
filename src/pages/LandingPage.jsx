import React, { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Download, FileCheck2, FileText, Layers3, LockKeyhole, MoveUpRight, Play, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SAMPLE_QUESTIONS } from '../data/initialData';

const faq = [
  ['What exactly do I get for ₹99?', 'One downloadable main practice paper PDF, explained answers inside the paper, and access to subject-wise online tests. They are available together in your student library.'],
  ['How do I access it after paying?', 'Enter your email and 10-digit mobile number at checkout. Once payment is verified, your library opens and an access code is shown and emailed when email delivery is configured. Use your email and code to sign in later.'],
  ['Can I download the PDF on my phone?', 'Yes. The PDF opens in your browser and has a separate Download button. Your purchase is linked to your account, so you can return later.'],
  ['Are the tests included?', 'Yes. Your purchase includes the subject tests listed in the student library. Each test has its own page with questions, answers and explanations.'],
  ['Are these official UPSC papers?', 'No. These are independently prepared practice questions. CivilPrelims is not affiliated with UPSC and cannot guarantee an exam result.']
];

export default function LandingPage() {
  const { catalog, openCheckout, session, navigate } = useStore();
  const [selected, setSelected] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const sample = SAMPLE_QUESTIONS[0];
  const price = catalog.config.price;
  const owned = session?.role === 'student' && session.hasPurchase;
  const buy = owned ? () => navigate('dashboard') : openCheckout;
  return <main>
    <section className="hero" id="top">
      <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
      <div className="container hero-layout">
        <div className="hero-copy">
          <div className="hero-label"><span className="label-dot"/> THE PRELIMS PRACTICE KIT / 2026</div>
          <h1>Practice papers that help you <em>think through</em> the exam.</h1>
          <p className="hero-lead">A downloadable question paper, clear answer explanations, and focused subject tests. Everything in one place for <strong>₹{price}.</strong></p>
          <div className="hero-actions"><button className="btn btn-coral" onClick={buy}>{owned ? 'Open your library' : `Get the paper for ₹${price}`}<ArrowUpRight size={20}/></button><a className="hero-secondary" href="#sample">Try a question <ArrowDownRight size={18}/></a></div>
          <div className="hero-assurance"><span><Check size={15}/> One-time payment</span><span><Check size={15}/> PDF + online tests</span><span><Check size={15}/> Access on your phone</span></div>
        </div>
        <div className="hero-art" aria-label="Preview of the CivilPrelims practice paper">
          <div className="art-grid"/>
          <div className="art-circle"/>
          <div className="sheet sheet-back"><span>CP / 2026</span></div>
          <div className="sheet sheet-middle"><span>QUESTION PAPER · 02</span></div>
          <div className="sheet sheet-front">
            <div className="sheet-top"><span>CIVIL<br/>PRELIMS</span><span>THE PRACTICE KIT<br/>2026 EDITION</span></div>
            <div className="sheet-rule"/>
            <div className="sheet-series">GENERAL STUDIES / PRACTICE PAPER</div>
            <div className="sheet-heading">Read.<br/><i>Reason.</i><br/>Revise.</div>
            <div className="sheet-description">Questions are the starting point. Understanding the answer is the work.</div>
            <div className="sheet-footer"><span>PDF PAPER + EXPLAINED ANSWERS</span><span>01—06</span></div>
          </div>
          <div className="price-stamp"><small>COMPLETE<br/>ACCESS</small><strong>₹{price}</strong><span>ONE TIME</span></div>
          <div className="art-caption"><span className="caption-line"/> MADE FOR YOUR NEXT REVISION SESSION</div>
        </div>
      </div>
    </section>

    <section className="value-strip"><div className="container value-strip-inner"><div><FileText size={24}/><span><strong>1 main PDF</strong><small>Read or download</small></span></div><div><Layers3 size={24}/><span><strong>Subject-wise tests</strong><small>Practise by topic</small></span></div><div><FileCheck2 size={24}/><span><strong>Explained answers</strong><small>Know why it works</small></span></div><div><Smartphone size={24}/><span><strong>Phone-friendly access</strong><small>Study anywhere</small></span></div></div></section>

    <section className="section included-section" id="inside"><div className="container">
      <div className="section-topline"><span>01 / THE COMPLETE KIT</span><span>ONE PRICE. A CLEAR STUDY PLAN.</span></div>
      <div className="included-heading"><h2>Know exactly what<br/><em>you are buying.</em></h2><p>One place for the paper you can keep and the practice you can repeat. Open the PDF for revision, then use the tests to check what stayed with you.</p></div>
      <div className="included-grid">
        <article className="included-feature"><div className="included-icon"><Download size={25}/></div><span className="item-number">01 / KEEP IT</span><h3>The main paper PDF</h3><p>Read in your browser or download to your phone. Answers and reasoning stay with the questions for a better revision session.</p><div className="included-bottom"><span>{catalog.pdf ? catalog.pdf.name : 'Paper upload pending'}</span><MoveUpRight size={18}/></div></article>
        <article className="included-feature"><div className="included-icon"><Play size={25}/></div><span className="item-number">02 / WORK THROUGH IT</span><h3>Subject tests</h3><p>Open a dedicated test page for each subject. Answer the questions, review your score, and understand every missed option.</p><div className="included-bottom"><span>{catalog.subjects.length || 6} subject areas</span><MoveUpRight size={18}/></div></article>
        <article className="included-feature"><div className="included-icon"><LockKeyhole size={25}/></div><span className="item-number">03 / COME BACK</span><h3>Your own library</h3><p>After purchase, sign in with the email and access code linked to your order. Your paper and tests stay together in one account.</p><div className="included-bottom"><span>Access after verified payment</span><MoveUpRight size={18}/></div></article>
      </div>
    </div></section>

    <section className="section sample-section" id="sample"><div className="container sample-layout">
      <div className="sample-intro"><div className="section-kicker">02 / TRY THE METHOD</div><h2>One question.<br/><em>A clearer answer.</em></h2><p>Good practice explains the logic behind an option. Try this free question before deciding.</p><div className="sample-callout"><Sparkles size={20}/><span>No login needed to try this question.</span></div></div>
      <div className="sample-card"><div className="sample-card-top"><span>FREE SAMPLE / POLITY</span><span>Q. 01</span></div><h3>{sample.question}</h3><div className="options">{sample.options.map((option, i) => <button type="button" key={option} disabled={selected !== null} onClick={() => setSelected(i)} className={selected !== null && i === sample.correctIndex ? 'correct' : selected === i ? 'incorrect' : ''}><b>{String.fromCharCode(65+i)}</b><span>{option}</span>{selected !== null && i === sample.correctIndex && <Check size={18}/>}</button>)}</div>{selected !== null && <div className="answer-panel"><strong>{selected === sample.correctIndex ? 'Correct. Here is why.' : 'The answer is C. Here is why.'}</strong><p>{sample.eliminationTechnique}</p><button onClick={() => setSelected(null)}>Try again <ArrowRight size={15}/></button></div>}</div>
    </div></section>

    <section className="section process-section" id="how-it-works"><div className="container"><div className="section-topline"><span>03 / SIMPLE FROM START TO FINISH</span><span>ABOUT TWO MINUTES TO GET STARTED</span></div><div className="process-heading"><h2>From checkout<br/><em>to your first test.</em></h2><p>No app install. No complicated dashboard. Pay once, open your library, and start where you need to revise.</p></div><div className="process-grid"><div><span className="process-number">01</span><h3>Enter your details</h3><p>Use your email and mobile number for the order and future access.</p></div><div><span className="process-number">02</span><h3>Complete payment</h3><p>Pay through the secure checkout. Access is granted only after payment is verified.</p></div><div><span className="process-number">03</span><h3>Open your library</h3><p>Read or download the PDF, then take a test in any subject you choose.</p></div></div></div></section>

    <section className="section offer-section" id="pricing"><div className="container offer-layout"><div className="offer-copy"><div className="section-kicker">04 / YOUR ACCESS</div><h2>A small price<br/>for <em>better practice.</em></h2><p>One payment for the main paper, explained answers and online subject tests.</p><div className="offer-reassurance"><ShieldCheck size={19}/><span>Access is given only after the payment provider confirms your order.</span></div></div><div className="offer-card"><div className="offer-card-top"><span>THE COMPLETE PRACTICE KIT</span><span>2026 SERIES</span></div><div className="offer-price">₹{price}<small>one-time</small></div><ul><li><Check size={17}/> Main practice paper PDF</li><li><Check size={17}/> Answer explanations</li><li><Check size={17}/> Subject-wise online tests</li><li><Check size={17}/> Return to your student library</li></ul><button className="btn btn-coral" onClick={buy}>{owned ? 'Open your library' : `Get access for ₹${price}`}<ArrowUpRight size={20}/></button><p>{catalog.checkoutMode === 'test' ? 'Local test checkout · no real charge' : catalog.checkoutMode === 'unavailable' ? 'Checkout opens after the main paper and payment setup are ready.' : 'Secure checkout · pay once'}</p></div></div></section>

    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><div className="section-kicker">05 / BEFORE YOU BUY</div><h2>Good questions<br/><em>deserve clear answers.</em></h2></div><div className="faq-list">{faq.map(([q,a],i) => <div className="faq-item" key={q}><button onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}><span>{q}</span><ChevronDown size={20}/></button>{openFaq === i && <p>{a}</p>}</div>)}</div></div></section>

    <section className="closing-section"><div className="container closing-layout"><span>CIVILPRELIMS / 2026</span><h2>Be ready to answer.<br/><em>Be ready to reason.</em></h2><button className="btn btn-light" onClick={buy}>{owned ? 'Open your library' : `Get the paper for ₹${price}`}<ArrowUpRight size={20}/></button></div></section>
    <div className="mobile-purchase-bar"><div><span>{owned ? 'YOUR ACCESS' : 'COMPLETE KIT'}</span><strong>{owned ? 'Ready to study' : <>₹{price} <small>one-time</small></>}</strong></div><button onClick={buy}>{owned ? 'Open library' : 'Get paper'} <ArrowUpRight size={18}/></button></div>
  </main>;
}
