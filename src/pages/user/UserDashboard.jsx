import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getApostasByUsuario, getEventos } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './UserDashboard.module.css'

export default function UserDashboard() {
  const { usuario } = useAuth()
  const [apostas, setApostas]   = useState([])
  const [eventos, setEventos]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const [rA, rE] = await Promise.all([
          getApostasByUsuario(usuario.id),
          getEventos(),
        ])
        setApostas(rA.data)
        setEventos(rE.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [usuario.id])

  if (loading) return <Loading texto="Carregando dashboard..." />

  const ganhas    = apostas.filter(a => a.status === 'ganhou').length
  const perdidas  = apostas.filter(a => a.status === 'perdeu').length
  const pendentes = apostas.filter(a => a.status === 'pendente').length
  const totalGasto = apostas.reduce((s, a) => s + a.valor, 0)
  const totalRetorno = apostas.filter(a => a.status === 'ganhou').reduce((s, a) => s + a.retorno, 0)
  const taxaAcerto = apostas.length > 0 ? Math.round((ganhas / apostas.length) * 100) : 0

  const eventosAbertos = eventos.filter(e => e.status === 'aberto').slice(0, 3)
  const ultimasApostas = [...apostas]
    .sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm))
    .slice(0, 4)

  function nomeEvento(eventoId) {
    const ev = eventos.find(e => e.id === eventoId)
    return ev ? `${ev.timeA} x ${ev.timeB}` : '—'
  }

  function formatarData(dataStr) {
    if (!dataStr) return '—'
    return new Date(dataStr).toLocaleDateString('pt-BR')
  }

  return (
    <div className={styles.page}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Olá, {usuario.nome.split(' ')[0]} 👋
          </h1>
          <p className={styles.sub}>Acompanhe suas apostas e eventos disponíveis.</p>
        </div>
        <Link to="/app/eventos" className="btn btn-primary">
          Ver eventos
        </Link>
      </div>

      {/* Stats principais */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Saldo fictício"
          value={`R$ ${(usuario.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          sub="Disponível para apostas"
          accent
        />
        <StatCard
          label="Apostas realizadas"
          value={apostas.length}
          sub={`${pendentes} pendente${pendentes !== 1 ? 's' : ''}`}
        />
        <StatCard
          label="Taxa de acerto"
          value={`${taxaAcerto}%`}
          sub={`${ganhas} ganhas · ${perdidas} perdidas`}
        />
        <StatCard
          label="Pontos no ranking"
          value={usuario.pontos ?? 0}
          sub="Continue apostando para subir!"
        />
      </div>

      <div className={styles.columns}>
        {/* Eventos em aberto */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Eventos em aberto</h2>
            <Link to="/app/eventos" className={styles.seeAll}>Ver todos →</Link>
          </div>

          {eventosAbertos.length === 0 ? (
            <EmptyState icone="🏟️" titulo="Nenhum evento disponível" subtitulo="Volte em breve para novas oportunidades." />
          ) : (
            <div className={styles.eventosList}>
              {eventosAbertos.map(ev => (
                <div key={ev.id} className={`card card-hover ${styles.eventoCard}`}>
                  <div className={styles.eventoTop}>
                    <span className={styles.esporte}>{ev.esporte}</span>
                    <Badge status={ev.status} />
                  </div>
                  <p className={styles.eventoTimes}>{ev.timeA} <span>vs</span> {ev.timeB}</p>
                  <div className={styles.eventoOdds}>
                    <div className={styles.oddItem}>
                      <span className={styles.oddLabel}>{ev.timeA}</span>
                      <span className={styles.oddValue}>{ev.oddA?.toFixed(2)}</span>
                    </div>
                    {ev.oddEmpate && (
                      <div className={styles.oddItem}>
                        <span className={styles.oddLabel}>Empate</span>
                        <span className={styles.oddValue}>{ev.oddEmpate?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={styles.oddItem}>
                      <span className={styles.oddLabel}>{ev.timeB}</span>
                      <span className={styles.oddValue}>{ev.oddB?.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link to={`/app/apostar/${ev.id}`} className={`btn btn-primary ${styles.apostarBtn}`}>
                    Apostar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Últimas apostas */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Últimas apostas</h2>
            <Link to="/app/historico" className={styles.seeAll}>Ver histórico →</Link>
          </div>

          {ultimasApostas.length === 0 ? (
            <EmptyState icone="🎯" titulo="Nenhuma aposta ainda" subtitulo="Escolha um evento e faça sua primeira aposta!" />
          ) : (
            <div className={styles.apostasList}>
              {ultimasApostas.map(ap => (
                <div key={ap.id} className={`card ${styles.apostaItem}`}>
                  <div className={styles.apostaInfo}>
                    <span className={styles.apostaEvento}>{nomeEvento(ap.eventoId)}</span>
                    <span className={styles.apostaPalpite}>Palpite: <strong>{ap.palpite}</strong></span>
                    <span className={styles.apostaData}>{formatarData(ap.criadaEm)}</span>
                  </div>
                  <div className={styles.apostaRight}>
                    <Badge status={ap.status} />
                    <span className={styles.apostaValor}>
                      {ap.status === 'ganhou'
                        ? <span className="text-success">+R$ {ap.retorno}</span>
                        : ap.status === 'perdeu'
                        ? <span className="text-danger">-R$ {ap.valor}</span>
                        : <span className="text-warning">R$ {ap.valor}</span>
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Resumo financeiro */}
      <section className={`card ${styles.resumo}`}>
        <h2 className={styles.sectionTitle}>Resumo financeiro fictício</h2>
        <div className={styles.resumoGrid}>
          <div className={styles.resumoItem}>
            <span className={styles.resumoLabel}>Total apostado</span>
            <span className={styles.resumoValor}>R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className={styles.resumoItem}>
            <span className={styles.resumoLabel}>Total recebido</span>
            <span className={`${styles.resumoValor} text-success`}>R$ {totalRetorno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className={styles.resumoItem}>
            <span className={styles.resumoLabel}>Resultado líquido</span>
            <span className={`${styles.resumoValor} ${totalRetorno - totalGasto >= 0 ? 'text-success' : 'text-danger'}`}>
              R$ {(totalRetorno - totalGasto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}
