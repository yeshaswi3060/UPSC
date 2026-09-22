import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, FileText, Flame, TrendingUp } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

const niceDate = value => new Date(value).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
const percent = (correct, total) => total ? Math.round(correct / total * 100) : 0;

export default function StudentProfile() {
  const { session, loading, navigate } = useStore();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (session?.role !== 'student') return;
    api('/api/profile').then(setProfile).catch(err => setError(err.message));
  }, [session?.role]);
  if (loading) return <main className="route-gate"><p>Opening your profile…</p></main>;
  if (session?.role !== 'student' || !session.hasPurchase) return <main className="route-gate"><h1>Your profile is waiting.</h1><p>Sign in with the email and access code from your order.</p><button className="btn btn-coral" onClick={() => navigate('login')}>Student sign in <ArrowRight size={17}/></button></main>;
  if (error) return <main className="route-gate"><h1>Profile unavailable.</h1><p>{error}</p></main>;
  if (!profile) return <main className="route-gate"><p>Loading your progress…</p></main>;
  const today = profile.daily.at(-1);
  const weekTests = profile.daily.reduce((n,d) => n + d.tests, 0);
  return <main className="profile-page"><div className="container">
    <button className="test-back" onClick={() => navigate('dashboard')}><ArrowLeft size={17}/> Back to library</button>
    <div className="profile-hero"><div><div className="section-kicker">YOUR STUDY PROFILE / 2026</div><h1>Your effort,<br/><em>in focus.</em></h1><p>Every submitted test adds to your progress. Use this space to see what you have covered and choose your next subject.</p><div className="profile-identity"><span>{profile.email.slice(0,1).toUpperCase()}</span><div><strong>{profile.email}</strong><small>Member since {niceDate(profile.joinedAt)}</small></div></div></div><div className="profile-hero-mark"><BarChart3 size={78} strokeWidth={1.1}/><span>PRACTISE / REVIEW / IMPROVE</span></div></div>
    <div className="profile-stat-grid"><div><span><CalendarDays size={19}/> TODAY</span><strong>{today.tests}</strong><small>{today.tests === 1 ? 'test completed' : 'tests completed'} · {percent(today.correct,today.total)}% score</small></div><div><span><Flame size={19}/> THIS WEEK</span><strong>{weekTests}</strong><small>{weekTests === 1 ? 'test' : 'tests'} in the last 7 days</small></div><div><span><CheckCircle2 size={19}/> ALL TIME</span><strong>{profile.totalTests}</strong><small>completed test attempts</small></div><div><span><TrendingUp size={19}/> AVERAGE SCORE</span><strong>{profile.averageScore}%</strong><small>across completed tests</small></div></div>
    <div className="profile-main-grid"><section className="profile-panel"><div className="profile-panel-top"><span>01 / DAILY PROGRESS</span><span>LAST 7 DAYS</span></div><h2>Make the days count.</h2><p>Your daily score is based on every test you finished that day.</p><div className="daily-chart" role="img" aria-label="Daily test score for the last seven days">{profile.daily.map(d => <div className="daily-column" key={d.date}><div className="daily-bar-track"><span style={{height:`${d.tests ? Math.max(8,percent(d.correct,d.total)) : 0}%`}}/></div><strong>{d.tests ? `${percent(d.correct,d.total)}%` : '—'}</strong><small>{niceDate(d.date)}</small></div>)}</div><div className="profile-legend"><span/> Score on completed tests</div></section>
    <section className="profile-panel"><div className="profile-panel-top"><span>02 / SUBJECT TRACKER</span><span>YOUR FOCUS</span></div><h2>Choose your next move.</h2><div className="profile-subjects">{profile.subjects.map(s => <div key={s.id}><div><strong>{s.name}</strong><small>{s.tests ? `${s.tests} ${s.tests === 1 ? 'test' : 'tests'} · best ${s.best}%` : 'No test completed yet'}</small></div><button onClick={() => navigate('test',s.id)} aria-label={`Open ${s.name} test`}><ArrowRight size={17}/></button></div>)}</div></section></div>
    <div className="profile-bottom-grid"><section className="profile-panel"><div className="profile-panel-top"><span>03 / RECENT ACTIVITY</span><span>{profile.attempts.length} TESTS SHOWN</span></div><h2>Your practice history.</h2>{profile.attempts.length ? <div className="profile-history">{profile.attempts.slice(0,8).map(a => <div key={a.id}><div className="history-icon"><BookOpen size={18}/></div><div><strong>{a.subjectName}</strong><small>{new Date(a.at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})} · {a.attempted} of {a.total} answered</small></div><b>{percent(a.correct,a.total)}%</b></div>)}</div> : <div className="profile-empty">Your first completed test will appear here. <button onClick={() => navigate('dashboard')}>Explore subjects <ArrowRight size={15}/></button></div>}</section>
    <section className="profile-panel"><div className="profile-panel-top"><span>04 / LATEST UPDATES</span><span>CIVILPRELIMS</span></div><h2>From your study desk.</h2>{profile.updates.length ? <div className="profile-updates">{profile.updates.map(u => <article key={u.id}><time>{niceDate(u.at)}</time><h3>{u.title}</h3><p>{u.message}</p></article>)}</div> : <div className="profile-empty"><FileText size={27}/><p>New paper and test updates will appear here. Your paper and tests are ready in the library.</p><button onClick={() => navigate('dashboard')}>Open library <ArrowRight size={15}/></button></div>}</section></div>
    <section className="profile-panel profile-activity-panel"><div className="profile-panel-top"><span>05 / YOUR STUDY ACTIVITY</span><span>RECENT ACTIONS</span></div><h2>Pick up where you left off.</h2>{profile.activity.length ? <div className="profile-activity">{profile.activity.slice(0,10).map(event => <div key={event.id}><span className="profile-activity-dot"/><div><strong>{({test_completed:'Completed a subject test',pdf_view:'Opened the paper PDF',pdf_download:'Downloaded the paper PDF'})[event.type]}</strong><small>{event.detail ? `${event.detail} · ` : ''}{new Date(event.at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</small></div></div>)}</div> : <p>Your PDF and test activity will appear here as you study.</p>}</section>
  </div></main>;
}
