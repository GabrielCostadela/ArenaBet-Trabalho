import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getUsuarios, createUsuario, createMovimentacao } from '../../services/api'
import Logo from '../../components/common/Logo'
import styles from './CadastroPage.module.css'

export default function CadastroPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErro('')
  }

  function validar() {
    if (!form.nome.trim())      return 'Informe seu nome completo.'
    if (form.nome.trim().length < 3) return 'Nome muito curto.'
    if (!form.email.trim())     return 'Informe seu e-mail.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'E-mail inválido.'
    if (!form.senha)            return 'Crie uma senha.'
    if (form.senha.length < 4)  return 'A senha deve ter pelo menos 4 caracteres.'
    if (form.senha !== form.confirmar) return 'As senhas não coincidem.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const erroVal = validar()
    if (erroVal) { setErro(erroVal); return }
    setLoading(true)
    setErro('')

    try {
      // Verificar e-mail duplicado
      const todos = await getUsuarios()
      const jaExiste = todos.data.find(u => u.email.toLowerCase() === form.email.trim().toLowerCase())
      if (jaExiste) { setErro('Este e-mail já está cadastrado.'); setLoading(false); return }

      // Criar usuário
      const novoUsuario = await createUsuario({
        nome:          form.nome.trim(),
        email:         form.email.trim().toLowerCase(),
        senha:         form.senha,
        perfil:        'usuario',
        saldo:         500,           // bônus de boas-vindas fictício
        avatar:        form.nome.trim()[0].toUpperCase(),
        pontos:        0,
        totalApostas:  0,
        apostasGanhas: 0,
      })

      // Registrar bônus de boas-vindas no extrato
      await createMovimentacao({
        usuarioId: novoUsuario.data.id,
        tipo:      'bonus_boas_vindas',
        descricao: 'Bônus de boas-vindas',
        valor:     500,
        criadaEm:  new Date().toISOString(),
      })

      // Logar automaticamente
      await login(form.email.trim().toLowerCase(), form.senha)
      navigate('/app/dashboard', { replace: true })
    } catch {
      setErro('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero} aria-hidden>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Crie sua conta grátis</p>
          <h1 className={styles.heroTitle}>
            Entre no jogo<br />
            <span className={styles.heroAccent}>ganhe fichas.</span>
          </h1>
          <p className={styles.heroSub}>
            Ao se cadastrar você recebe <strong className={styles.destaque}>R$ 500 fictícios</strong> de
            bônus de boas-vindas para começar a apostar agora.
          </p>
          <div className={styles.beneficios}>
            {[
              { icon: '🎁', txt: 'R$ 500 de bônus ao criar conta' },
              { icon: '🏟️', txt: 'Acesso a todos os eventos' },
              { icon: '🏆', txt: 'Participe do ranking de jogadores' },
              { icon: '💳', txt: 'Extrato completo de movimentações' },
            ].map(b => (
              <div key={b.txt} className={styles.beneficioItem}>
                <span>{b.icon}</span>
                <span>{b.txt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroGlow} />
      </div>

      {/* Formulário */}
      <div className={styles.panel}>
        <div className={styles.formWrap}>
          <Logo size="lg" to="/login" />

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Criar conta</h2>
            <p className={styles.formSub}>Leva menos de 1 minuto. É gratuito!</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className="input-group">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                name="nome"
                type="text"
                className={`input-field ${erro && !form.nome ? 'error' : ''}`}
                placeholder="Seu nome"
                value={form.nome}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                className={`input-field ${erro && !form.email ? 'error' : ''}`}
                placeholder="seu@email.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                className={`input-field ${erro && !form.senha ? 'error' : ''}`}
                placeholder="Mínimo 4 caracteres"
                value={form.senha}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <label htmlFor="confirmar">Confirmar senha</label>
              <input
                id="confirmar"
                name="confirmar"
                type="password"
                className={`input-field ${erro && form.senha !== form.confirmar ? 'error' : ''}`}
                placeholder="Repita a senha"
                value={form.confirmar}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            {erro && <p className="alert alert-error">{erro}</p>}

            <div className={styles.bonus}>
              🎁 Você receberá <strong>R$ 500 fictícios</strong> de bônus ao criar a conta!
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta gratuitamente'}
            </button>
          </form>

          <div className={styles.separator}>
            <span>já tem uma conta?</span>
          </div>

          <Link to="/login" className={`btn btn-ghost w-full`}>
            Entrar na plataforma
          </Link>

          <p className={styles.disclaimer}>
            🎓 Projeto acadêmico — todos os saldos e apostas são fictícios.
          </p>
        </div>
      </div>
    </div>
  )
}
