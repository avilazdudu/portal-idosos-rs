import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [faixaEtaria, setFaixaEtaria] = useState<'60+' | '65+' | '70+' | 'todas'>('60+')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await cadastrar({ nome, email, senha, municipio, faixaEtaria })
      navigate('/preferencias', { replace: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar sua conta.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="container-page flex justify-center py-14">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-ink">Criar conta</h1>
        <p className="mt-2 text-lg text-ink-soft">Leva menos de um minuto. Depois, você escolhe seus interesses.</p>

        <form onSubmit={aoEnviar} className="card-surface mt-6 flex flex-col gap-4 p-6">
          {erro && <p className="rounded-lg bg-[#FBEAE7] p-3 text-base font-medium text-alerta-desatualizado">{erro}</p>}

          <div>
            <label htmlFor="nome" className="mb-1 block text-lg font-semibold text-ink">
              Nome
            </label>
            <input
              id="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            />
          </div>

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
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="municipio" className="mb-1 block text-lg font-semibold text-ink">
              Município
            </label>
            <input
              id="municipio"
              required
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              placeholder="Ex: Porto Alegre"
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="faixa" className="mb-1 block text-lg font-semibold text-ink">
              Faixa etária
            </label>
            <select
              id="faixa"
              value={faixaEtaria}
              onChange={(e) => setFaixaEtaria(e.target.value as typeof faixaEtaria)}
              className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
            >
              <option value="60+">60 anos ou mais</option>
              <option value="65+">65 anos ou mais</option>
              <option value="70+">70 anos ou mais</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 rounded-lg bg-pampa-600 px-5 py-4 text-xl font-bold text-white hover:bg-pampa-700 disabled:opacity-60"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-lg text-ink-soft">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-pampa-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
