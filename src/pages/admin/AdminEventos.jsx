import { useState } from 'react'
import { useEventos } from '../../hooks/useEventos'
import { createEvento, updateEvento, deleteEvento } from '../../services/api'
import Badge from '../../components/common/Badge'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import styles from './AdminEventos.module.css'

const ESPORTES = ['Futebol', 'Basquete', 'Tênis', 'Vôlei', 'Natação', 'Atletismo', 'Outro']

const VAZIO = {
  timeA: '', timeB: '', esporte: 'Futebol', data: '', hora: '',
  descricao: '', oddA: '', oddB: '', oddEmpate: '',
}

export default function AdminEventos() {
  const { eventos, loading, recarregar } = useEventos()
  const [modal, setModal]       = useState(false)  // 'criar' | 'editar' | false
  const [form, setForm]         = useState(VAZIO)
  const [editId, setEditId]     = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [sucesso, setSucesso]   = useState('')
  const [confirmId, setConfirmId] = useState(null)

  function abrirCriar() {
    setForm(VAZIO); setEditId(null); setErro(''); setModal('criar')
  }

  function abrirEditar(ev) {
    setForm({
      timeA: ev.timeA, timeB: ev.timeB, esporte: ev.esporte,
      data: ev.data, hora: ev.hora || '', descricao: ev.descricao || '',
      oddA: ev.oddA || '', oddB: ev.oddB || '', oddEmpate: ev.oddEmpate || '',
    })
    setEditId(ev.id); setErro(''); setModal('editar')
  }

  function fecharModal() { setModal(false); setEditId(null); setErro('') }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function validar() {
    if (!form.timeA.trim()) return 'Informe o time/atleta A.'
    if (!form.timeB.trim()) return 'Informe o time/atleta B.'
    if (!form.data)         return 'Informe a data do evento.'
    if (!form.oddA || isNaN(Number(form.oddA)) || Number(form.oddA) <= 1)
      return 'Odd do time A deve ser maior que 1.'
    if (!form.oddB || isNaN(Number(form.oddB)) || Number(form.oddB) <= 1)
      return 'Odd do time B deve ser maior que 1.'
    return ''
  }

  async function handleSalvar(e) {
    e.preventDefault()
    const erroVal = validar()
    if (erroVal) { setErro(erroVal); return }
    setSalvando(true); setErro('')
    try {
      const payload = {
        timeA: form.timeA.trim(),
        timeB: form.timeB.trim(),
        esporte: form.esporte,
        data: form.data,
        hora: form.hora || '00:00',
        descricao: form.descricao.trim(),
        oddA: Number(form.oddA),
        oddB: Number(form.oddB),
        oddEmpate: form.oddEmpate ? Number(form.oddEmpate) : null,
      }
      if (modal === 'criar') {
        await createEvento({ ...payload, status: 'aberto', resultado: '' })
        flash('✅ Evento cadastrado com sucesso!')
      } else {
        await updateEvento(editId, payload)
        flash('✅ Evento atualizado!')
      }
      fecharModal(); recarregar()
    } catch {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleExcluir(id) {
    try {
      await deleteEvento(id)
      setConfirmId(null)
      recarregar()
      flash('🗑️ Evento excluído.')
    } catch {
      flash('Erro ao excluir.', true)
    }
  }

  function flash(msg, isErro = false) {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3500)
  }

  if (loading) return <Loading texto="Carregando eventos..." />

  const abertos    = eventos.filter(e => e.status === 'aberto')
  const encerrados = eventos.filter(e => e.status === 'encerrado')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciar eventos</h1>
          <p className={styles.sub}>{abertos.length} abertos · {encerrados.length} encerrados</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar}>+ Novo evento</button>
      </div>

      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      {eventos.length === 0 ? (
        <EmptyState icone="🏟️" titulo="Nenhum evento cadastrado" subtitulo='Clique em "Novo evento" para começar.' />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Evento</th>
                <th>Esporte</th>
                <th>Data</th>
                <th>Odds</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map(ev => (
                <tr key={ev.id}>
                  <td className={styles.idCol}>{ev.id}</td>
                  <td>
                    <p className={styles.eventoNome}>{ev.timeA} vs {ev.timeB}</p>
                    {ev.descricao && <p className={styles.eventoDesc}>{ev.descricao}</p>}
                  </td>
                  <td><span className={styles.esporte}>{ev.esporte}</span></td>
                  <td className={styles.dataCol}>
                    {new Date(ev.data+'T00:00:00').toLocaleDateString('pt-BR')}
                    {ev.hora && <span className={styles.hora}> {ev.hora}</span>}
                  </td>
                  <td>
                    <div className={styles.oddsCell}>
                      <span className={styles.oddPill}>{ev.timeA.split(' ')[0]} {ev.oddA?.toFixed(2)}</span>
                      {ev.oddEmpate && <span className={styles.oddPill}>Emp. {ev.oddEmpate?.toFixed(2)}</span>}
                      <span className={styles.oddPill}>{ev.timeB.split(' ')[0]} {ev.oddB?.toFixed(2)}</span>
                    </div>
                  </td>
                  <td><Badge status={ev.status} /></td>
                  <td>
                    <div className={styles.acoes}>
                      {ev.status === 'aberto' && (
                        <button className={`btn btn-ghost ${styles.btnAcao}`} onClick={() => abrirEditar(ev)}>Editar</button>
                      )}
                      {confirmId === ev.id ? (
                        <div className={styles.confirmRow}>
                          <span className={styles.confirmTxt}>Excluir?</span>
                          <button className={`btn btn-danger ${styles.btnAcao}`} onClick={() => handleExcluir(ev.id)}>Sim</button>
                          <button className={`btn btn-ghost ${styles.btnAcao}`} onClick={() => setConfirmId(null)}>Não</button>
                        </div>
                      ) : (
                        <button className={`btn btn-ghost ${styles.btnAcao} ${styles.btnDel}`} onClick={() => setConfirmId(ev.id)}>Excluir</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal === 'criar' ? 'Novo evento' : 'Editar evento'}</h2>
              <button className={styles.closeBtn} onClick={fecharModal}>✕</button>
            </div>

            <form onSubmit={handleSalvar} className={styles.form}>
              <div className={styles.row}>
                <div className="input-group">
                  <label>Time / Atleta A *</label>
                  <input name="timeA" className="input-field" placeholder="Ex: Brasil" value={form.timeA} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Time / Atleta B *</label>
                  <input name="timeB" className="input-field" placeholder="Ex: Argentina" value={form.timeB} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.row}>
                <div className="input-group">
                  <label>Esporte</label>
                  <select name="esporte" className="input-field" value={form.esporte} onChange={handleChange}>
                    {ESPORTES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Data *</label>
                  <input name="data" type="date" className="input-field" value={form.data} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Hora</label>
                  <input name="hora" type="time" className="input-field" value={form.hora} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label>Descrição</label>
                <input name="descricao" className="input-field" placeholder="Ex: Final do Brasileirão" value={form.descricao} onChange={handleChange} />
              </div>

              <div className={styles.oddsRow}>
                <div className="input-group">
                  <label>Odd — {form.timeA || 'Time A'} *</label>
                  <input name="oddA" type="number" step="0.01" min="1.01" className="input-field" placeholder="2.10" value={form.oddA} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Odd — Empate</label>
                  <input name="oddEmpate" type="number" step="0.01" min="1.01" className="input-field" placeholder="Opcional" value={form.oddEmpate} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Odd — {form.timeB || 'Time B'} *</label>
                  <input name="oddB" type="number" step="0.01" min="1.01" className="input-field" placeholder="3.50" value={form.oddB} onChange={handleChange} />
                </div>
              </div>

              {erro && <div className="alert alert-error">{erro}</div>}

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-ghost" onClick={fecharModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : modal === 'criar' ? 'Cadastrar evento' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
