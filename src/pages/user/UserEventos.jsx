import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEventos } from '../../services/api'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './UserEventos.module.css'

const ESPORTES = ['Todos', 'Futebol', 'Basquete', 'Tênis', 'Vôlei']
const STATUS   = ['Todos', 'aberto', 'encerrado']

export default function UserEventos() {
  const [eventos, setEventos]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [filtroEsporte, setFiltroEsporte] = useState('Todos')
  const [filtroStatus, setFiltroStatus]   = useState('aberto')
  const [busca, setBusca]           = useState('')

  useEffect(() => {
    getEventos()
      .then(r => setEventos(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtrados = eventos.filter(ev => {
    const matchEsporte = filtroEsporte === 'Todos' || ev.esporte === filtroEsporte
    const matchStatus  = filtroStatus  === 'Todos' || ev.status  === filtroStatus
    const matchBusca   = busca === '' ||
      ev.timeA.toLowerCase().includes(busca.toLowerCase()) ||
      ev.timeB.toLowerCase().includes(busca.toLowerCase()) ||
      ev.esporte.toLowerCase().includes(busca.toLowerCase())
    return matchEsporte && matchStatus && matchBusca
  })

  const abertos    = eventos.filter(e => e.status === 'aberto').length
  const encerrados = eventos.filter(e => e.status === 'encerrado').length

  if (loading) return <Loading texto="Carregando eventos..." />

  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Eventos esportivos</h1>
          <p className={styles.sub}>
            <span className={styles.countAberto}>{abertos} abertos</span>
            <span className={styles.dot}>·</span>
            <span className={styles.countEnc}>{encerrados} encerrados</span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        <input
          type="text"
          className={`input-field ${styles.busca}`}
          placeholder="🔍  Buscar por time ou esporte..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />

        <div className={styles.filtroGrupo}>
          <span className={styles.filtroLabel}>Esporte</span>
          <div className={styles.pills}>
            {ESPORTES.map(e => (
              <button
                key={e}
                className={`${styles.pill} ${filtroEsporte === e ? styles.pillActive : ''}`}
                onClick={() => setFiltroEsporte(e)}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filtroGrupo}>
          <span className={styles.filtroLabel}>Status</span>
          <div className={styles.pills}>
            {STATUS.map(s => (
              <button
                key={s}
                className={`${styles.pill} ${filtroStatus === s ? styles.pillActive : ''}`}
                onClick={() => setFiltroStatus(s)}
              >
                {s === 'aberto' ? 'Abertos' : s === 'encerrado' ? 'Encerrados' : 'Todos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de eventos */}
      {filtrados.length === 0 ? (
        <EmptyState
          icone="🔍"
          titulo="Nenhum evento encontrado"
          subtitulo="Tente ajustar os filtros ou a busca."
        />
      ) : (
        <div className={styles.grid}>
          {filtrados.map(ev => (
            <EventoCard key={ev.id} evento={ev} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventoCard({ evento: ev }) {
  const dataFormatada = new Date(ev.data + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className={`card ${styles.card}`}>
      {/* Topo */}
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <span className={styles.esporte}>{ev.esporte}</span>
          {ev.descricao && <span className={styles.descricao}>{ev.descricao}</span>}
        </div>
        <Badge status={ev.status} />
      </div>

      {/* Times */}
      <div className={styles.times}>
        <div className={styles.time}>
          <div className={styles.timeAvatar}>{ev.timeA[0]}</div>
          <span className={styles.timeNome}>{ev.timeA}</span>
        </div>
        <div className={styles.vsBox}>
          <span className={styles.vs}>VS</span>
          <span className={styles.hora}>{ev.hora}</span>
          <span className={styles.data}>{dataFormatada}</span>
        </div>
        <div className={`${styles.time} ${styles.timeRight}`}>
          <div className={styles.timeAvatar}>{ev.timeB[0]}</div>
          <span className={styles.timeNome}>{ev.timeB}</span>
        </div>
      </div>

      {/* Odds */}
      <div className={styles.odds}>
        <div className={styles.oddBox}>
          <span className={styles.oddNome}>{ev.timeA}</span>
          <span className={styles.oddNum}>{ev.oddA?.toFixed(2)}</span>
        </div>
        {ev.oddEmpate && (
          <div className={styles.oddBox}>
            <span className={styles.oddNome}>Empate</span>
            <span className={styles.oddNum}>{ev.oddEmpate?.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.oddBox}>
          <span className={styles.oddNome}>{ev.timeB}</span>
          <span className={styles.oddNum}>{ev.oddB?.toFixed(2)}</span>
        </div>
      </div>

      {/* Resultado se encerrado */}
      {ev.status === 'encerrado' && ev.resultado && (
        <div className={styles.resultado}>
          🏆 Resultado: <strong>{ev.resultado}</strong>
        </div>
      )}

      {/* Ação */}
      {ev.status === 'aberto' ? (
        <Link to={`/app/apostar/${ev.id}`} className={`btn btn-primary ${styles.btnApostar}`}>
          Fazer aposta
        </Link>
      ) : (
        <div className={`btn ${styles.btnEncerrado}`} aria-disabled>
          Apostas encerradas
        </div>
      )}
    </div>
  )
}
