import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Upload, Plus, FileText } from 'lucide-react';

export default function AddPaperModal({ isOpen, onClose }) {
  const { addPaper } = useStore();

  const [formData, setFormData] = useState({
    title: '',
    category: 'General Studies 1',
    questionsCount: 150,
    pages: 64,
    fileSize: '12.5 MB',
    description: '',
    status: 'Published'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please fill out paper title and description.');
      return;
    }

    addPaper({
      ...formData,
      questionsCount: Number(formData.questionsCount),
      pages: Number(formData.pages)
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '650px' }}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-gold" style={{ marginBottom: '0.35rem' }}>
            <FileText size={12} />
            Question Bank Manager
          </span>
          <h3 style={{ fontSize: '1.5rem' }}>Upload New UPSC Guess Dossier / PDF</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Add predicted question papers, CSAT modules or Current Affairs compilations to the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="quick-form">
          <div className="form-group">
            <label className="form-label">Dossier / Paper Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. UPSC Prelims 2026: Modern History & Culture Special Dossier"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Category</label>
              <select
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="General Studies 1">General Studies 1</option>
                <option value="CSAT Paper 2">CSAT Paper 2</option>
                <option value="Current Affairs">Current Affairs</option>
                <option value="Economic Survey">Economic Survey & Budget</option>
                <option value="Mains GS">Mains GS Foundation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Published">Published (Live for Students)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Questions Count</label>
              <input
                type="number"
                className="form-input"
                value={formData.questionsCount}
                onChange={(e) => setFormData({ ...formData, questionsCount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Pages</label>
              <input
                type="number"
                className="form-input"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated File Size</label>
              <input
                type="text"
                className="form-input"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                placeholder="e.g. 14.8 MB"
                required
              />
            </div>
          </div>

          {/* PDF File Upload Simulator */}
          <div style={{
            border: '2px dashed var(--border-gold)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'center',
            background: 'rgba(245, 158, 11, 0.03)',
            cursor: 'pointer',
            margin: '0.5rem 0'
          }}>
            <Upload size={28} style={{ color: 'var(--gold-light)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to Select Question Paper PDF</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Supports PDF documents up to 50MB (Automatically encrypted with aspirant watermark)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Overview & Focus Areas</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Detail the predicted themes, target topics, and question-setting methodology..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              Publish Question Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
