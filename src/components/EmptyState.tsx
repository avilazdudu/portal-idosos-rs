import { ReactNode } from 'react'
import { Search } from 'lucide-react'

export default function EmptyState({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
      <Search className="h-10 w-10 text-pampa-400" aria-hidden="true" />
      <p className="text-xl font-bold text-ink">{titulo}</p>
      <p className="max-w-prose2 text-lg text-ink-soft">{descricao}</p>
      {acao}
    </div>
  )
}
