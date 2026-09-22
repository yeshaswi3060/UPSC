import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PatternSimulator() {
  const { config, setIsCheckoutOpen } = useStore();
  const [attempts, setAttempts] = useState(85);
  const [accuracy, setAccuracy] = useState(72);

  // Calculations
  const totalQuestions = attempts;
  const correct = Math.round((totalQuestions * accuracy) / 100);
  const wrong = totalQuestions - correct;
  const grossScore = correct * 2.0;
  const negativeDeduction = wrong * 0.66;
  const netScore = Math.max(0, grossScore - negativeDeduction).toFixed(1);

  // UPSC Prelims Cutoff benchmark (usually around 88-92 marks for General category)
  const cutoffTarget = 92.0;
  const isClearing = netScore >= cutoffTarget;

  return (
    <section className="section" style={{ background: 'rgba(10, 15, 29, 0.6)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        <div className="section-header">
          <span className="badge badge-gold">
            <Calculator size={13} />
            Prelims Score Simulator
          </span>
          <h2 className="section-title">
            Calculate Your Prelims Safety Buffer
          </h2>
          <p className="section-desc">
            With UPSC's stringent -0.66 negative marking and new "Only One / Only Two" statements, precision matters more than reckless attempts.
          </p>
        </div>

        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Interactive Calculator Inputs */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--gold-light)' }} />
              Simulate Your GS-1 Strategy
            </h3>

            {/* Slider 1: Attempts */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Planned Attempts (Out of 100):</span>
                <strong style={{ color: 'var(--gold-light)', fontSize: '1.1rem' }}>{attempts} Questions</strong>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={attempts}
                onChange={(e) => setAttempts(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                <span>Cautious (60)</span>
                <span>Optimal (80-88)</span>
                <span>Aggressive (98)</span>
              </div>
            </div>

            {/* Slider 2: Accuracy */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimated Accuracy Rate:</span>
                <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>{accuracy}% Correct</strong>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
                <span>Uncertain (50%)</span>
                <span>Average (65%)</span>
                <span>Topper Tier (80%+)</span>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: 'rgba(7, 11, 20, 0.7)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Correct (+2.0):</span>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>{correct} ({correct * 2} pts)</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Wrong (-0.66):</span>
                <div style={{ color: '#fb7185', fontWeight: 700, fontSize: '1.05rem' }}>{wrong} (-{negativeDeduction.toFixed(1)} pts)</div>
              </div>
            </div>
          </div>

          {/* Outcome Prediction Display */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(20, 31, 56, 0.95) 0%, rgba(13, 21, 38, 0.98) 100%)',
            border: isClearing ? '2px solid rgba(16, 185, 129, 0.5)' : '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.25rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            <div className={`badge ${isClearing ? 'badge-emerald' : 'badge-gold'}`} style={{ marginBottom: '0.75rem' }}>
              {isClearing ? 'Safe Clearing Zone' : 'Borderline Cutoff Alert'}
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Predicted GS Paper 1 Net Score:</div>
            <div style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: isClearing ? '#34d399' : 'var(--gold-light)',
              lineHeight: 1.1,
              margin: '0.5rem 0'
            }}>
              {netScore}
            </div>

            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {isClearing 
                ? `You are projected to clear the typical Prelims cutoff (~${cutoffTarget}) with a buffer of +${(netScore - cutoffTarget).toFixed(1)} marks.` 
                : `You are ${(cutoffTarget - netScore).toFixed(1)} marks below the safe cutoff (~${cutoffTarget}). Eliminating 5 negative traps lifts your score by +13.3 marks!`}
            </p>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px dashed var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              marginBottom: '1.5rem',
              fontSize: '0.825rem',
              color: 'var(--text-gold)',
              textAlign: 'left'
            }}>
              💡 <strong>The 2026 Guess Dossier Advantage:</strong> Direct thematic coverage across 150 predicted questions increases accuracy by ~12% to 18%, converting borderline scores into safe ranks.
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => setIsCheckoutOpen(true)}
            >
              Unlock 150 High-Yield Dossier (₹{config.currentPrice})
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
