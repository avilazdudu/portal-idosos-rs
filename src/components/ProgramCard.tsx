import { Link } from 'react-router-dom'
import { MapPin, Building2, ArrowRight } from 'lucide-react'
import { Programa } from '@/types'
import { IconePor } from '@/utils/iconMap'
import { categoriaPorSlug } from '@/data/categories'
import { rotuloModalidade, rotuloFaixaEtaria } from '@/utils/format'
import FavoriteButton from '@/components/FavoriteButton'
import StatusBadge from '@/components/StatusBadge'
import { calcularStatusVerificacao } from '@/utils/verification'
import { obterInfoSituacao } from '@/utils/situacao'
import SituacaoBadge from '@/components/SituacaoBadge'

export default function ProgramCard({ programa }: { programa: Programa }) {
  const categoria = categoriaPorSlug(programa.categoria)
  const verificacao = calcularStatusVerificacao(programa)
  const situacao = obterInfoSituacao(programa)

  return (
    <article className="card-surface flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-pampa-50 p-3 text-pampa-700">
            <IconePor nome={categoria?.icone ?? 'Activity'} className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight text-ink">{programa.nome}</p>
            <p className="flex items-center gap-1 text-base text-ink-soft">
              <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {programa.instituicao}
            </p>
          </div>
        </div>
        <FavoriteButton programaId={programa.id} />
      </div>

      <p className="text-lg text-ink-soft">{programa.descricao}</p>

      <div className="flex flex-wrap items-center gap-2 text-base text-ink-soft">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {programa.municipio}
        </span>
        <span className="rounded-full bg-cream-deep px-3 py-1 font-medium">{rotuloModalidade[programa.modalidade]}</span>
        <span className="rounded-full bg-cream-deep px-3 py-1 font-medium">{rotuloFaixaEtaria[programa.faixaEtaria]}</span>
      </div>

      {programa.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {programa.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-pampa-100 px-3 py-1 text-sm text-pampa-700">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <SituacaoBadge info={situacao} />
        <StatusBadge status={verificacao.status} motivo={verificacao.motivo} />
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-2">
        <Link
          to={`/programas/${programa.slug}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-pampa-600 px-4 py-3 text-lg font-semibold text-pampa-700 hover:bg-pampa-50"
        >
          Ver detalhes
        </Link>
        {!situacao.inscricaoDisponivel ? (
          <span className="flex flex-1 items-center justify-center rounded-lg bg-cream-deep px-4 py-3 text-center text-base font-medium text-ink-soft">
            {situacao.rotulo}
          </span>
        ) : programa.registrationUrl ? (
          <a
            href={programa.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-pampa-600 px-4 py-3 text-lg font-semibold text-white hover:bg-pampa-700"
          >
            Inscrever-se
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
        ) : (
          <span className="flex flex-1 items-center justify-center rounded-lg bg-cream-deep px-4 py-3 text-center text-base font-medium text-ink-soft">
            Informações de inscrição não disponíveis
          </span>
        )}
      </div>
    </article>
  )
}
