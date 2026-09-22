import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function InvoiceModal({ isOpen, onClose }) {
  const { user, config } = useStore();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const gstRate = 0.18;
  const basePrice = (config.currentPrice / (1 + gstRate)).toFixed(2);
  const gstAmount = (config.currentPrice - basePrice).toFixed(2);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px', background: '#0b1120', border: '1px solid var(--border-gold)' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              CIVILPRELIMS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluation Research & Educational Dossiers
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
              GSTIN: 07AAACS1234F1Z8 • New Delhi, India
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="badge badge-emerald" style={{ marginBottom: '0.25rem' }}>
              <CheckCircle2 size={12} />
              PAID IN FULL
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Invoice #: INV-{user?.orderId?.replace('ORD-', '') || '9842'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 700, marginBottom: '0.25rem' }}>
            Aspirant Information
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{user?.name || 'Rahul Sharma'}</div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Email: {user?.email || 'rahul.upsc2026@gmail.com'} • Mobile: {user?.phone || '+91 98765 43210'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
            Payment Mode: {user?.paymentMethod || 'UPI (Google Pay)'} • UTR Ref: {user?.utr || 'UPI-428910023411'}
          </div>
        </div>

        {/* Item Breakdown */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ paddingBottom: '0.5rem' }}>Item Description</th>
              <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>Qty</th>
              <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '0.75rem 0' }}>
                <strong>UPSC CSE Prelims 2026 High-Yield Guess Dossier</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GS-1 150 MCQs + CSAT Trap-Buster + Lifetime Digital Access</div>
              </td>
              <td style={{ textAlign: 'center', padding: '0.75rem 0' }}>1</td>
              <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>₹{basePrice}</td>
            </tr>
          </tbody>
        </table>

        {/* Total Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Taxable Subtotal:</span>
            <span>₹{basePrice}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>CGST (9%) + SGST (9%):</span>
            <span>₹{gstAmount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
            <span>Total Paid:</span>
            <span>₹{config.currentPrice}.00</span>
          </div>
        </div>

        {/* Action Button */}
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handlePrint}>
          <Printer size={16} />
          Print / Save Official Tax Invoice
        </button>
      </div>
    </div>
  );
}
