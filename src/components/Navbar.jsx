import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        Question Paper Website
      </Link>
    </header>
  )
}

export default Navbar
