import type { CategoriaSlug } from '@/types'
import { categoriaPorSlug } from '@/data/categories'
import { visualCategoria } from '@/utils/categoriaVisual'

// Categoria com símbolo + nome por extenso: a cor sozinha nunca é a única pista.
export default function CategoriaChip({ slug }: { slug: CategoriaSlug }) {
  const visual = visualCategoria[slug]
  const nome = categoriaPorSlug(slug)?.nome ?? slug
  return (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 bg-white px-3 py-1 text-sm font-semibold text-ink"
      style={{ borderColor: visual.cor }}
    >
      <span aria-hidden="true">{visual.emoji}</span>
      {nome}
    </span>
  )
}
