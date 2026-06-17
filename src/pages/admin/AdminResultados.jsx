import { useState, useEffect } from 'react'
import { useEventos } from '../../hooks/useEventos'
import {
  getApostasByEvento, updateAposta,
  updateEvento, updateUsuario, getUsuarioById,
  createMovimentacao,
} from '../../services/api'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './AdminResultados.module.css'

export default function AdminResultados() {
  const { eventos, loading, recarregar } = useEventos()
  const [eventoSel, setEventoSel]   = useState(null)
  const [apostas,   setApostas]     = useState([])
  const [resultado, setResultado]   = useState('')
  const [processando, setProcessando] = useState(false)
  const [log, setLog]               = useState([])
  const [sucesso, setSucesso]       = useState('')
  const [erro, setErro]             = useState('')

  const abertos = eventos.filter(e => e.status === 'aberto')

  async function selecionarEvento(ev) {
    setEventoSel(ev)
    setResultado('')
    setLog([])
    setErro('')
    setSucesso('')
    const res = await getApostasByEvento(ev.id)
    setApostas(res.data)
  }

  const opcoesResultado = eventoSel
    ? eventoSel.oddEmpate
      ? [eventoSel.timeA, 'Empate', eventoSel.timeB]
      : [eventoSel.timeA, eventoSel.timeB]
    : []

  async function processarResultado() {
    if (!resultado) { setErro('Selecione o resultado antes de confirmar.'); return }
    setProcessando(true)
    setErro('')
    const novoLog = []

    try {
      // 1. Encerrar o evento
      await updateEvento(eventoSel.id, { status: 'encerrado', resultado })
      novoLog.push(`✅ Evento encerrado com resultado: ${resultado}`)

      // 2. Processar cada aposta
      for (const aposta of apostas) {
        const ganhou = aposta.palpite === resultado
        const retorno = ganhou ? Math.round(aposta.valor * aposta.oddUsada) : 0
        const novoStatus = ganhou ? 'ganhou' : 'perdeu'

        await updateAposta(aposta.id, { status: novoStatus, retorno })

        // 3. Atualizar saldo do usuário
        const resUser = await getUsuarioById(aposta.usuarioId)
        const usuario = resUser.data

        if (ganhou) {
          const novoSaldo  = (usuario.saldo || 0) + retorno
          const novosPontos = (usuario.pontos || 0) + Math.round(retorno / 10)
          const novasGanhas = (usuario.apostasGanhas || 0) + 1
          await updateUsuario(aposta.usuarioId, {
            saldo: novoSaldo,
            pontos: novosPontos,
            apostasGanhas: novasGanhas,
          })
          await createMovimentacao({
            usuarioId: aposta.usuarioId,
            tipo: 'ganho',
            descricao: `Ganho: ${eventoSel.timeA} x ${eventoSel.timeB}`,
            valor: retorno,
            criadaEm: new Date().toISOString(),
          })
          novoLog.push(`🏆 ${usuario.nome} ganhou R$ ${retorno} (palpite: ${aposta.palpite})`)
        } else {
          await createMovimentacao({
            usuarioId: aposta.usuarioId,
            tipo: 'perda',
            descricao: `Perda: ${eventoSel.timeA} x ${eventoSel.timeB}`,
            valor: -aposta.valor,
            criadaEm: new Date().toISOString(),
          })
          novoLog.push(`❌ ${usuario.nome} perdeu R$ ${aposta.valor} (palpite: ${aposta.palpite})`)
        }
      }

      if (apostas.length === 0) novoLog.push('ℹ️ Nenhuma aposta registrada para este evento.')

      setLog(novoLog)
      setSucesso('Resultado processado com sucesso! Apostas e saldos atualizados.')
      recarregar()
      setEventoSel(null)
      setApostas([])
    } catch (e) {
      console.error(e)
      setErro('Erro ao processar resultado. Tente novamente.')
    } finally {
      setProcessando(false)
    }
  }

  if (loading) return <Loading texto="Carregando eventos..." />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Registrar resultado</h1>
          <p className={styles.sub}>Encerre um evento e atualize as apostas automaticamente.</p>
        </div>
      </div>

      {sucesso && (
        <div className="alert alert-success">{sucesso}</div>
      )}
      {erro && <div className="alert alert-error">{erro}</div>}

      {/* Log de processamento */}
      {log.length > 0 && (
        <div className={`card ${styles.logCard}`}>
          <h3 className={styles.logTitle}>📋 Relatório de processamento</h3>
          <ul className={styles.logList}>
            {log.map((linha, i) => <li key={i} className={styles.logItem}>{linha}</li>)}
          </ul>
        </div>
      )}

      <div className={styles.columns}>
        {/* Lista de eventos abertos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Eventos abertos ({abertos.length})</h2>

          {abertos.length === 0 ? (
            <EmptyState icone="✅" titulo="Nenhum evento aberto" subtitulo="Todos os eventos já foram encerrados." />
          ) : (
            <div className={styles.eventosList}>
              {abertos.map(ev => (
                <div
                  key={ev.id}
                  className={`card card-hover ${styles.eventoItem} ${eventoSel?.id === ev.id ? styles.eventoAtivo : ''}`}
                  onClick={() => selecionarEvento(ev)}
                >
                  <div className={styles.eventoTop}>
                    <span className={styles.esporte}>{ev.esporte}</span>
                    <Badge status={ev.status} />
                  </div>
                  <p className={styles.eventoNome}>{ev.timeA} <span>vs</span> {ev.timeB}</p>
                  <p className={styles.eventoData}>
                    {new Date(ev.data+'T00:00:00').toLocaleDateString('pt-BR')} {ev.hora && `· ${ev.hora}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Painel de encerramento */}
        <section className={styles.section}>
          {!eventoSel ? (
            <div className={`card ${styles.placeholderCard}`}>
              <span className={styles.placeholderIcon}>👈</span>
              <p className={styles.placeholderTxt}>Selecione um evento ao lado para registrar o resultado.</p>
            </div>
          ) : (
            <div className={`card ${styles.painelCard}`}>
              <div className={styles.painelHeader}>
                <div>
                  <p className={styles.painelEsporte}>{eventoSel.esporte}</p>
                  <h3 className={styles.painelTimes}>{eventoSel.timeA} vs {eventoSel.timeB}</h3>
                </div>
                <button className={`btn btn-ghost ${styles.btnDesselecionar}`} onClick={() => { setEventoSel(null); setApostas([]) }}>✕</button>
              </div>

              {/* Apostas do evento */}
              <div className={styles.apostasSec}>
                <p className={styles.apostasTitle}>{apostas.length} aposta{apostas.length !== 1 ? 's' : ''} neste evento</p>
                {apostas.length > 0 && (
                  <div className={styles.apostasMini}>
                    {apostas.map(ap => (
                      <div key={ap.id} className={styles.apostaMini}>
                        <span className={styles.apostaMiniPalpite}>{ap.palpite}</span>
                        <span className={styles.apostaMiniValor}>R$ {ap.valor}</span>
                        <span className={styles.apostaMiniOdd}>odd {ap.oddUsada}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.divider} />

              {/* Seleção do resultado */}
              <div className={styles.resultadoSec}>
                <p className={styles.resultadoLabel}>Qual foi o resultado?</p>
                <div className={styles.resultadoOpcoes}>
                  {opcoesResultado.map(op => (
                    <button
                      key={op}
                      className={`${styles.opcaoBotao} ${resultado === op ? styles.opcaoAtiva : ''}`}
                      onClick={() => { setResultado(op); setErro('') }}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {resultado && (
                <div className={styles.preview}>
                  <p className={styles.previewTxt}>
                    Serão pagas as apostas em <strong>{resultado}</strong>.
                    {apostas.filter(a => a.palpite === resultado).length > 0
                      ? ` ${apostas.filter(a => a.palpite === resultado).length} jogador(es) ganharão.`
                      : ' Nenhum jogador apostou neste resultado.'}
                  </p>
                </div>
              )}

              <button
                className={`btn btn-primary ${styles.btnConfirmar}`}
                onClick={processarResultado}
                disabled={!resultado || processando}
              >
                {processando ? 'Processando...' : '🏁 Confirmar e encerrar evento'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
