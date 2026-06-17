import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// ── Usuários ──────────────────────────────────────────────
export const getUsuarios = () => api.get('/usuarios')
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`)
export const createUsuario = (data) => api.post('/usuarios', data)
export const updateUsuario = (id, data) => api.patch(`/usuarios/${id}`, data)

export const loginUsuario = async (email, senha) => {
  const res = await api.get(`/usuarios?email=${email}&senha=${senha}`)
  return res.data[0] || null
}

// ── Eventos ───────────────────────────────────────────────
export const getEventos = () => api.get('/eventos')
export const getEventoById = (id) => api.get(`/eventos/${id}`)
export const getEventosAbertos = () => api.get('/eventos?status=aberto')
export const createEvento = (data) => api.post('/eventos', data)
export const updateEvento = (id, data) => api.patch(`/eventos/${id}`, data)
export const deleteEvento = (id) => api.delete(`/eventos/${id}`)

// ── Apostas ───────────────────────────────────────────────
export const getApostas = () => api.get('/apostas')
export const getApostaById = (id) => api.get(`/apostas/${id}`)
export const getApostasByUsuario = (usuarioId) => api.get(`/apostas?usuarioId=${usuarioId}`)
export const getApostasByEvento = (eventoId) => api.get(`/apostas?eventoId=${eventoId}`)
export const createAposta = (data) => api.post('/apostas', data)
export const updateAposta = (id, data) => api.patch(`/apostas/${id}`, data)

// ── Movimentações ─────────────────────────────────────────
export const getMovimentacoes = () => api.get('/movimentacoes')
export const getMovimentacoesByUsuario = (usuarioId) =>
  api.get(`/movimentacoes?usuarioId=${usuarioId}`)
export const createMovimentacao = (data) => api.post('/movimentacoes', data)

// ── Bônus ─────────────────────────────────────────────────
export const getBonus = () => api.get('/bonus')

export default api
