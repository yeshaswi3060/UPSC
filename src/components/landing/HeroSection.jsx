import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Clock, Zap, Lock } from 'lucide-react';
import DossierMockup3D from './DossierMockup3D';

export default function HeroSection() {
  const { config, setIsCheckoutOpen, registerCheckoutLead } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Dynamic countdown timer (hours : mins : secs)
  const [secondsRemaining, setSecondsRemaining] = useState(config.countdownMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 180 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.countdownMinutes]);

  const formatCountdown = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      alert('Please enter your Name, WhatsApp number and Email to proceed.');
      return;
    }
    // Register lead in Admin CRM
    registerCheckoutLead(formData);
    setIsCheckoutOpen(true);
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left: Value Proposition & Urgency */}
          <div>
            <div className="badge badge-gold" style={{ marginBottom: '1.25rem' }}>
              <Sparkles size={13} />
              {config.badgeText}
            </div>

            <h1 className="hero-title">
              Target 110+ in <span className="gradient-text">UPSC Prelims {config.targetYear}</span> with Algorithmic Precision.
            </h1>

            <p className="hero-subtitle">
              Curated from 12-year thematic recurrence models, Parliamentary Committee findings, and high-frequency UPSC trap patterns. Get 150 predicted MCQs with Topper Elimination Keys.
            </p>

            {/* Credibility Highlights */}
            <div className="hero-highlights">
              <div className="highlight-item">
                <span className="highlight-val">150+</span>
                <span className="highlight-label">Predicted MCQs (GS-1 & CSAT)</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-val">360°</span>
                <span className="highlight-label">Topper Elimination Logic</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-val">4.9/5</span>
                <span className="highlight-label">Rated by 2,400+ Aspirants</span>
              </div>
            </div>

            {/* 3D Interactive Dossier Binder Preview */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '1.5rem 0' }}>
              <DossierMockup3D />
            </div>

            {/* Social Proof Live Pill */}
            <div className="social-proof-ticker">
              <span className="pulse-dot" />
              <span>
                <strong>Vikram M. (New Delhi)</strong> unlocked GS-1 Dossier 2 minutes ago
              </span>
            </div>
          </div>

          {/* Right: Conversion-Optimized Quick Checkout Lead Card */}
          <div>
            <div className="checkout-card" id="quick-checkout">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-emerald">
                  <Zap size={12} />
                  Instant Digital Access
                </span>
                <span className="discount-badge">
                  Save {Math.round(((config.originalPrice - config.currentPrice) / config.originalPrice) * 100)}%
                </span>
              </div>

              {/* Dynamic Price Display */}
              <div className="pricing-header">
                <div className="price-main">₹{config.currentPrice}</div>
                <div className="price-original">₹{config.originalPrice}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>one-time payment</div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
                Complete 68-page PDF Dossier + In-Browser Reader + CSAT Trap-Buster module included.
              </p>

              {/* Quick Checkout Form */}
              <form onSubmit={handleFormSubmit} className="quick-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number (For Instant PDF Delivery)</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (For Dashboard Login)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="aspirant@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                  Unlock Prelims 2026 Dossier for ₹{config.currentPrice}
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Perks List */}
              <ul className="perks-list">
                <li className="perk-item">
                  <CheckCircle2 size={16} />
                  <span>Instant unencrypted PDF download + In-app test mode</span>
                </li>
                <li className="perk-item">
                  <CheckCircle2 size={16} />
                  <span>CSAT Trap-Buster & Formula Sheet included free</span>
                </li>
                <li className="perk-item">
                  <CheckCircle2 size={16} />
                  <span>100% money-back accuracy guarantee</span>
                </li>
              </ul>

              {/* Scarcity / Urgency Countdown */}
              <div className="urgency-timer">
                <Clock size={15} />
                <span>Price increases to ₹{config.originalPrice} in: {formatCountdown(secondsRemaining)}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.725rem',
                color: 'var(--text-subtle)',
                marginTop: '1rem'
              }}>
                <Lock size={12} />
                <span>Safe & Secure UPI / Razorpay Checkout • Verified SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar */}
      <div className="mobile-sticky-bar">
        <div className="mobile-bar-inner">
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              ₹{config.currentPrice} <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>₹{config.originalPrice}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
              ⚡ Instant WhatsApp Delivery
            </div>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setIsCheckoutOpen(true)}
          >
            Get Paper Now
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}
