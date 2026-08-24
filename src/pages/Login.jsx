import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from?.pathname ?? '/admin'

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (loginError) {
      setError(loginError.code ? 'The email or password is incorrect.' : loginError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-intro">
        <span className="site-eyebrow">Private workspace</span>
        <h1>Welcome back to<br /><em>Prashnavali.</em></h1>
        <p>Manage your question papers and keep your preparation products organised from one focused workspace.</p>
        <div className="login-assurance">
          <div><span>01</span><p><strong>Focused dashboard</strong>See the essentials without unnecessary clutter.</p></div>
          <div><span>02</span><p><strong>Protected access</strong>Your admin tools stay behind your account.</p></div>
        </div>
      </div>

      <div className="login-card-wrap">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-heading">
            <span className="site-eyebrow">Admin access</span>
            <h2>Sign in to continue</h2>
            <p>Use the email connected to your Prashnavali account.</p>
          </div>

          <label htmlFor="admin-email">Email address
            <input id="admin-email" className="site-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="admin@example.com" />
          </label>

          <label htmlFor="admin-password">Password
            <input id="admin-password" className="site-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" />
          </label>

          {error && <div className="site-form-error" role="alert">{error}</div>}

          <button type="submit" className="site-button site-button-primary" disabled={submitting || loading}>
            {submitting ? 'Signing you in…' : 'Sign in to dashboard'}
            {!submitting && <span>→</span>}
          </button>
          <p className="login-support">Having trouble? <a href="mailto:support@prashnavali.in">Contact support</a></p>
        </form>
      </div>
    </section>
  )
}

export default Login
