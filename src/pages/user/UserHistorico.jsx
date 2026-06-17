import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getApostasByUsuario, getEventos } from '../../services/api'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './UserHistorico.module.css'

const FILTROS = ['Todas', 'pendente', 'ganhou', 'perdeu']

export default function UserHistorico() {
  const { usuario } = useAuth()
  const [apostas,  setApostas]  = useState([])
  const [eventos,  setEventos]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filtro,   setFiltro]   = useState('Todas')

  useEffect(() => {
    async function carregar() {
      try {
        const [rA, rE] = await Promise.all([
          getApostasByUsuario(usuario.id),
          getEventos(),
        ])
        setApostas(rA.data.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)))
        setEventos(rE.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [usuario.id])

  const filtradas = filtro === 'Todas' ? apostas : apostas.filter(a => a.status === filtro)

  function getEvento(id) { return eventos.find(e => e.id === id) }

  const ganhas   = apostas.filter(a => a.status === 'ganhou').length
  const perdidas = apostas.filter(a => a.status === 'perdeu').length
  const pendentes= apostas.filter(a => a.status === 'pendente').length
  const totalRetorno = apostas.filter(a => a.status === 'ganhou').reduce((s, a) => s + a.retorno, 0)
  const totalGasto   = apostas.reduce((s, a) => s + a.valor, 0)

  if (loading) return <Loading texto="Carregando histórico..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Histórico de apostas</h1>
          <p className={styles.sub}>{apostas.length} aposta{apostas.length !== 1 ? 's' : ''} realizadas</p>
        </div>
      </div>

      {/* Resumo */}
      <div className={styles.resumoGrid}>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Total apostado</span>
          <span className={styles.resumoVal}>R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Total recebido</span>
          <span className={`${styles.resumoVal} text-success`}>R$ {totalRetorno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Ganhas</span>
          <span className={`${styles.resumoVal} text-success`}>{ganhas}</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Perdidas</span>
          <span className={`${styles.resumoVal} text-danger`}>{perdidas}</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Pendentes</span>
          <span className={`${styles.resumoVal} text-warning`}>{pendentes}</span>
        </div>
        <div className={styles.resumoItem}>
          <span className={styles.resumoLabel}>Taxa de acerto</span>
          <span className={styles.resumoVal}>
            {apostas.length > 0 ? Math.round((ganhas / apostas.filter(a => a.status !== 'pendente').length || 1) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {FILTROS.map(f => (
          <button
            key={f}
            className={`${styles.pill} ${filtro === f ? styles.pillActive : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'Todas' ? 'Todas' : f === 'ganhou' ? '✅ Ganhas' : f === 'perdeu' ? '❌ Perdidas' : '⏳ Pendentes'}
            <span className={styles.pillCount}>
              {f === 'Todas' ? apostas.length : apostas.filter(a => a.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <EmptyState icone="🎯" titulo="Nenhuma aposta encontrada" subtitulo="Tente outro filtro ou faça sua primeira aposta!" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Esporte</th>
                <th>Palpite</th>
                <th>Odd</th>
                <th>Apostado</th>
                <th>Retorno</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(ap => {
                const ev = getEvento(ap.eventoId)
                return (
                  <tr key={ap.id}>
                    <td>
                      <span className={styles.eventoNome}>
                        {ev ? `${ev.timeA} x ${ev.timeB}` : '—'}
                      </span>
                      {ev?.resultado && ap.status !== 'pendente' && (
                        <span className={styles.resultado}>Resultado: {ev.resultado}</span>
                      )}
                    </td>
                    <td><span className={styles.esporte}>{ev?.esporte || '—'}</span></td>
                    <td><strong>{ap.palpite}</strong></td>
                    <td><span className={styles.odd}>{ap.oddUsada?.toFixed(2)}</span></td>
                    <td>R$ {ap.valor.toLocaleString('pt-BR')}</td>
                    <td>
                      {ap.status === 'ganhou'
                        ? <span className="text-success font-bold">+R$ {ap.retorno.toLocaleString('pt-BR')}</span>
                        : ap.status === 'perdeu'
                        ? <span className="text-danger">—</span>
                        : <span className="text-warning">Aguardando</span>
                      }
                    </td>
                    <td className={styles.dataCol}>
                      {ap.criadaEm ? new Date(ap.criadaEm).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td><Badge status={ap.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
