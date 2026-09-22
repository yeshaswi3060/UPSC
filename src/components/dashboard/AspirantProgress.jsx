import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Award, Clock, FileText, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

export default function AspirantProgress({ onOpenInvoice }) {
  const { user, papers, showToast } = useStore();

  const handleDownloadAll = () => {
    showToast('Preparing ZIP package of all unlocked UPSC Prelims dossiers...');
    setTimeout(() => {
      const element = document.createElement('a');
      const file = new Blob([
        `CIVILPRELIMS COMPLETE BUNDLE 2026\nAccount: ${user?.name || 'Aspirant'}\nOrder: ${user?.orderId || 'ORD-9842'}\nTotal Papers Included: ${papers.length}\nAll GS-1, CSAT and Current Affairs papers compiled.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `UPSC-Prelims-2026-All-Dossiers.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showToast('All dossiers downloaded successfully.');
    }, 1000);
  };

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-inner">
        {/* Left: Aspirant Details */}
        <div className="student-badge-info">
          <div className="student-avatar-wrap">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Welcome, {user?.name || 'Aspirant'}</h2>
              <span className="badge badge-emerald">
                <ShieldCheck size={12} />
                Verified Access
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Roll/Order: <strong style={{ color: 'var(--gold-light)' }}>{user?.orderId || 'ORD-9842'}</strong> • WhatsApp: {user?.phone || '+91 98765 43210'}
            </div>
          </div>
        </div>

        {/* Right: Actions & Countdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="aspirant-countdown-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              UPSC Prelims Countdown
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              Target: May 2026
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenInvoice}
          >
            <FileText size={15} />
            View Invoice
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={handleDownloadAll}
          >
            <Download size={15} />
            Download All PDFs
          </button>
        </div>
      </div>
    </div>
  );
}
