import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Activity, Users, Globe, Flame } from 'lucide-react';

export default function LiveVisitorsTicker() {
  const { activeVisitors } = useStore();

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(16, 24, 40, 0.95) 0%, rgba(13, 21, 38, 0.95) 100%)',
      border: '1px solid var(--border-gold)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.75rem',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1.25rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Live Visitors Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid var(--emerald-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#34d399'
        }}>
          <Activity size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-dot" />
            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
              {activeVisitors}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Aspirants Live On Site Right Now
            </span>
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Traffic Surge: 74% browsing UPSC GS-1 Guess Dossier & Checkout Form
          </div>
        </div>
      </div>

      {/* Traffic Sources & Hotspots */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <Globe size={15} style={{ color: 'var(--gold-light)' }} />
          <span>Top Locations: <strong>Delhi NCR, Bengaluru, Prayagraj, Pune</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <Flame size={15} style={{ color: '#fb7185' }} />
          <span>Checkout Velocity: <strong>1 order every ~3.5 mins</strong></span>
        </div>
      </div>
    </div>
  );
}
