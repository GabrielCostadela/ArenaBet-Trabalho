import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { updateUsuario, createMovimentacao } from '../../services/api'
import styles from './UserDepositar.module.css'

const VALORES_RAPIDOS = [100, 250, 500, 1000, 2500, 5000]

const METODOS = [
  { id: 'pix',      icon: '⚡', label: 'PIX Fictício',        sub: 'Crédito instantâneo simulado' },
  { id: 'credito',  icon: '💳', label: 'Cartão Fictício',     sub: 'Crédito simulado em até 1s' },
  { id: 'bonus',    icon: '🎁', label: 'Código de Bônus',     sub: 'Insira um cupom promocional' },
]

const CUPONS_VALIDOS = {
  'ARENABET10': 100,
  'BONUS500':   500,
  'TURMA2026':  250,
}

export default function UserDepositar() {
  const { usuario, atualizarUsuario } = useAuth()
  const navigate = useNavigate()

  const [metodo,    setMetodo]    = useState('pix')
  const [valor,     setValor]     = useState('')
  const [cupom,     setCupom]     = useState('')
  const [etapa,     setEtapa]     = useState('form')   // 'form' | 'confirmando' | 'sucesso'
  const [salvando,  setSalvando]  = useState(false)
  const [erro,      setErro]      = useState('')
  const [depositado, setDepositado] = useState(0)

  function handleValorRapido(v) {
    setValor(String(v))
    setErro('')
  }

  function validar() {
    if (metodo === 'bonus') {
      if (!cupom.trim()) return 'Insira um código de bônus.'
      if (!CUPONS_VALIDOS[cupom.trim().toUpperCase()]) return 'Cupom inválido ou já utilizado.'
      return ''
    }
    if (!valor || isNaN(Number(valor))) return 'Informe um valor.'
    if (Number(valor) < 10)  return 'Valor mínimo: R$ 10.'
    if (Number(valor) > 50000) return 'Valor máximo por depósito: R$ 50.000.'
    return ''
  }

  function handleContinuar() {
    const e = validar()
    if (e) { setErro(e); return }
    setErro('')
    setEtapa('confirmando')
  }

  async function handleConfirmar() {
    setSalvando(true)
    setErro('')
    try {
      let valorFinal = 0
      let descricao  = ''
      let tipo       = ''

      if (metodo === 'bonus') {
        const key = cupom.trim().toUpperCase()
        valorFinal = CUPONS_VALIDOS[key]
        descricao  = `Bônus via cupom: ${key}`
        tipo       = 'bonus'
      } else {
        valorFinal = Number(valor)
        descricao  = metodo === 'pix'
          ? 'Depósito via PIX fictício'
          : 'Depósito via cartão fictício'
        tipo = 'deposito'
      }

      const novoSaldo = (usuario.saldo || 0) + valorFinal
      await updateUsuario(usuario.id, { saldo: novoSaldo })
      await createMovimentacao({
        usuarioId: usuario.id,
        tipo,
        descricao,
        valor: valorFinal,
        criadaEm: new Date().toISOString(),
      })

      atualizarUsuario({ saldo: novoSaldo })
      setDepositado(valorFinal)
      setEtapa('sucesso')
    } catch {
      setErro('Erro ao processar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Tela de sucesso ──────────────────────────────────────
  if (etapa === 'sucesso') {
    return (
      <div className={styles.page}>
        <div className={`card ${styles.sucessoCard}`}>
          <div className={styles.sucessoIconWrap}>
            <span className={styles.sucessoIcon}>✅</span>
          </div>
          <h2 className={styles.sucessoTitle}>Depósito realizado!</h2>
          <p className={styles.sucessoSub}>
            <strong className="text-lime">
              R$ {depositado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>{' '}
            fictícios foram adicionados à sua carteira.
          </p>

          <div className={styles.saldoAtual}>
            <span className={styles.saldoLabel}>Saldo atual</span>
            <span className={styles.saldoVal}>
              R$ {(usuario.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={styles.sucessoBtns}>
            <button className="btn btn-primary" onClick={() => navigate('/app/eventos')}>
              Ver eventos para apostar
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/app/extrato')}>
              Ver extrato
            </button>
            <button className="btn btn-ghost" onClick={() => {
              setEtapa('form'); setValor(''); setCupom(''); setMetodo('pix')
            }}>
              Novo depósito
            </button>
          </div>

          <p className={styles.aviso}>
            ⚠️ Simulação acadêmica — nenhum dinheiro real foi movimentado.
          </p>
        </div>
      </div>
    )
  }

  // ── Tela de confirmação ──────────────────────────────────
  if (etapa === 'confirmando') {
    const valorFinal = metodo === 'bonus'
      ? CUPONS_VALIDOS[cupom.trim().toUpperCase()]
      : Number(valor)

    return (
      <div className={styles.page}>
        <button className={`btn btn-ghost ${styles.btnVoltar}`} onClick={() => setEtapa('form')}>
          ← Voltar
        </button>

        <div className={`card ${styles.confirmCard}`}>
          <h2 className={styles.confirmTitle}>Confirmar depósito fictício</h2>

          <div className={styles.confirmDetalhes}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Método</span>
              <span className={styles.confirmVal}>
                {METODOS.find(m => m.id === metodo)?.icon}{' '}
                {METODOS.find(m => m.id === metodo)?.label}
              </span>
            </div>
            {metodo === 'bonus' && (
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Cupom</span>
                <span className={styles.confirmVal}>{cupom.toUpperCase()}</span>
              </div>
            )}
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Valor a creditar</span>
              <span className={`${styles.confirmVal} ${styles.confirmDestaque}`}>
                R$ {valorFinal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Saldo após depósito</span>
              <span className={styles.confirmVal}>
                R$ {((usuario.saldo || 0) + valorFinal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {erro && <div className="alert alert-error">{erro}</div>}

          <div className={styles.confirmBtns}>
            <button className="btn btn-ghost" onClick={() => setEtapa('form')} disabled={salvando}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleConfirmar} disabled={salvando}>
              {salvando ? 'Processando...' : '✅ Confirmar depósito'}
            </button>
          </div>

          <p className={styles.aviso}>
            ⚠️ Simulação acadêmica. Nenhum PIX, cartão ou dinheiro real é utilizado.
          </p>
        </div>
      </div>
    )
  }

  // ── Formulário principal ─────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Depositar fichas</h1>
          <p className={styles.sub}>Adicione saldo fictício à sua carteira acadêmica.</p>
        </div>
        <div className={styles.saldoAtualSmall}>
          <span className={styles.saldoLabelSm}>Saldo atual</span>
          <span className={styles.saldoValSm}>
            R$ {(usuario.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Formulário */}
        <div className={`card ${styles.formCard}`}>

          {/* Método */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Método de depósito fictício</p>
            <div className={styles.metodos}>
              {METODOS.map(m => (
                <button
                  key={m.id}
                  className={`${styles.metodoBtn} ${metodo === m.id ? styles.metodoBtnAtivo : ''}`}
                  onClick={() => { setMetodo(m.id); setErro(''); setValor(''); setCupom('') }}
                >
                  <span className={styles.metodoIcon}>{m.icon}</span>
                  <span className={styles.metodoLabel}>{m.label}</span>
                  <span className={styles.metodoSub}>{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Campo de valor ou cupom */}
          {metodo === 'bonus' ? (
            <div className={styles.section}>
              <div className="input-group">
                <label>Código do cupom</label>
                <input
                  className="input-field"
                  placeholder="Ex: ARENABET10"
                  value={cupom}
                  onChange={e => { setCupom(e.target.value.toUpperCase()); setErro('') }}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
                />
              </div>
              <div className={styles.cuponsHint}>
                <p className={styles.hintLabel}>Cupons disponíveis para teste:</p>
                <div className={styles.cupons}>
                  {Object.entries(CUPONS_VALIDOS).map(([code, val]) => (
                    <button
                      key={code}
                      className={styles.cupomBtn}
                      onClick={() => { setCupom(code); setErro('') }}
                    >
                      <span className={styles.cupomCode}>{code}</span>
                      <span className={styles.cupomVal}>+R$ {val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.section}>
              <div className="input-group">
                <label>Valor do depósito (R$)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Ex: 500"
                  min="10"
                  max="50000"
                  value={valor}
                  onChange={e => { setValor(e.target.value); setErro('') }}
                />
              </div>

              <div className={styles.valoresRapidos}>
                <p className={styles.hintLabel}>Valores rápidos</p>
                <div className={styles.valoresGrid}>
                  {VALORES_RAPIDOS.map(v => (
                    <button
                      key={v}
                      className={`${styles.valorBtn} ${valor === String(v) ? styles.valorBtnAtivo : ''}`}
                      onClick={() => handleValorRapido(v)}
                    >
                      R$ {v.toLocaleString('pt-BR')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {erro && <div className="alert alert-error">{erro}</div>}

          <button className={`btn btn-primary ${styles.btnContinuar}`} onClick={handleContinuar}>
            Continuar →
          </button>
        </div>

        {/* Info lateral */}
        <div className={styles.infoCol}>
          <div className={`card ${styles.infoCard}`}>
            <h3 className={styles.infoTitle}>ℹ️ Como funciona</h3>
            <ul className={styles.infoList}>
              <li>Escolha um método fictício e o valor desejado.</li>
              <li>Confirme o depósito na próxima tela.</li>
              <li>O saldo é creditado instantaneamente na sua carteira.</li>
              <li>Use o saldo para fazer apostas nos eventos disponíveis.</li>
            </ul>
          </div>

          <div className={`card ${styles.infoCard}`}>
            <h3 className={styles.infoTitle}>⚠️ Aviso acadêmico</h3>
            <p className={styles.infoTxt}>
              Este sistema é uma simulação para fins exclusivamente educacionais.
              Nenhum valor real, PIX, cartão, criptomoeda ou gateway de pagamento
              é utilizado nesta plataforma.
            </p>
          </div>

          <div className={`card ${styles.infoCard}`}>
            <h3 className={styles.infoTitle}>📊 Sua carteira</h3>
            <div className={styles.carteiraGrid}>
              <div className={styles.carteiraItem}>
                <span className={styles.carteiraLabel}>Saldo disponível</span>
                <span className={styles.carteiraVal}>
                  R$ {(usuario.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={styles.carteiraItem}>
                <span className={styles.carteiraLabel}>Pontos no ranking</span>
                <span className={styles.carteiraVal}>{usuario.pontos ?? 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
