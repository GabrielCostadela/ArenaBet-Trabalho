import { useState, useEffect, useCallback } from 'react'
import { getEventos } from '../services/api'

export function useEventos() {
  const [eventos, setEventos]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [erro, setErro]         = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const res = await getEventos()
      setEventos(res.data)
    } catch {
      setErro('Não foi possível carregar os eventos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  return { eventos, loading, erro, recarregar: carregar }
}
