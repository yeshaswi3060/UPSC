import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, track } from '../services/api';

const StoreContext = createContext(null);
const viewFromPath = (pathname) => {
  if (pathname === '/login') return 'login';
  if (pathname === '/library') return 'dashboard';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/admin') return 'admin';
  if (pathname.startsWith('/test/')) return 'test';
  return 'landing';
};


export function StoreProvider({ children }) {
  const [catalog, setCatalog] = useState({
    config: { price: 99, title: 'UPSC Prelims Practice Papers', subtitle: 'Question papers, answers and subject tests.' },
    subjects: [], pdf: null, checkoutMode: 'unavailable'
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setView] = useState(() => viewFromPath(window.location.pathname));
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const subjectId = currentView === 'test' ? window.location.pathname.split('/')[2] : null;

  const refresh = async () => {
    const [product, auth] = await Promise.all([api('/api/catalog'), api('/api/session')]);
    setCatalog(product); setSession(auth.user); setLoading(false);
    return { catalog: product, session: auth.user };
  };
  useEffect(() => { refresh().catch(() => setLoading(false)); }, []);
  useEffect(() => { track('page_view'); }, [currentView, subjectId]);
  useEffect(() => { window.scrollTo(0, 0); }, [currentView, subjectId]);
  useEffect(() => { if (checkoutOpen) track('checkout_open'); }, [checkoutOpen]);
  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (view, id) => {
    const path = view === 'test' && id ? `/test/${id}` : ({ landing:'/', login:'/login', dashboard:'/library', profile:'/profile', admin:'/admin' }[view] || '/');
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    setView(viewFromPath(path));
    window.scrollTo(0, 0);
  };
  const openCheckout = () => { track('buy_click'); setCheckoutOpen(true); };
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    window.setTimeout(() => setToastMessage(null), 4500);
  };
  const logout = async () => { await api('/api/logout', { method:'POST', body:'{}' }); setSession(null); navigate('landing'); };
  return <StoreContext.Provider value={{
    catalog, session, loading, currentView, subjectId, navigate, refresh, setSession, checkoutOpen, setCheckoutOpen, openCheckout, toastMessage, showToast, logout
  }}>{children}</StoreContext.Provider>;
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('StoreProvider is missing.');
  return value;
}
