import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Admin() {
  const { user, logout } = useAuth()

  return (
    <section className="admin-page">
      <div className="admin-topbar">
        <div>
          <span className="site-eyebrow">Admin workspace</span>
          <h1>Good to see you.</h1>
        <p>Here’s a clear view of your Learnova product and launch readiness.</p>
        </div>
        <div className="admin-account">
          <div className="admin-avatar">{user?.email?.charAt(0).toUpperCase() || 'A'}</div>
          <div><strong>{user?.email}</strong><span>Administrator</span></div>
          <button type="button" className="site-button site-button-quiet" onClick={logout}>Log out</button>
        </div>
      </div>

      <div className="admin-notice">
        <span className="admin-notice-dot" />
        <div><strong>Payment setup required before launch</strong><p>The storefront is in demo mode. Connect a payment provider to start accepting real orders.</p></div>
        <span className="admin-status">Action needed</span>
      </div>

      <div className="admin-metrics">
        <MetricCard label="Active products" value="1" note="GS Paper II" />
        <MetricCard label="Selling price" value="₹99" note="One-time purchase" />
        <MetricCard label="Questions included" value="6" note="Across 3 sections" />
        <MetricCard label="Live orders" value="0" note="Payment not connected" muted />
      </div>

      <div className="admin-grid">
        <article className="admin-panel admin-product-panel">
          <div className="admin-panel-heading"><div><span className="site-eyebrow">Your product</span><h2>Published paper</h2></div><span className="admin-pill">Storefront ready</span></div>
          <div className="admin-product-row">
          <div className="admin-paper-thumb"><span>LEARNOVA</span><strong>GS<br />Paper II</strong><small>Practice Set</small></div>
            <div className="admin-product-info">
              <span>UPSC Civil Services · Mains</span>
              <h3>General Studies Paper II — Complete Question Set</h3>
              <div><b>PDF</b><b>Answer key</b><b>Solutions</b></div>
            </div>
            <div className="admin-product-price"><strong>₹99</strong><span>One time</span></div>
          </div>
          <div className="admin-panel-actions"><Link to="/" className="site-button site-button-primary">View storefront <span>↗</span></Link></div>
        </article>

        <article className="admin-panel admin-checklist-panel">
          <div className="admin-panel-heading"><div><span className="site-eyebrow">Launch checklist</span><h2>Before you sell</h2></div><span className="admin-progress">3 of 4</span></div>
          <div className="admin-progress-bar"><span /></div>
          <ul className="admin-checklist">
            <li className="done"><span>✓</span><div><strong>Professional storefront</strong><small>Landing page and mobile experience</small></div></li>
            <li className="done"><span>✓</span><div><strong>Product offer</strong><small>Price, files and value clearly explained</small></div></li>
            <li className="done"><span>✓</span><div><strong>Buyer delivery flow</strong><small>Success and download experience</small></div></li>
            <li><span>4</span><div><strong>Connect real payments</strong><small>Required before accepting customer orders</small></div></li>
          </ul>
        </article>
      </div>

      <article className="admin-panel admin-orders-panel">
        <div className="admin-panel-heading"><div><span className="site-eyebrow">Orders</span><h2>Recent purchases</h2></div></div>
        <div className="admin-empty-state"><span>◇</span><strong>No live orders yet</strong><p>Orders will appear here after a payment provider is connected and your first customer completes checkout.</p></div>
      </article>
    </section>
  )
}

function MetricCard({ label, value, note, muted = false }) {
  return <article className={`admin-metric${muted ? ' muted' : ''}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>
}

export default Admin
