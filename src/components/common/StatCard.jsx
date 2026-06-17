import styles from './StatCard.module.css'

export default function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`stat-card ${accent ? styles.accent : ''}`}>
      <span className="stat-label">{label}</span>
      <span className={`stat-value ${accent ? 'text-lime' : ''}`}>{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  )
}
