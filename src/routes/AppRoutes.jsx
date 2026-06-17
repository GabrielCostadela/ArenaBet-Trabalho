import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Auth
import LoginPage    from '../pages/auth/LoginPage'
import CadastroPage from '../pages/auth/CadastroPage'

// Admin
import AdminLayout from '../pages/admin/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminEventos from '../pages/admin/AdminEventos'
import AdminResultados from '../pages/admin/AdminResultados'

// Usuário
import UserLayout from '../pages/user/UserLayout'
import UserDashboard from '../pages/user/UserDashboard'
import UserEventos from '../pages/user/UserEventos'
import UserApostas from '../pages/user/UserApostas'
import UserHistorico from '../pages/user/UserHistorico'
import UserRanking from '../pages/user/UserRanking'
import UserExtrato from '../pages/user/UserExtrato'
import UserDepositar from '../pages/user/UserDepositar'
import UserSacar     from '../pages/user/UserSacar'

// Guards
function RotaPrivada({ children }) {
  const { isLogado, carregando } = useAuth()
  if (carregando) return <div className="loading-center"><div className="spinner" /></div>
  return isLogado ? children : <Navigate to="/login" replace />
}

function RotaAdmin({ children }) {
  const { isAdmin, isLogado, carregando } = useAuth()
  if (carregando) return <div className="loading-center"><div className="spinner" /></div>
  if (!isLogado) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/app/dashboard" replace />
  return children
}

function RotaPublica({ children }) {
  const { isLogado, isAdmin, carregando } = useAuth()
  if (carregando) return <div className="loading-center"><div className="spinner" /></div>
  if (isLogado) return <Navigate to={isAdmin ? '/admin/dashboard' : '/app/dashboard'} replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Raiz */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Pública */}
      <Route path="/login"    element={<RotaPublica><LoginPage /></RotaPublica>} />
      <Route path="/cadastro" element={<RotaPublica><CadastroPage /></RotaPublica>} />

      {/* Admin */}
      <Route path="/admin" element={<RotaAdmin><AdminLayout /></RotaAdmin>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"   element={<AdminDashboard />} />
        <Route path="eventos"     element={<AdminEventos />} />
        <Route path="resultados"  element={<AdminResultados />} />
      </Route>

      {/* Usuário */}
      <Route path="/app" element={<RotaPrivada><UserLayout /></RotaPrivada>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"  element={<UserDashboard />} />
        <Route path="eventos"    element={<UserEventos />} />
        <Route path="apostar/:eventoId" element={<UserApostas />} />
        <Route path="historico"  element={<UserHistorico />} />
        <Route path="ranking"    element={<UserRanking />} />
        <Route path="extrato"    element={<UserExtrato />} />
        <Route path="depositar"  element={<UserDepositar />} />
        <Route path="sacar"      element={<UserSacar />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
