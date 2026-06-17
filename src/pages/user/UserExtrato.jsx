import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getMovimentacoesByUsuario } from '../../services/api'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './UserExtrato.module.css'

const TIPO_CONFIG = {
  aposta:           { icone: '🎯', label: 'Aposta',           cor: 'danger'  },
  ganho:            { icone: '🏆', label: 'Prêmio recebido',  cor: 'success' },
  perda:            { icone: '❌', label: 'Aposta perdida',   cor: 'danger'  },
  bonus_boas_vindas:{ icone: '🎁', label: 'Bônus boas-vindas',cor: 'success' },
  sequencia:        { icone: '🔥', label: 'Bônus sequência',  cor: 'success' },
  bonus:            { icone: '🎁', label: 'Bônus',            cor: 'success' },
  deposito:         { icone: '💰', label: 'Depósito',         cor: 'success' },
  saque:            { icone: '💸', label: 'Saque',            cor: 'danger'  },
}

const FILTROS = ['Todos', 'ganho', 'aposta', 'bonus_boas_vindas']

export default function UserExtrato() {
  const { usuario } = useAuth()
  const [movs,    setMovs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro,  setFiltro]  = useState('Todos')

  useEffect(() => {
    getMovimentacoesByUsuario(usuario.id)
      .then(res => {
        setMovs(res.data.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm)))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [usuario.id])

  const filtradas = filtro === 'Todos' ? movs : movs.filter(m => m.tipo === filtro)

  const totalEntradas = movs.filter(m => m.valor > 0).reduce((s, m) => s + m.valor, 0)
  const totalSaidas   = movs.filter(m => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0)
  const saldoMovs     = totalEntradas - totalSaidas

  function formatarData(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return <Loading texto="Carregando extrato..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Extrato de movimentações</h1>
          <p className={styles.sub}>Histórico financeiro fictício da sua conta.</p>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className={styles.resumoGrid}>
        <div className={`${styles.resumoCard} ${styles.resumoEntrada}`}>
          <span className={styles.resumoIcon}>⬆️</span>
          <div>
            <p className={styles.resumoLabel}>Total de entradas</p>
            <p className={`${styles.resumoVal} text-success`}>
              +R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className={`${styles.resumoCard} ${styles.resumoSaida}`}>
          <span className={styles.resumoIcon}>⬇️</span>
          <div>
            <p className={styles.resumoLabel}>Total de saídas</p>
            <p className={`${styles.resumoVal} text-danger`}>
              -R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className={`${styles.resumoCard} ${styles.resumoSaldo}`}>
          <span className={styles.resumoIcon}>💰</span>
          <div>
            <p className={styles.resumoLabel}>Saldo atual fictício</p>
            <p className={`${styles.resumoVal} text-lime`}>
              R$ {(usuario.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
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
            {f === 'Todos' ? 'Todos'
              : f === 'ganho' ? '🏆 Prêmios'
              : f === 'aposta' ? '🎯 Apostas'
              : '🎁 Bônus'}
            <span className={styles.pillCount}>
              {f === 'Todos' ? movs.length : movs.filter(m => m.tipo === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <EmptyState icone="💳" titulo="Nenhuma movimentação" subtitulo="Faça sua primeira aposta para ver o extrato." />
      ) : (
        <div className={styles.lista}>
          {filtradas.map((mov, idx) => {
            const cfg = TIPO_CONFIG[mov.tipo] || { icone: '💲', label: mov.tipo, cor: 'gray' }
            const positivo = mov.valor > 0
            return (
              <div key={mov.id ?? idx} className={`card ${styles.movItem}`}>
                <div className={styles.movIcon}>{cfg.icone}</div>
                <div className={styles.movInfo}>
                  <span className={styles.movDescricao}>{mov.descricao}</span>
                  <span className={styles.movTipo}>{cfg.label}</span>
                  <span className={styles.movData}>{formatarData(mov.criadaEm)}</span>
                </div>
                <div className={`${styles.movValor} ${positivo ? styles.movPos : styles.movNeg}`}>
                  {positivo ? '+' : ''}R$ {Math.abs(mov.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className={styles.aviso}>
        ⚠️ Todos os valores são fictícios e têm finalidade exclusivamente acadêmica.
      </p>
    </div>
  )
}
