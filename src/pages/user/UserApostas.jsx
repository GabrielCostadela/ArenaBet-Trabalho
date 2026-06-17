import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  getEventoById, getApostasByEvento,
  createAposta, updateUsuario, createMovimentacao,
} from '../../services/api'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import styles from './UserApostas.module.css'

export default function UserApostas() {
  const { eventoId } = useParams()
  const { usuario, atualizarUsuario } = useAuth()
  const navigate = useNavigate()

  const [evento,      setEvento]      = useState(null)
  const [apostasEvento, setApostasEvento] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [palpite,     setPalpite]     = useState('')
  const [valor,       setValor]       = useState('')
  const [salvando,    setSalvando]    = useState(false)
  const [erro,        setErro]        = useState('')
  const [sucesso,     setSucesso]     = useState('')
  const [jaApostou,   setJaApostou]   = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const [rE, rA] = await Promise.all([
          getEventoById(eventoId),
          getApostasByEvento(eventoId),
        ])
        setEvento(rE.data)
        setApostasEvento(rA.data)
        const apostaMinha = rA.data.find(a => a.usuarioId === usuario.id)
        if (apostaMinha) setJaApostou(true)
      } catch {
        setErro('Não foi possível carregar o evento.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [eventoId, usuario.id])

  const oddSelecionada = palpite === evento?.timeA ? evento?.oddA
    : palpite === evento?.timeB ? evento?.oddB
    : palpite === 'Empate'      ? evento?.oddEmpate
    : null

  const retornoPotencial = oddSelecionada && valor
    ? Math.round(Number(valor) * oddSelecionada)
    : 0

  const lucroP = retornoPotencial - Number(valor)

  function validar() {
    if (!palpite)                          return 'Selecione um palpite.'
    if (!valor || isNaN(Number(valor)))    return 'Informe um valor válido.'
    if (Number(valor) < 10)                return 'Valor mínimo de aposta: R$ 10.'
    if (Number(valor) > usuario.saldo)     return 'Saldo insuficiente.'
    return ''
  }

  async function handleApostar() {
    const erroVal = validar()
    if (erroVal) { setErro(erroVal); return }
    setSalvando(true); setErro('')

    try {
      const val = Number(valor)

      // 1. Registra a aposta
      await createAposta({
        usuarioId: usuario.id,
        eventoId: Number(eventoId),
        palpite,
        valor: val,
        status: 'pendente',
        retorno: 0,
        oddUsada: oddSelecionada,
        criadaEm: new Date().toISOString(),
      })

      // 2. Debita saldo fictício
      const novoSaldo = usuario.saldo - val
      const novoTotal = (usuario.totalApostas || 0) + 1
      await updateUsuario(usuario.id, { saldo: novoSaldo, totalApostas: novoTotal })
      atualizarUsuario({ saldo: novoSaldo, totalApostas: novoTotal })

      // 3. Registra movimentação
      await createMovimentacao({
        usuarioId: usuario.id,
        tipo: 'aposta',
        descricao: `Aposta: ${evento.timeA} x ${evento.timeB} — ${palpite}`,
        valor: -val,
        criadaEm: new Date().toISOString(),
      })

      setSucesso(`✅ Aposta de R$ ${val} em "${palpite}" registrada! Boa sorte!`)
      setJaApostou(true)
    } catch {
      setErro('Erro ao registrar aposta. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <Loading texto="Carregando evento..." />
  if (!evento) return <div className="alert alert-error">Evento não encontrado.</div>

  const opcoes = [
    { label: evento.timeA, odd: evento.oddA },
    ...(evento.oddEmpate ? [{ label: 'Empate', odd: evento.oddEmpate }] : []),
    { label: evento.timeB, odd: evento.oddB },
  ]

  const totalApostado = apostasEvento.reduce((s, a) => s + a.valor, 0)

  return (
    <div className={styles.page}>
      <button className={`btn btn-ghost ${styles.btnVoltar}`} onClick={() => navigate('/app/eventos')}>
        ← Voltar aos eventos
      </button>

      <div className={styles.layout}>
        {/* Card do evento */}
        <div className={styles.left}>
          <div className={`card ${styles.eventoCard}`}>
            <div className={styles.eventoTop}>
              <span className={styles.esporte}>{evento.esporte}</span>
              <Badge status={evento.status} />
            </div>

            <div className={styles.times}>
              <div className={styles.time}>
                <div className={styles.timeAvatar}>{evento.timeA[0]}</div>
                <span className={styles.timeNome}>{evento.timeA}</span>
              </div>
              <div className={styles.vsBox}>
                <span className={styles.vs}>VS</span>
                <span className={styles.hora}>{evento.hora}</span>
                <span className={styles.data}>
                  {new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className={`${styles.time} ${styles.timeRight}`}>
                <div className={styles.timeAvatar}>{evento.timeB[0]}</div>
                <span className={styles.timeNome}>{evento.timeB}</span>
              </div>
            </div>

            {evento.descricao && <p className={styles.descricao}>{evento.descricao}</p>}

            <div className={styles.statsEvento}>
              <div className={styles.statEv}>
                <span className={styles.statEvLabel}>Apostas realizadas</span>
                <span className={styles.statEvVal}>{apostasEvento.length}</span>
              </div>
              <div className={styles.statEv}>
                <span className={styles.statEvLabel}>Total apostado</span>
                <span className={styles.statEvVal}>R$ {totalApostado.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Saldo do usuário */}
          <div className={`card ${styles.saldoCard}`}>
            <span className={styles.saldoLabel}>Seu saldo fictício</span>
            <span className={styles.saldoVal}>
              R$ {(usuario.saldo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Formulário de aposta */}
        <div className={`card ${styles.formCard}`}>
          {evento.status !== 'aberto' ? (
            <div className={styles.encerradoMsg}>
              <span className={styles.encerradoIcon}>🔒</span>
              <p className={styles.encerradoTxt}>Este evento está encerrado. Apostas não são mais aceitas.</p>
            </div>
          ) : jaApostou && !sucesso ? (
            <div className={styles.encerradoMsg}>
              <span className={styles.encerradoIcon}>✅</span>
              <p className={styles.encerradoTxt}>Você já possui uma aposta neste evento.</p>
              <button className="btn btn-ghost" onClick={() => navigate('/app/historico')}>Ver histórico</button>
            </div>
          ) : sucesso ? (
            <div className={styles.sucessoWrap}>
              <span className={styles.sucessoIcon}>🎉</span>
              <p className={styles.sucessoTxt}>{sucesso}</p>
              <div className={styles.sucessoBtns}>
                <button className="btn btn-primary" onClick={() => navigate('/app/historico')}>Ver histórico</button>
                <button className="btn btn-ghost" onClick={() => navigate('/app/eventos')}>Mais eventos</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className={styles.formTitle}>Fazer aposta</h2>

              {/* Seleção de palpite */}
              <div className={styles.formSection}>
                <p className={styles.formLabel}>Escolha seu palpite</p>
                <div className={styles.opcoes}>
                  {opcoes.map(op => (
                    <button
                      key={op.label}
                      className={`${styles.opcao} ${palpite === op.label ? styles.opcaoAtiva : ''}`}
                      onClick={() => { setPalpite(op.label); setErro('') }}
                    >
                      <span className={styles.opcaoNome}>{op.label}</span>
                      <span className={styles.opcaoOdd}>{op.odd?.toFixed(2)}</span>
                      <span className={styles.opcaoOddLabel}>odd</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div className={styles.formSection}>
                <div className="input-group">
                  <label>Valor da aposta (R$)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Ex: 100"
                    min="10"
                    max={usuario.saldo}
                    value={valor}
                    onChange={e => { setValor(e.target.value); setErro('') }}
                  />
                </div>
                <div className={styles.atalhos}>
                  {[50, 100, 200, 500].map(v => (
                    <button
                      key={v}
                      className={styles.atalhoBtn}
                      disabled={v > usuario.saldo}
                      onClick={() => setValor(String(v))}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview de retorno */}
              {palpite && valor && Number(valor) >= 10 && (
                <div className={styles.preview}>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Apostando em</span>
                    <span className={styles.previewVal}>{palpite}</span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Odd</span>
                    <span className={styles.previewVal}>{oddSelecionada?.toFixed(2)}</span>
                  </div>
                  <div className={styles.previewDivider} />
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Retorno potencial</span>
                    <span className={`${styles.previewVal} ${styles.previewDestaque}`}>
                      R$ {retornoPotencial.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className={styles.previewRow}>
                    <span className={styles.previewLabel}>Lucro potencial</span>
                    <span className={`${styles.previewVal} ${lucroP >= 0 ? 'text-success' : 'text-danger'}`}>
                      {lucroP >= 0 ? '+' : ''}R$ {lucroP.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {erro && <div className="alert alert-error">{erro}</div>}

              <button
                className={`btn btn-primary ${styles.btnApostar}`}
                onClick={handleApostar}
                disabled={salvando}
              >
                {salvando ? 'Registrando...' : '🎯 Confirmar aposta'}
              </button>

              <p className={styles.aviso}>
                ⚠️ Aposta fictícia. Nenhum dinheiro real é envolvido.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
