import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SAMPLE_QUESTIONS } from '../../data/initialData';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';

export default function SampleQuestionInteractive() {
  const { config, setIsCheckoutOpen } = useStore();
  const [selectedOpt, setSelectedOpt] = useState(null);

  const sample = SAMPLE_QUESTIONS[0]; // Authentic Tenth Schedule Question

  const isAnswered = selectedOpt !== null;
  const isCorrect = selectedOpt === sample.correctIndex;

  return (
    <section className="section" id="sample-question" style={{ background: 'rgba(11, 17, 32, 0.4)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge badge-gold">Try An Authentic Sample Question</span>
          <h2 className="section-title">
            Experience the Exact UPSC Pattern & Topper Elimination Logic
          </h2>
          <p className="section-desc">
            Test yourself on this high-yield Polity predicted MCQ. Notice how UPSC traps candidates with plausible-looking options.
          </p>
        </div>

        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div className="question-box">
            {/* Question Header */}
            <div className="q-meta">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-gold">{sample.subject}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Difficulty: {sample.difficulty}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                Marks: +2.00 | -0.66
              </span>
            </div>

            {/* Question Content */}
            <div className="q-text">
              {sample.question}
            </div>

            {/* Options */}
            <div className="q-options">
              {sample.options.map((opt, idx) => {
                let btnClass = 'q-opt-btn';
                if (isAnswered) {
                  if (idx === sample.correctIndex) {
                    btnClass += ' selected-correct';
                  } else if (idx === selectedOpt) {
                    btnClass += ' selected-wrong';
                  }
                }

                return (
                  <button
                    key={idx}
                    className={btnClass}
                    onClick={() => setSelectedOpt(idx)}
                  >
                    <span>
                      <strong>({String.fromCharCode(97 + idx)})</strong> {opt}
                    </span>
                    {isAnswered && idx === sample.correctIndex && (
                      <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                    )}
                    {isAnswered && idx === selectedOpt && idx !== sample.correctIndex && (
                      <XCircle size={18} style={{ color: '#f43f5e' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Interactive Feedback & Topper Elimination Explanation */}
            {isAnswered && (
              <div className="q-explanation">
                <h4>
                  <Lightbulb size={18} />
                  {isCorrect ? 'Correct! Notice the Elimination Framework:' : 'Incorrect. Here is how Toppers eliminate this trap:'}
                </h4>
                <p>{sample.eliminationTechnique}</p>
                <div style={{ fontSize: '0.775rem', color: 'var(--gold-light)', marginTop: '0.75rem' }}>
                  <strong>Source Citation:</strong> {sample.sourceCitation}
                </div>
              </div>
            )}

            {/* Bottom CTA to unlock full paper */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Ready for all 150 Predicted MCQs with Detailed Dossier?
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Includes full solutions, CSAT module, and printable unencrypted PDF.
                </div>
              </div>

              <button 
                className="btn btn-primary"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Unlock Full Dossier (₹{config.currentPrice})
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
