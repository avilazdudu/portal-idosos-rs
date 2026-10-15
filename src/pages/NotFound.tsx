import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center gap-4 py-24 text-center">
      <Compass className="h-14 w-14 text-pampa-400" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-ink">Página não encontrada</h1>
      <p className="max-w-prose2 text-lg text-ink-soft">O endereço que você tentou acessar não existe ou foi movido.</p>
      <Link to="/" className="rounded-lg bg-pampa-600 px-6 py-3 text-lg font-semibold text-white hover:bg-pampa-700">
        Voltar para o início
      </Link>
    </div>
  )
}
