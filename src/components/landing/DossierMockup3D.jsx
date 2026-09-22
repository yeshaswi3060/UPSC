import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BookOpen, ShieldCheck, Sparkles, FileText, Eye } from 'lucide-react';

export default function DossierMockup3D() {
  const { setActiveReadingPaper, papers } = useStore();

  const mainPaper = papers[0];

  return (
    <div style={{
      perspective: '1200px',
      margin: '2rem 0 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* 3D Binder Container */}
      <div 
        onClick={() => mainPaper && setActiveReadingPaper(mainPaper)}
        style={{
          width: '320px',
          height: '420px',
          background: 'linear-gradient(135deg, #0f182e 0%, #090e1c 50%, #050812 100%)',
          borderRadius: '16px 24px 24px 16px',
          border: '2px solid rgba(245, 158, 11, 0.45)',
          boxShadow: 'var(--shadow-book)',
          transform: 'rotateY(-10deg) rotateX(4deg)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          position: 'relative',
          padding: '2rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(-8px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 25px 60px rgba(0,0,0,0.9), 0 0 50px rgba(245, 158, 11, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'rotateY(-10deg) rotateX(4deg)';
          e.currentTarget.style.boxShadow = 'var(--shadow-book)';
        }}
      >
        {/* Spine Effect on Left Edge */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: '0',
          bottom: '0',
          width: '28px',
          background: 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.4) 100%)',
          borderRadius: '16px 0 0 16px',
          borderRight: '1px solid rgba(245, 158, 11, 0.3)'
        }} />

        {/* Realistic Multi-layered Page Stack on Right */}
        <div style={{
          position: 'absolute',
          right: '-10px',
          top: '12px',
          bottom: '12px',
          width: '10px',
          background: 'repeating-linear-gradient(to right, #e2e8f0 0px, #cbd5e1 1px, #f8fafc 2px)',
          borderRadius: '0 4px 4px 0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.5)'
        }} />

        {/* Satin Gold Bookmark Ribbon */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '48px',
          width: '20px',
          height: '70px',
          background: 'var(--gold-gradient)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)',
          zIndex: 5
        }} />

        {/* Top Header of Binder */}
        <div style={{ paddingLeft: '1.25rem', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: 'var(--gold-light)',
            fontWeight: 800,
            textTransform: 'uppercase',
            marginBottom: '0.4rem'
          }}>
            UNION PUBLIC SERVICE COMMISSION
          </div>
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.6) 50%, transparent 100%)',
            margin: '0 auto 0.75rem'
          }} />
        </div>

        {/* Center Seal & Title */}
        <div style={{ paddingLeft: '1.25rem', textAlign: 'center' }}>
          {/* Embossed Official Emblem Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(15,23,42,0.9) 80%)',
            border: '2px solid var(--gold-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gold-light)',
            boxShadow: '0 0 20px rgba(245,158,11,0.2)'
          }}>
            <BookOpen size={28} strokeWidth={2} />
          </div>

          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '1.25rem',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.25,
            letterSpacing: '0.04em',
            marginBottom: '0.4rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}>
            CIVIL SERVICES PRELIMS 2026
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--gold-light)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            background: 'rgba(245,158,11,0.12)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            High-Yield Guess Dossier
          </div>
        </div>

        {/* Bottom Specs & Verification Stamp */}
        <div style={{
          paddingLeft: '1.25rem',
          borderTop: '1px solid rgba(245,158,11,0.25)',
          paddingTop: '0.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: '0.7rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Confidential Issue</div>
            <div style={{ color: '#fff', fontWeight: 700 }}>150 Predicted MCQs</div>
          </div>
          <div style={{
            padding: '0.25rem 0.55rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: '#34d399',
            fontWeight: 700,
            fontSize: '0.65rem'
          }}>
            GS-1 + CSAT
          </div>
        </div>

        {/* Hover Peek Pill */}
        <div style={{
          position: 'absolute',
          bottom: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#070b14',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-full)',
          padding: '0.35rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--gold-light)',
          fontWeight: 700,
          boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
          whiteSpace: 'nowrap'
        }}>
          <Eye size={13} />
          Click to Preview Live Reader
        </div>
      </div>
    </div>
  );
}
