import React from 'react';
import { useStore } from '../../context/StoreContext';

export default function DevSwitcher() {
  const { currentView, setCurrentView, user, loginAsStudent, loginAsAdmin } = useStore();

  const handleSwitch = (view) => {
    if (view === 'dashboard' && (!user || user.role !== 'student')) {
      loginAsStudent({ name: 'Rahul Sharma', email: 'rahul.upsc2026@gmail.com' });
    } else if (view === 'admin' && (!user || user.role !== 'admin')) {
      loginAsAdmin();
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="dev-view-switcher" title="Instant Portal Preview Switcher">
      <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', paddingLeft: '0.4rem', fontWeight: 700 }}>
        VIEW:
      </span>
      <button 
        className={`dev-switch-btn ${currentView === 'landing' ? 'active' : ''}`}
        onClick={() => setCurrentView('landing')}
      >
        Landing
      </button>
      <button 
        className={`dev-switch-btn ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleSwitch('dashboard')}
      >
        Student Portal
      </button>
      <button 
        className={`dev-switch-btn ${currentView === 'admin' ? 'active' : ''}`}
        onClick={() => handleSwitch('admin')}
      >
        Admin Console
      </button>
      <button 
        className={`dev-switch-btn ${currentView === 'login' ? 'active' : ''}`}
        onClick={() => setCurrentView('login')}
      >
        Login
      </button>
    </div>
  );
}
