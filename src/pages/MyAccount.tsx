import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Heart, SlidersHorizontal, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function MyAccount() {
  const { usuario, atualizarPerfil, logout } = useAuth()
  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [municipio, setMunicipio] = useState(usuario?.municipio ?? '')
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  if (!usuario) return null

  async function salvar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    setSalvo(false)
    try {
      await atualizarPerfil({ ...usuario!, nome, municipio })
      setSalvo(true)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="container-page max-w-2xl py-10">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pampa-100 text-pampa-700">
          <UserRound className="h-9 w-9" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-bold text-ink">Minha conta</h1>
          <p className="text-lg text-ink-soft">{usuario.email}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link to="/favoritos" className="card-surface flex items-center gap-3 p-5 hover:border-pampa-400">
          <Heart className="h-6 w-6 text-chimarrao-400" aria-hidden="true" />
          <span className="text-lg font-semibold text-ink">Meus favoritos</span>
        </Link>
        <Link to="/preferencias" className="card-surface flex items-center gap-3 p-5 hover:border-pampa-400">
          <SlidersHorizontal className="h-6 w-6 text-pampa-600" aria-hidden="true" />
          <span className="text-lg font-semibold text-ink">Alterar preferências</span>
        </Link>
      </div>

      <form onSubmit={salvar} className="card-surface mt-8 flex flex-col gap-4 p-6">
        <h2 className="text-xl font-bold text-ink">Editar perfil</h2>

        {salvo && <p className="rounded-lg bg-pampa-50 p-3 text-base font-medium text-pampa-700">Perfil atualizado.</p>}

        <div>
          <label htmlFor="nome" className="mb-1 block text-lg font-semibold text-ink">
            Nome
          </label>
          <input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="municipio" className="mb-1 block text-lg font-semibold text-ink">
            Município
          </label>
          <input
            id="municipio"
            value={municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            className="w-full rounded-lg border-2 border-pampa-100 px-4 py-3 text-lg focus:border-pampa-400 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="mt-2 w-fit rounded-lg bg-pampa-600 px-5 py-3 text-lg font-bold text-white hover:bg-pampa-700 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>

      <button
        onClick={() => logout()}
        className="mt-6 flex items-center gap-2 rounded-lg border-2 border-pampa-100 px-5 py-3 text-lg font-semibold text-ink-soft hover:bg-cream-deep"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
        Sair da conta
      </button>
    </div>
  )
}
