import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="site-navbar">
    <Link to="/" className="site-brand" aria-label="Learnova home">
      <span className="site-brand-mark">L</span>
      <span>Learnova<small>Practice with purpose</small></span>
      </Link>
      <Link to="/" className="site-back-link">← Back to the paper</Link>
    </header>
  )
}

export default Navbar
