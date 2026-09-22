import React from 'react';
import { useStore } from '../../context/StoreContext';
import { BookOpen, Download, PlayCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function PaperCard({ paper }) {
  const { setActiveReadingPaper, setTestModePaper, user, showToast } = useStore();

  const handleDownload = () => {
    showToast(`Downloading official watermarked PDF: ${paper.title}`);
    const element = document.createElement('a');
    const file = new Blob([
      `CIVILPRELIMS OFFICIAL DOSSIER\nPaper: ${paper.title}\nCode: ${paper.code}\nLicensed To: ${user?.name || 'Aspirant'} (${user?.orderId || 'ORD-9842'})\n\n[Full 68-page question bank with exhaustive solutions and elimination keys included.]`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${paper.code}-Dossier.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="paper-shelf-card">
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className="badge badge-gold">{paper.category}</span>
          <span className="badge badge-emerald">
            <CheckCircle2 size={12} />
            Unlocked
          </span>
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
          {paper.title}
        </h3>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.55 }}>
          {paper.description}
        </p>

        {/* Meta Pills */}
        <div className="paper-meta-pills">
          <span className="paper-pill">📄 {paper.pages} Pages</span>
          <span className="paper-pill">🎯 {paper.questionsCount} MCQs</span>
          <span className="paper-pill">💾 {paper.fileSize}</span>
          <span className="paper-pill">🏷️ {paper.code}</span>
        </div>

        {/* Topics Peek */}
        {paper.topicsIncluded && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.35rem' }}>
              Key Predicted Focus Areas:
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {paper.topicsIncluded.slice(0, 3).map((topic, i) => (
                <li key={i} style={{ fontSize: '0.775rem', color: '#cbd5e1', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ color: 'var(--gold-primary)' }}>•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="paper-actions-group">
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setActiveReadingPaper(paper)}
        >
          <BookOpen size={15} />
          Read in Browser
        </button>

        <button 
          className="btn btn-outline-gold btn-sm"
          onClick={() => setTestModePaper(paper)}
        >
          <PlayCircle size={15} />
          Practice Test
        </button>

        <button 
          className="btn btn-secondary btn-sm"
          style={{ gridColumn: 'span 2' }}
          onClick={handleDownload}
        >
          <Download size={15} />
          Download Unencrypted PDF ({paper.fileSize})
        </button>
      </div>
    </div>
  );
}
