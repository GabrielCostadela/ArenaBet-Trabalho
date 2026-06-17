import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/common/Logo'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setErro('')
    setLoading(true)
    try {
      const usuario = await login(email.trim(), senha)
      navigate(usuario.perfil === 'admin' ? '/admin/dashboard' : '/app/dashboard', { replace: true })
    } catch (err) {
      setErro(err.message || 'Erro ao fazer login.')
    } finally {
      setLoading(false)
    }
  }

  function preencherDemo(perfil) {
    if (perfil === 'admin') { setEmail('admin@arenabet.com'); setSenha('123') }
    else                    { setEmail('gabriel@arenabet.com'); setSenha('123') }
    setErro('')
  }

  return (
    <div className={styles.page}>
      {/* Painel esquerdo — decorativo */}
      <div className={styles.hero} aria-hidden>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Plataforma acadêmica</p>
          <h1 className={styles.heroTitle}>
            Aposte no<br />
            <span className={styles.heroAccent}>seu palpite.</span>
          </h1>
          <p className={styles.heroSub}>
            Simulação 100% fictícia para fins educacionais.
            Nenhum dinheiro real é envolvido.
          </p>
          <div className={styles.heroBadges}>
            {['⚽ Futebol','🏀 Basquete','🎾 Tênis','🏆 Ranking'].map(b => (
              <span key={b} className={styles.heroBadge}>{b}</span>
            ))}
          </div>
        </div>
        <div className={styles.heroGlow} />
      </div>

      {/* Painel direito — formulário */}
      <div className={styles.panel}>
        <div className={styles.formWrap}>
          <Logo size="lg" to="/login" />

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Entrar na plataforma</h2>
            <p className={styles.formSub}>Use uma conta de teste abaixo para explorar.</p>
          </div>

          {/* Atalhos demo */}
          <div className={styles.demoRow}>
            <button type="button" className={`btn btn-ghost ${styles.demoBtn}`}
              onClick={() => preencherDemo('admin')}>
              👑 Entrar como Admin
            </button>
            <button type="button" className={`btn btn-ghost ${styles.demoBtn}`}
              onClick={() => preencherDemo('usuario')}>
              🎮 Entrar como Jogador
            </button>
          </div>

          <div className={styles.separator}>
            <span>ou entre com suas credenciais</span>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className={`input-field ${erro ? 'error' : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                className={`input-field ${erro ? 'error' : ''}`}
                placeholder="••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {erro && <p className={`alert alert-error ${styles.erroMsg}`}>{erro}</p>}

            <button
              type="submit"
              className={`btn btn-primary w-full ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className={styles.disclaimer}>
            🎓 Projeto acadêmico — todos os saldos e apostas são fictícios.
          </p>
        </div>
      </div>
    </div>
  )
}
