import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SAMPLE_QUESTIONS } from '../data/initialData';
export default function InAppPdfReaderModal() {
  const { activeReadingPaper, setActiveReadingPaper } = useStore();
  useEffect(() => {
    if (!activeReadingPaper) return;
    const onKey = e => { if (e.key === 'Escape') setActiveReadingPaper(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeReadingPaper, setActiveReadingPaper]);
  if (!activeReadingPaper) return null;
  const question = SAMPLE_QUESTIONS.find(q => q.subject === activeReadingPaper.category);
  return <div className="modal-overlay" onMouseDown={() => setActiveReadingPaper(null)}><div className="modal-content reader-modal" role="dialog" aria-modal="true" aria-labelledby="reader-title" onMouseDown={e => e.stopPropagation()}><button className="modal-close-btn" onClick={() => setActiveReadingPaper(null)} aria-label="Close"><X size={20}/></button><div className="section-index">LIBRARY / {activeReadingPaper.category?.toUpperCase()}</div><h2 id="reader-title">{activeReadingPaper.title}</h2><p>{activeReadingPaper.description}</p>{question ? <div className="reader-sheet"><span>SAMPLE QUESTION</span><h3>{question.question}</h3><ol type="A">{question.options.map(o => <li key={o}>{o}</li>)}</ol><div className="reader-answer"><strong>Answer: {String.fromCharCode(65 + question.correctIndex)}</strong><p>{question.eliminationTechnique}</p><small>Reference: {question.sourceCitation}</small></div></div> : <div className="reader-sheet"><p>No sample question is attached to this resource yet. Add content before publishing it to learners.</p></div>}</div></div>;
}
