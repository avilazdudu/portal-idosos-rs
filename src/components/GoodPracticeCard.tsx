import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { BoaPratica } from '@/types'

const rotuloCategoria: Record<BoaPratica['categoria'], string> = {
  saude: 'Saúde',
  'atividade-fisica': 'Atividade física',
  alimentacao: 'Alimentação',
  'saude-mental': 'Saúde mental e socialização',
  'seguranca-digital': 'Segurança digital',
  autonomia: 'Autonomia',
}

export default function GoodPracticeCard({ pratica }: { pratica: BoaPratica }) {
  return (
    <Link to={`/boas-praticas/${pratica.slug}`} className="card-surface group flex flex-col gap-3 p-5 hover:border-pampa-400">
      <span className="w-fit rounded-full bg-pampa-50 px-3 py-1 text-sm font-semibold text-pampa-700">
        {rotuloCategoria[pratica.categoria]}
      </span>
      <p className="text-xl font-bold leading-tight text-ink">{pratica.titulo}</p>
      <p className="text-lg text-ink-soft">{pratica.resumo}</p>
      <span className="mt-auto flex items-center gap-1 text-lg font-semibold text-pampa-700 group-hover:gap-2">
        Ler conteúdo
        <ArrowRight className="h-5 w-5 transition-all" aria-hidden="true" />
      </span>
    </Link>
  )
}
