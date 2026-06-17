import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/common/Logo'
import styles from './UserLayout.module.css'

const NAV = [
  { to: '/app/dashboard', icon: '🏠', label: 'Início' },
  { to: '/app/eventos',   icon: '🏟️', label: 'Eventos' },
  { to: '/app/historico', icon: '📋', label: 'Histórico' },
  { to: '/app/ranking',   icon: '🏆', label: 'Ranking' },
  { to: '/app/extrato',   icon: '💳', label: 'Extrato' },
]

export default function UserLayout() {
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
          <Logo size="sm" to="/app/dashboard" />
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
          <div className={styles.saldoBox}>
            <span className={styles.saldoLabel}>Saldo fictício</span>
            <span className={styles.saldoValue}>
              R$ {(usuario?.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{usuario?.nome?.[0] ?? 'U'}</div>
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
