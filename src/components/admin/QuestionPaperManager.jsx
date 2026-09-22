import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Eye, EyeOff, FileText, Download } from 'lucide-react';
import AddPaperModal from './AddPaperModal';

export default function QuestionPaperManager() {
  const { papers, updatePaper, deletePaper } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const toggleStatus = (paper) => {
    const nextStatus = paper.status === 'Published' ? 'Draft' : 'Published';
    updatePaper(paper.id, { status: nextStatus });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>Active Question Papers & PDF Dossiers</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Manage the content packages visible in student dashboards.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          Upload New Guess Paper
        </button>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Paper Title & Code</th>
              <th>Category</th>
              <th>Content Specs</th>
              <th>Downloads</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper) => {
              const isPublished = paper.status === 'Published';
              return (
                <tr key={paper.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{paper.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>{paper.code}</div>
                  </td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {paper.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.825rem' }}>
                      {paper.questionsCount} MCQs • {paper.pages} Pages
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{paper.fileSize}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{paper.downloadsCount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.725rem', color: '#34d399' }}>Verified Students</div>
                  </td>
                  <td>
                    <span className={`badge ${isPublished ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                      {paper.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                        title={isPublished ? 'Unpublish to Draft' : 'Publish to Live'}
                        onClick={() => toggleStatus(paper)}
                      >
                        {isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>

                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.65rem', color: '#fb7185' }}
                        title="Delete Paper"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${paper.title}"?`)) {
                            deletePaper(paper.id);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddPaperModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
