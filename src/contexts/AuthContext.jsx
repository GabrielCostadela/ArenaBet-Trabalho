import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUsuario, getUsuarioById } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Recupera sessão do localStorage ao carregar
  useEffect(() => {
    const salvo = localStorage.getItem('arenabet_usuario')
    if (salvo) {
      try {
        const parsed = JSON.parse(salvo)
        // Revalida com a API para garantir dados frescos
        getUsuarioById(parsed.id)
          .then((res) => {
            setUsuario(res.data)
          })
          .catch(() => {
            localStorage.removeItem('arenabet_usuario')
          })
          .finally(() => setCarregando(false))
      } catch {
        localStorage.removeItem('arenabet_usuario')
        setCarregando(false)
      }
    } else {
      setCarregando(false)
    }
  }, [])

  const login = useCallback(async (email, senha) => {
    const encontrado = await loginUsuario(email, senha)
    if (!encontrado) throw new Error('E-mail ou senha incorretos.')
    setUsuario(encontrado)
    localStorage.setItem('arenabet_usuario', JSON.stringify(encontrado))
    return encontrado
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)
    localStorage.removeItem('arenabet_usuario')
  }, [])

  // Atualiza o usuário na memória e no localStorage após mudança de saldo etc.
  const atualizarUsuario = useCallback((dados) => {
    setUsuario((prev) => {
      const novo = { ...prev, ...dados }
      localStorage.setItem('arenabet_usuario', JSON.stringify(novo))
      return novo
    })
  }, [])

  const isAdmin = usuario?.perfil === 'admin'
  const isLogado = !!usuario

  return (
    <AuthContext.Provider
      value={{ usuario, isAdmin, isLogado, carregando, login, logout, atualizarUsuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
