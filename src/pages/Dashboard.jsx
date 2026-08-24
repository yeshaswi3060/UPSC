import { useAuth } from '../context/AuthContext.jsx'

function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <section>
      <h1>Dashboard</h1>
      <p>Signed in as {user?.name ?? 'user'}.</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </section>
  )
}

export default Dashboard
