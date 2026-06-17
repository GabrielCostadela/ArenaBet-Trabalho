import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEventos, getApostas, getUsuarios } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const [eventos,  setEventos]  = useState([])
  const [apostas,  setApostas]  = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const [rE, rA, rU] = await Promise.all([
          getEventos(), getApostas(), getUsuarios(),
        ])
        setEventos(rE.data)
        setApostas(rA.data)
        setUsuarios(rU.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  if (loading) return <Loading texto="Carregando painel..." />

  const jogadores     = usuarios.filter(u => u.perfil === 'usuario')
  const abertos       = eventos.filter(e => e.status === 'aberto')
  const encerrados    = eventos.filter(e => e.status === 'encerrado')
  const pendentes     = apostas.filter(a => a.status === 'pendente')
  const totalApostado = apostas.reduce((s, a) => s + a.valor, 0)
  const ultimosEventos = [...eventos].slice(-5).reverse()

  const sportCount = apostas.reduce((acc, ap) => {
    const ev = eventos.find(e => e.id === ap.eventoId)
    if (ev) acc[ev.esporte] = (acc[ev.esporte] || 0) + 1
    return acc
  }, {})
  const topEsportes = Object.entries(sportCount).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Painel administrativo</h1>
          <p className={styles.sub}>Visão geral da plataforma ArenaBet.</p>
        </div>
        <div className={styles.headerActions}>
          <Link to="/admin/eventos"    className="btn btn-ghost">Gerenciar eventos</Link>
          <Link to="/admin/resultados" className="btn btn-primary">Registrar resultado</Link>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Eventos abertos"   value={abertos.length}   sub={`${encerrados.length} encerrados`} accent />
        <StatCard label="Apostas pendentes" value={pendentes.length} sub={`${apostas.length} no total`} />
        <StatCard label="Jogadores"         value={jogadores.length} sub="Contas ativas" />
        <StatCard label="Total apostado"    value={`R$ ${totalApostado.toLocaleString('pt-BR')}`} sub="Valor fictício" />
      </div>

      <div className={styles.columns}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Eventos recentes</h2>
            <Link to="/admin/eventos" className={styles.link}>Ver todos →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Evento</th><th>Esporte</th><th>Data</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ultimosEventos.length === 0
                  ? <tr><td colSpan={4} style={{textAlign:'center',color:'var(--gray-light)',padding:24}}>Nenhum evento cadastrado.</td></tr>
                  : ultimosEventos.map(ev => (
                    <tr key={ev.id}>
                      <td className={styles.eventoNome}>{ev.timeA} <span>vs</span> {ev.timeB}</td>
                      <td><span className={styles.esporte}>{ev.esporte}</span></td>
                      <td className={styles.data}>{new Date(ev.data+'T00:00:00').toLocaleDateString('pt-BR')}</td>
                      <td><Badge status={ev.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </section>

        <div className={styles.aside}>
          <section className={`card ${styles.quickCard}`}>
            <h2 className={styles.sectionTitle}>Ações rápidas</h2>
            <div className={styles.quickList}>
              <Link to="/admin/eventos" className={`card card-hover ${styles.quickItem}`}>
                <span className={styles.quickIcon}>🏟️</span>
                <div>
                  <p className={styles.quickLabel}>Novo evento</p>
                  <p className={styles.quickSub}>Cadastrar partida ou disputa</p>
                </div>
              </Link>
              <Link to="/admin/resultados" className={`card card-hover ${styles.quickItem}`}>
                <span className={styles.quickIcon}>🏆</span>
                <div>
                  <p className={styles.quickLabel}>Registrar resultado</p>
                  <p className={styles.quickSub}>Encerrar evento e pagar apostas</p>
                </div>
              </Link>
            </div>
          </section>

          {topEsportes.length > 0 && (
            <section className={`card ${styles.quickCard}`}>
              <h2 className={styles.sectionTitle}>Apostas por esporte</h2>
              <div className={styles.esporteList}>
                {topEsportes.map(([esporte, count]) => {
                  const pct = Math.round((count / apostas.length) * 100)
                  return (
                    <div key={esporte} className={styles.esporteRow}>
                      <span className={styles.esporteNome}>{esporte}</span>
                      <div className={styles.barWrap}><div className={styles.bar} style={{width:`${pct}%`}} /></div>
                      <span className={styles.esportePct}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
