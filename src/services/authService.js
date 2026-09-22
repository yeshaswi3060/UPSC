// Authentication Service
// Built with a clean adapter pattern: ready for Firebase Auth configuration

export const authService = {
  // Test Mock Logins
  loginStudentMock: (email, phone, name) => {
    return Promise.resolve({
      role: 'student',
      name: name || 'Rahul Sharma',
      email: email || 'rahul.upsc2026@gmail.com',
      phone: phone || '+91 98765 43210',
      orderId: 'ORD-9842',
      utr: 'UPI-428910023411',
      token: 'mock-jwt-student-token-2026'
    });
  },

  loginAdminMock: (securityKey) => {
    // Demo key check (accepts "admin" or any non-empty key in test mode)
    return Promise.resolve({
      role: 'admin',
      name: 'Director (CivilPrelims Board)',
      email: 'director@civilprelims.in',
      token: 'mock-jwt-admin-token-2026'
    });
  },

  // Firebase Configuration Stub
  // When you add Firebase: paste your firebaseConfig object here
  initFirebase: (config) => {
    console.log('Firebase ready to connect with config:', config);
    // import { initializeApp } from 'firebase/app';
    // import { getAuth } from 'firebase/auth';
    // const app = initializeApp(config);
    // return getAuth(app);
  }
};
