import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IndianRupee, Save, Sparkles, Tag, Clock } from 'lucide-react';

export default function PriceOfferManager() {
  const { config, updateConfig } = useStore();

  const [formState, setFormState] = useState({
    currentPrice: config.currentPrice,
    originalPrice: config.originalPrice,
    badgeText: config.badgeText,
    announcement: config.announcement,
    targetYear: config.targetYear,
    countdownMinutes: config.countdownMinutes
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateConfig({
      ...formState,
      currentPrice: Number(formState.currentPrice),
      originalPrice: Number(formState.originalPrice),
      countdownMinutes: Number(formState.countdownMinutes)
    });
  };

  return (
    <div className="admin-control-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>
            <Tag size={12} />
            Live Pricing Engine
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Dynamic Price & Urgent Offer Controller</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Any adjustment made here instantly updates the Landing Page, Mobile Sticky Bar, and Checkout Gateway.
          </p>
        </div>

        <div style={{
          padding: '0.5rem 1rem',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          color: 'var(--gold-light)',
          fontWeight: 700
        }}>
          Current Live Price: ₹{config.currentPrice} (Was ₹{config.originalPrice})
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="control-inputs-grid">
          <div className="form-group">
            <label className="form-label">Current Selling Price (₹)</label>
            <input
              type="number"
              className="form-input"
              value={formState.currentPrice}
              onChange={(e) => setFormState({ ...formState, currentPrice: e.target.value })}
              required
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Strikethrough Price (₹)</label>
            <input
              type="number"
              className="form-input"
              value={formState.originalPrice}
              onChange={(e) => setFormState({ ...formState, originalPrice: e.target.value })}
              required
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Exam Cycle</label>
            <input
              type="text"
              className="form-input"
              value={formState.targetYear}
              onChange={(e) => setFormState({ ...formState, targetYear: e.target.value })}
              placeholder="e.g. 2026 / 2027"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Urgency Timer Duration (Minutes)</label>
            <input
              type="number"
              className="form-input"
              value={formState.countdownMinutes}
              onChange={(e) => setFormState({ ...formState, countdownMinutes: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Hero Badge Text</label>
            <input
              type="text"
              className="form-input"
              value={formState.badgeText}
              onChange={(e) => setFormState({ ...formState, badgeText: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Top Banner Announcement</label>
            <input
              type="text"
              className="form-input"
              value={formState.announcement}
              onChange={(e) => setFormState({ ...formState, announcement: e.target.value })}
              required
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} />
            Save & Push Changes Live
          </button>
        </div>
      </form>
    </div>
  );
}
