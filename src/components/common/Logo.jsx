import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

export default function Logo({ size = 'md', to = '/' }) {
  return (
    <Link to={to} className={`${styles.logo} ${styles[size]}`}>
      <span className={styles.icon}>A</span>
      <span className={styles.text}>
        Arena<span className={styles.accent}>Bet</span>
      </span>
    </Link>
  )
}
