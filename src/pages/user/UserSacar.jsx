import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { updateUsuario, createMovimentacao } from '../../services/api'
import styles from './UserSacar.module.css'

const METODOS = [
  { id: 'pix',     icon: '⚡', label: 'PIX Fictício',     sub: 'Transferência simulada instantânea' },
  { id: 'ted',     icon: '🏦', label: 'TED Fictício',      sub: 'Transferência bancária simulada'    },
  { id: 'carteira',icon: '👜', label: 'Carteira Digital',  sub: 'Crédito em carteira simulada'       },
]

export default function UserSacar() {
  const { usuario, atualizarUsuario } = useAuth()
  const navigate = useNavigate()

  const [metodo,    setMetodo]    = useState('pix')
  const [valor,     setValor]     = useState('')
  const [chave,     setChave]     = useState('')
  const [etapa,     setEtapa]     = useState('form')   // form | confirmando | sucesso
  const [salvando,  setSalvando]  = useState(false)
  const [erro,      setErro]      = useState('')
  const [sacado,    setSacado]    = useState(0)

  const saldo = usuario?.saldo ?? 0

  function validar() {
    if (!valor || isNaN(Number(valor))) return 'Informe o valor do saque.'
    if (Number(valor) < 10)             return 'Valor mínimo de saque: R$ 10.'
    if (Number(valor) > saldo)          return `Saldo insuficiente. Disponível: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`
    if (metodo !== 'carteira' && !chave.trim()) return 'Informe a chave de destino.'
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
      const val = Number(valor)
      const novoSaldo = saldo - val

      await updateUsuario(usuario.id, { saldo: novoSaldo })
      await createMovimentacao({
        usuarioId: usuario.id,
        tipo:      'saque',
        descricao: metodo === 'pix'
          ? `Saque PIX fictício — chave: ${chave}`
          : metodo === 'ted'
          ? `Saque TED fictício — conta: ${chave}`
          : 'Saque para carteira digital fictícia',
        valor:     -val,
        criadaEm: new Date().toISOString(),
      })

      atualizarUsuario({ saldo: novoSaldo })
      setSacado(val)
      setEtapa('sucesso')
    } catch {
      setErro('Erro ao processar o saque. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  const valorNum    = Number(valor) || 0
  const saldoApos   = Math.max(0, saldo - valorNum)

  // ── Sucesso ──────────────────────────────────────────────
  if (etapa === 'sucesso') {
    return (
      <div className={styles.page}>
        <div className={`card ${styles.sucessoCard}`}>
          <div className={styles.sucessoIconWrap}>
            <span className={styles.sucessoIcon}>💸</span>
          </div>
          <h2 className={styles.sucessoTitle}>Saque realizado!</h2>
          <p className={styles.sucessoSub}>
            <strong className="text-lime">
              R$ {sacado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>{' '}
            fictícios foram debitados da sua carteira.
          </p>

          <div className={styles.saldoBox}>
            <span className={styles.saldoLabel}>Saldo restante</span>
            <span className={styles.saldoVal}>
              R$ {(usuario.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className={styles.sucessoBtns}>
            <button className="btn btn-primary" onClick={() => navigate('/app/extrato')}>
              Ver extrato
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/app/dashboard')}>
              Ir para o início
            </button>
            <button className="btn btn-ghost" onClick={() => {
              setEtapa('form'); setValor(''); setChave(''); setMetodo('pix')
            }}>
              Novo saque
            </button>
          </div>
          <p className={styles.aviso}>⚠️ Simulação acadêmica — nenhum dinheiro real foi movimentado.</p>
        </div>
      </div>
    )
  }

  // ── Confirmação ───────────────────────────────────────────
  if (etapa === 'confirmando') {
    return (
      <div className={styles.page}>
        <button className={`btn btn-ghost ${styles.btnVoltar}`} onClick={() => setEtapa('form')}>
          ← Voltar
        </button>
        <div className={`card ${styles.confirmCard}`}>
          <h2 className={styles.confirmTitle}>Confirmar saque fictício</h2>

          <div className={styles.confirmDetalhes}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Método</span>
              <span className={styles.confirmVal}>
                {METODOS.find(m => m.id === metodo)?.icon}{' '}
                {METODOS.find(m => m.id === metodo)?.label}
              </span>
            </div>
            {chave && (
              <div className={styles.confirmRow}>
                <span className={styles.confirmLabel}>Destino</span>
                <span className={styles.confirmVal}>{chave}</span>
              </div>
            )}
            <div className={styles.confirmDivider} />
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Valor do saque</span>
              <span className={`${styles.confirmVal} ${styles.confirmDestaque}`}>
                R$ {valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>Saldo após saque</span>
              <span className={`${styles.confirmVal} ${saldoApos < 50 ? 'text-danger' : ''}`}>
                R$ {saldoApos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {saldoApos < 50 && (
            <div className="alert alert-warning">
              ⚠️ Seu saldo ficará muito baixo após este saque. Considere depositar mais fichas.
            </div>
          )}

          {erro && <div className="alert alert-error">{erro}</div>}

          <div className={styles.confirmBtns}>
            <button className="btn btn-ghost" onClick={() => setEtapa('form')} disabled={salvando}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleConfirmar} disabled={salvando}>
              {salvando ? 'Processando...' : '💸 Confirmar saque'}
            </button>
          </div>
          <p className={styles.aviso}>⚠️ Simulação acadêmica. Nenhum PIX ou transferência real é realizado.</p>
        </div>
      </div>
    )
  }

  // ── Formulário ────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sacar fichas</h1>
          <p className={styles.sub}>Simule uma retirada do seu saldo fictício.</p>
        </div>
        <div className={styles.saldoDisp}>
          <span className={styles.saldoDispLabel}>Disponível para saque</span>
          <span className={styles.saldoDispVal}>
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {saldo < 10 && (
        <div className="alert alert-warning">
          ⚠️ Saldo insuficiente para saque. Deposite mais fichas para continuar.
        </div>
      )}

      <div className={styles.layout}>
        <div className={`card ${styles.formCard}`}>

          {/* Método */}
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Método de saque fictício</p>
            <div className={styles.metodos}>
              {METODOS.map(m => (
                <button
                  key={m.id}
                  className={`${styles.metodoBtn} ${metodo === m.id ? styles.metodoBtnAtivo : ''}`}
                  onClick={() => { setMetodo(m.id); setChave(''); setErro('') }}
                >
                  <span className={styles.metodoIcon}>{m.icon}</span>
                  <span className={styles.metodoLabel}>{m.label}</span>
                  <span className={styles.metodoSub}>{m.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Chave de destino */}
          {metodo !== 'carteira' && (
            <div className="input-group">
              <label>
                {metodo === 'pix' ? 'Chave PIX fictícia (CPF, e-mail ou celular)' : 'Dados bancários fictícios'}
              </label>
              <input
                className="input-field"
                placeholder={metodo === 'pix' ? 'Ex: 000.000.000-00' : 'Ex: Banco 999 Ag. 0001 CC 12345-6'}
                value={chave}
                onChange={e => { setChave(e.target.value); setErro('') }}
              />
            </div>
          )}

          {/* Valor */}
          <div className={styles.section}>
            <div className="input-group">
              <label>Valor do saque (R$)</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ex: 200"
                min="10"
                max={saldo}
                value={valor}
                onChange={e => { setValor(e.target.value); setErro('') }}
              />
            </div>

            {/* Atalhos percentuais */}
            <div className={styles.atalhos}>
              {[25, 50, 75, 100].map(pct => {
                const v = Math.floor(saldo * (pct / 100))
                return (
                  <button
                    key={pct}
                    className={`${styles.atalhoBtn} ${valor === String(v) ? styles.atalhoBtnAtivo : ''}`}
                    disabled={v < 10}
                    onClick={() => { setValor(String(v)); setErro('') }}
                  >
                    {pct}%
                    <span className={styles.atalhoVal}>R$ {v.toLocaleString('pt-BR')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preview */}
          {valorNum > 0 && valorNum <= saldo && (
            <div className={styles.preview}>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Saldo atual</span>
                <span className={styles.previewVal}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Valor do saque</span>
                <span className="text-danger">− R$ {valorNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.previewDivider} />
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>Saldo após saque</span>
                <span className={`${styles.previewDestaque} ${saldoApos < 50 ? 'text-warning' : 'text-lime'}`}>
                  R$ {saldoApos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {erro && <div className="alert alert-error">{erro}</div>}

          <button
            className={`btn btn-primary ${styles.btnContinuar}`}
            onClick={handleContinuar}
            disabled={saldo < 10}
          >
            Continuar →
          </button>
        </div>

        {/* Info lateral */}
        <div className={styles.infoCol}>
          <div className={`card ${styles.infoCard}`}>
            <h3 className={styles.infoTitle}>ℹ️ Como funciona</h3>
            <ul className={styles.infoList}>
              <li>Escolha o método fictício e informe a chave de destino.</li>
              <li>Confirme o valor na próxima tela.</li>
              <li>O saldo é debitado instantaneamente da carteira.</li>
              <li>A movimentação fica registrada no extrato.</li>
            </ul>
          </div>
          <div className={`card ${styles.infoCard}`}>
            <h3 className={styles.infoTitle}>⚠️ Aviso acadêmico</h3>
            <p className={styles.infoTxt}>
              Este sistema é uma simulação educacional. Nenhum valor real, PIX,
              TED ou transferência bancária é realizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
