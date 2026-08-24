import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import PrashnavaliApp from './pages/PrashnavaliApp.jsx'
import Login from './pages/Login.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PrashnavaliApp />} />

      <Route element={<MainLayout />}>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
