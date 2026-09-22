import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

export default function SubjectTestPage() {
  const { catalog, session, loading, subjectId, navigate } = useStore();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [review, setReview] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  useEffect(() => {
    if (!subjectId || session?.role !== 'student') return;
    setLoadingQuestions(true); setError(''); setIndex(0); setAnswers({}); setSubmitted(false); setReview([]);
    api(`/api/questions/${subjectId}`).then(data => setQuestions(data.questions)).catch(err => setError(err.message)).finally(() => setLoadingQuestions(false));
  }, [subjectId, session?.role]);
  const subject = catalog.subjects.find(s => s.id === subjectId);
  if (loading) return <main className="route-gate"><p>Opening the test…</p></main>;
  if (session?.role !== 'student' || !session.hasPurchase) return <main className="route-gate"><h1>Sign in to take this test.</h1><button className="btn btn-coral" onClick={() => navigate('login')}>Student sign in <ArrowRight size={17}/></button></main>;
  if (!subject) return <main className="route-gate"><h1>Subject not found.</h1><button className="btn btn-dark" onClick={() => navigate('dashboard')}>Back to library</button></main>;
  const current = questions[index];
  const correct = review.filter(q => q.answer === q.correctIndex).length;
  const attempted = Object.keys(answers).length;
  const reset = () => { setIndex(0); setAnswers({}); setSubmitted(false); setReview([]); };
  const submit = async () => {
    setSaving(true); setError('');
    try { const result = await api(`/api/tests/${subjectId}/submit`, { method:'POST', body:JSON.stringify({ answers }) }); setReview(result.review); setSubmitted(true); window.scrollTo(0, 0); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <main className="test-page"><div className="container"><button className="test-back" onClick={() => navigate('dashboard')}><ArrowLeft size={17}/> Back to library</button><div className="test-header"><div><div className="section-kicker">SUBJECT TEST / {subject.short.toUpperCase()}</div><h1>{subject.name}<em>.</em></h1><p>Work through each question, then review your answers and explanations.</p></div><div className="test-header-count"><strong>{questions.length}</strong><span>QUESTIONS</span></div></div>
    {loadingQuestions ? <div className="test-empty">Loading your questions…</div> : !questions.length ? <div className="test-empty">No questions have been published for this subject yet.</div> : submitted ? <div className="result-layout"><div className="result-summary"><span>TEST COMPLETE</span><h2>You got <em>{correct} of {questions.length}</em> right.</h2><p>Your score is saved in your profile. Review the reasoning and take another round whenever you are ready.</p><div className="result-stats"><div><strong>{correct}</strong><small>CORRECT</small></div><div><strong>{attempted - correct}</strong><small>INCORRECT</small></div><div><strong>{questions.length - attempted}</strong><small>SKIPPED</small></div></div><button className="btn btn-coral" onClick={reset}><RotateCcw size={17}/> Take it again</button><button className="btn btn-outline" onClick={() => navigate('profile')}>View my progress</button></div><div className="result-answers">{review.map((q, i) => <article key={q.id}><div className="result-question-top"><span>QUESTION {String(i+1).padStart(2,'0')}</span><span className={q.answer === q.correctIndex ? 'good' : 'missed'}>{q.answer === q.correctIndex ? <><Check size={15}/> Correct</> : q.answer == null ? 'Skipped' : <><X size={15}/> Incorrect</>}</span></div><h3>{q.prompt}</h3><p><strong>Answer:</strong> {q.options[q.correctIndex]}</p><p>{q.explanation}</p></article>)}</div></div> : <div className="test-layout"><aside className="test-sidebar"><span>QUESTION NAVIGATOR</span><div className="test-palette">{questions.map((q, i) => <button key={q.id} className={`${i===index?'current':''} ${answers[q.id]!=null?'answered':''}`} onClick={() => setIndex(i)} aria-label={`Question ${i+1}`} aria-current={i===index ? 'step' : undefined}>{String(i+1).padStart(2,'0')}</button>)}</div><div className="test-sidebar-note"><strong>{attempted} / {questions.length}</strong><span>ANSWERED</span></div></aside><section className="test-question-card"><div className="test-question-top"><span>QUESTION {String(index+1).padStart(2,'0')} OF {String(questions.length).padStart(2,'0')}</span><span>{subject.short.toUpperCase()}</span></div><div className="test-progress"><span style={{ width: `${((index+1)/questions.length)*100}%` }}/></div><h2>{current.prompt}</h2><div className="test-options">{current.options.map((option,i) => <button key={i} aria-pressed={answers[current.id]===i} className={answers[current.id]===i?'selected':''} onClick={() => setAnswers({ ...answers, [current.id]: i })}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div><div className="test-question-actions"><button className="btn btn-outline" disabled={index===0} onClick={() => setIndex(index-1)}><ArrowLeft size={17}/> Previous</button><button className="test-clear" onClick={() => { const next={...answers}; delete next[current.id]; setAnswers(next); }}>Clear answer</button>{index<questions.length-1 ? <button className="btn btn-dark" onClick={() => setIndex(index+1)}>Next <ArrowRight size={17}/></button> : <button className="btn btn-coral" disabled={saving} onClick={submit}>{saving ? 'Saving score…' : 'Finish test'} <ArrowRight size={17}/></button>}</div></section></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </div></main>;
}
