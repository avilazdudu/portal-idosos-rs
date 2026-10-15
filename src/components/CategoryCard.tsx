import { Link } from 'react-router-dom'
import { Categoria } from '@/types'
import { IconePor } from '@/utils/iconMap'

export default function CategoryCard({ categoria }: { categoria: Categoria }) {
  return (
    <Link
      to={`/programas?categoria=${categoria.slug}`}
      className="card-surface group flex flex-col items-start gap-3 p-5 transition-colors hover:border-pampa-400"
    >
      <span className="rounded-xl bg-pampa-50 p-3 text-pampa-700 group-hover:bg-pampa-100">
        <IconePor nome={categoria.icone} className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="text-lg font-bold text-ink">{categoria.nome}</span>
      <span className="text-base text-ink-soft">{categoria.descricao}</span>
    </Link>
  )
}
