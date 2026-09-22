import React, { useState } from 'react';
import { FAQS } from '../../data/initialData';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header">
          <span className="badge badge-gold">
            <HelpCircle size={13} />
            Got Questions?
          </span>
          <h2 className="section-title">
            Frequently Asked Questions
          </h2>
          <p className="section-desc">
            Everything you need to know about our prediction methodology, instant delivery, and PDF format.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="faq-item">
                <button 
                  className="faq-question"
                  onClick={() => toggle(idx)}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} style={{ color: 'var(--gold-light)' }} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
