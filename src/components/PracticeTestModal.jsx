import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SAMPLE_QUESTIONS } from '../data/initialData';
export default function PracticeTestModal() {
  const { testModePaper, setTestModePaper } = useStore();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    if (!testModePaper) return;
    const onKey = e => { if (e.key === 'Escape') setTestModePaper(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [testModePaper, setTestModePaper]);
  if (!testModePaper) return null;
  const q = SAMPLE_QUESTIONS[index];
  const correct = SAMPLE_QUESTIONS.filter(item => answers[item.id] === item.correctIndex).length;
  const reset = () => { setIndex(0); setAnswers({}); setSubmitted(false); };
  const close = () => { setTestModePaper(null); reset(); };
  return <div className="modal-overlay" onMouseDown={close}><div className="modal-content practice-modal" role="dialog" aria-modal="true" aria-labelledby="practice-title" onMouseDown={e => e.stopPropagation()}><button className="modal-close-btn" onClick={close} aria-label="Close"><X size={20}/></button><div className="section-index">SHORT PRACTICE SET</div><h2 id="practice-title">{submitted ? 'Your practice review' : 'Reason through each option.'}</h2>{submitted ? <><p>You answered {correct} of {SAMPLE_QUESTIONS.length} questions correctly. Review the reasoning below and try again when you are ready.</p><div className="review-list">{SAMPLE_QUESTIONS.map((item, i) => <article key={item.id}><span>{String(i+1).padStart(2,'0')} / {item.subject}</span><h3>{item.question}</h3><p><strong>Correct answer:</strong> {item.options[item.correctIndex]}</p><p>{item.eliminationTechnique}</p></article>)}</div><button className="btn btn-primary" onClick={reset}><RotateCcw size={17}/> Try again</button></> : <><p>Question {index + 1} of {SAMPLE_QUESTIONS.length} · {q.subject}</p><div className="practice-progress"><span style={{ width: `${((index + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}/></div><h3 className="practice-question">{q.question}</h3><div className="options">{q.options.map((option, i) => <button key={option} className={answers[q.id] === i ? 'selected' : ''} onClick={() => setAnswers({ ...answers, [q.id]: i })}><span className="option-letter">{String.fromCharCode(65+i)}</span>{option}</button>)}</div><div className="practice-actions"><button className="btn btn-secondary" disabled={!index} onClick={() => setIndex(index - 1)}><ArrowLeft size={17}/> Previous</button>{index < SAMPLE_QUESTIONS.length - 1 ? <button className="btn btn-dark" onClick={() => setIndex(index + 1)}>Next <ArrowRight size={17}/></button> : <button className="btn btn-primary" onClick={() => setSubmitted(true)}>Review answers <ArrowRight size={17}/></button>}</div></>}</div></div>;
}
