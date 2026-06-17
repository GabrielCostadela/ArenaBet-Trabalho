import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUsuarios } from '../../services/api'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './UserRanking.module.css'

const MEDALHAS = ['🥇', '🥈', '🥉']

export default function UserRanking() {
  const { usuario } = useAuth()
  const [jogadores, setJogadores] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [criterio,  setCriterio]  = useState('pontos')

  useEffect(() => {
    getUsuarios()
      .then(res => {
        const apenas = res.data.filter(u => u.perfil === 'usuario')
        setJogadores(apenas)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const ordenados = [...jogadores].sort((a, b) => (b[criterio] || 0) - (a[criterio] || 0))
  const posicaoAtual = ordenados.findIndex(j => j.id === usuario.id) + 1

  const CRITERIOS = [
    { key: 'pontos',       label: 'Pontos' },
    { key: 'apostasGanhas', label: 'Vitórias' },
    { key: 'totalApostas', label: 'Apostas' },
    { key: 'saldo',        label: 'Saldo' },
  ]

  if (loading) return <Loading texto="Carregando ranking..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🏆 Ranking de jogadores</h1>
          <p className={styles.sub}>Você está na posição <strong className="text-lime">#{posicaoAtual}</strong> do ranking.</p>
        </div>
      </div>

      {/* Pódio top 3 */}
      {ordenados.length >= 3 && (
        <div className={styles.podio}>
          {[1, 0, 2].map(i => {
            const j = ordenados[i]
            if (!j) return null
            const isAtual = j.id === usuario.id
            return (
              <div key={j.id} className={`${styles.podioItem} ${i === 0 ? styles.podioFirst : ''} ${isAtual ? styles.podioAtual : ''}`}>
                <span className={styles.podioMedalha}>{MEDALHAS[i]}</span>
                <div className={styles.podioAvatar}>{j.nome[0]}</div>
                <span className={styles.podioNome}>{j.nome.split(' ')[0]}</span>
                <span className={styles.podioVal}>
                  {criterio === 'saldo'
                    ? `R$ ${(j[criterio] || 0).toLocaleString('pt-BR')}`
                    : j[criterio] || 0}
                  {criterio === 'pontos' && ' pts'}
                </span>
                <div className={`${styles.podioBarra} ${styles[`podioBarra${i}`]}`} />
              </div>
            )
          })}
        </div>
      )}

      {/* Filtro de critério */}
      <div className={styles.criterios}>
        <span className={styles.criterioLabel}>Ordenar por:</span>
        {CRITERIOS.map(c => (
          <button
            key={c.key}
            className={`${styles.pill} ${criterio === c.key ? styles.pillActive : ''}`}
            onClick={() => setCriterio(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tabela completa */}
      {ordenados.length === 0 ? (
        <EmptyState icone="🏆" titulo="Nenhum jogador ainda" />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Jogador</th>
                <th>Pontos</th>
                <th>Vitórias</th>
                <th>Apostas</th>
                <th>Saldo fictício</th>
                <th>Taxa</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((j, i) => {
                const isAtual = j.id === usuario.id
                const taxa = j.totalApostas > 0
                  ? Math.round((j.apostasGanhas / j.totalApostas) * 100)
                  : 0
                return (
                  <tr key={j.id} className={isAtual ? styles.rowAtual : ''}>
                    <td>
                      <span className={styles.posicao}>
                        {i < 3 ? MEDALHAS[i] : `#${i + 1}`}
                      </span>
                    </td>
                    <td>
                      <div className={styles.jogadorCell}>
                        <div className={`${styles.avatar} ${isAtual ? styles.avatarAtual : ''}`}>
                          {j.nome[0]}
                        </div>
                        <div>
                          <span className={styles.jogadorNome}>
                            {j.nome}
                            {isAtual && <span className={styles.voce}> (você)</span>}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td><span className={styles.pontos}>{j.pontos || 0} pts</span></td>
                    <td><span className="text-success font-semibold">{j.apostasGanhas || 0}</span></td>
                    <td>{j.totalApostas || 0}</td>
                    <td>R$ {(j.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <div className={styles.taxaWrap}>
                        <div className={styles.taxaBar}>
                          <div className={styles.taxaFill} style={{ width: `${taxa}%` }} />
                        </div>
                        <span className={styles.taxaNum}>{taxa}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info de pontuação */}
      <div className={`card ${styles.infoCard}`}>
        <h3 className={styles.infoTitle}>Como funciona a pontuação?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🎯</span>
            <div>
              <p className={styles.infoLabel}>Aposta vencedora</p>
              <p className={styles.infoVal}>+pontos equivalentes ao retorno ÷ 10</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🎁</span>
            <div>
              <p className={styles.infoLabel}>Bônus de boas-vindas</p>
              <p className={styles.infoVal}>R$ 500 fictícios ao criar a conta</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔥</span>
            <div>
              <p className={styles.infoLabel}>Sequência vencedora</p>
              <p className={styles.infoVal}>+100 pts ao vencer 3 apostas seguidas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
