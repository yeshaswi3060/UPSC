import React from 'react';
import { TOPPER_TESTIMONIALS } from '../../data/initialData';
import { Award, CheckCircle2, Star } from 'lucide-react';

export default function TopperReviews() {
  return (
    <section className="section" id="testimonials">
      <div className="container">
        <div className="section-header">
          <span className="badge badge-emerald">
            <CheckCircle2 size={13} />
            Verified Aspirant Endorsements
          </span>
          <h2 className="section-title">
            Trusted by Serious Aspirants Across India
          </h2>
          <p className="section-desc">
            See how top rankers used our high-yield predicted pattern analysis to convert borderline scores into safe 105+ margins.
          </p>
        </div>

        <div className="cards-grid">
          {TOPPER_TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="card testimonial-card">
              <div>
                <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--gold-primary)', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div className="topper-info">
                  <img src={t.avatar} alt={t.name} className="topper-avatar" />
                  <div>
                    <div className="topper-name">{t.name}</div>
                    <div className="topper-rank">{t.rank} • {t.cadre}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginTop: '0.2rem' }}>
                      {t.score}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
