import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import Footer from './components/common/Footer';
import Toast from './components/common/Toast';
import CheckoutModal from './components/CheckoutModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminPanel from './pages/AdminPanel';
import SubjectTestPage from './pages/SubjectTestPage';
import StudentProfile from './pages/StudentProfile';

function MainApp() {
  const { currentView } = useStore();

  return (
    <div className="app-layout">
      {/* Universal Navigation */}
      <Navbar />

      {/* Dynamic View Router */}
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'login' && <LoginPage />}
      {currentView === 'dashboard' && <StudentDashboard />}
      {currentView === 'admin' && <AdminPanel />}
      {currentView === 'test' && <SubjectTestPage />}
      {currentView === 'profile' && <StudentProfile />}

      {/* Universal Footer */}
      <Footer />

      {/* Global Modals & Notifications */}
      <CheckoutModal />
      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
