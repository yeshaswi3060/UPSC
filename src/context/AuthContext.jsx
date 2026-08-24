import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  function login(email, password) {
    if (!auth) {
      return Promise.reject(new Error('Firebase is not configured yet — add your project keys to .env.'))
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    if (!auth) return Promise.resolve()
    return signOut(auth)
  }

  const value = { user, isAuthenticated: !!user, loading, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
