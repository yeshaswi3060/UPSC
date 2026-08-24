import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="not-found-page">
      <div className="not-found-number">404</div>
      <div className="not-found-copy">
        <span className="site-eyebrow">Page not found</span>
        <h1>This question<br />has no answer.</h1>
        <p>The page you’re looking for may have moved or no longer exists. Let’s get you back to the paper.</p>
      <Link to="/" className="site-button site-button-primary">Return to Learnova <span>→</span></Link>
      </div>
    </section>
  )
}

export default NotFound
