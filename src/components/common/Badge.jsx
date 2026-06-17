const MAP = {
  aberto:   'badge-open',
  encerrado:'badge-closed',
  pendente: 'badge-pending',
  ganhou:   'badge-won',
  perdeu:   'badge-lost',
  admin:    'badge-admin',
  usuario:  'badge-open',
}

const LABEL = {
  aberto:   'Aberto',
  encerrado:'Encerrado',
  pendente: 'Pendente',
  ganhou:   'Ganhou',
  perdeu:   'Perdeu',
  admin:    'Admin',
  usuario:  'Jogador',
}

export default function Badge({ status }) {
  const cls = MAP[status] || 'badge-pending'
  const label = LABEL[status] || status
  return <span className={`badge ${cls}`}>{label}</span>
}
