import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/common/Logo'
import styles from './AdminLayout.module.css'

const NAV = [
  { to: '/admin/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/admin/eventos',    icon: '🏟️', label: 'Eventos' },
  { to: '/admin/resultados', icon: '🏆', label: 'Resultados' },
]

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <Logo size="sm" to="/admin/dashboard" />
          <span className="badge badge-admin" style={{ marginTop: 4 }}>Admin</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sideBottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{usuario?.nome?.[0] ?? 'A'}</div>
            <div className={styles.userText}>
              <span className={styles.userName}>{usuario?.nome}</span>
              <span className={styles.userEmail}>{usuario?.email}</span>
            </div>
          </div>
          <button className={`btn btn-ghost ${styles.logoutBtn}`} onClick={handleLogout}>
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
