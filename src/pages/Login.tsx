import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await login({ email, senha })
      const destino = (location.state as { de?: string } | null)?.de ?? '/'
      navigate(destino, { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-ink">Entrar</h1>
        <p className="mt-2 text-lg text-ink-soft">Acesse sua conta para ver favoritos e recomendações.</p>

        <form onSubmit={aoEnviar} className="card-surface mt-6 flex flex-col gap-4 p-6">
          {erro && <p className="rounded-lg bg-[#FBEAE7] p-3 text-base font-medium text-alerta-desatualizado">{erro}</p>}

          <div>
            <label htmlFor="email" className="mb-1 block text-lg font-semibold text-ink">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1 block text-lg font-semibold text-ink">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-lg bg-pampa-600 px-5 py-4 text-xl font-bold text-white hover:bg-pampa-700 disabled:opacity-60"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-lg text-ink-soft">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-pampa-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
