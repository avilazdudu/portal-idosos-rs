import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ListChecks, Lightbulb, AlertTriangle, BookMarked } from 'lucide-react'
import { BoaPratica } from '@/types'
import { goodPracticeService } from '@/services/goodPracticeService'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'

export default function GoodPracticeDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [pratica, setPratica] = useState<BoaPratica | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    goodPracticeService.buscarPorSlug(slug).then(setPratica)
  }, [slug])

  if (pratica === undefined) return <LoadingState texto="Carregando conteúdo..." />
  if (pratica === null) {
    return (
      <div className="container-page py-10">
        <EmptyState
          titulo="Conteúdo não encontrado"
          descricao="Esse conteúdo pode ter sido removido ou o endereço está incorreto."
          acao={
            <Link to="/boas-praticas" className="rounded-lg bg-pampa-600 px-5 py-3 text-lg font-semibold text-white">
              Ver todos os conteúdos
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <article className="container-page max-w-prose2 py-10">
      <Link to="/boas-praticas" className="flex items-center gap-1 text-lg font-semibold text-pampa-700 hover:underline">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Voltar para boas práticas
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-ink">{pratica.titulo}</h1>
      <p className="mt-3 text-xl text-ink-soft">{pratica.resumo}</p>

      <p className="mt-6 text-lg leading-relaxed text-ink">{pratica.conteudo}</p>

      {pratica.passoAPasso && pratica.passoAPasso.length > 0 && (
        <section className="card-surface mt-8 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <ListChecks className="h-6 w-6 text-pampa-600" aria-hidden="true" />
            Passo a passo
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-lg text-ink-soft">
            {pratica.passoAPasso.map((passo, i) => (
              <li key={i}>{passo}</li>
            ))}
          </ol>
        </section>
      )}

      {pratica.dicas && pratica.dicas.length > 0 && (
        <section className="card-surface mt-6 border-pampa-200 bg-pampa-50 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-pampa-800">
            <Lightbulb className="h-6 w-6" aria-hidden="true" />
            Dicas práticas
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg text-pampa-800">
            {pratica.dicas.map((dica, i) => (
              <li key={i}>{dica}</li>
            ))}
          </ul>
        </section>
      )}

      {pratica.alertas && pratica.alertas.length > 0 && (
        <section className="card-surface mt-6 border-[#F0C4BC] bg-[#FBEAE7] p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-alerta-desatualizado">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            Alertas importantes
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg text-ink">
            {pratica.alertas.map((alerta, i) => (
              <li key={i}>{alerta}</li>
            ))}
          </ul>
        </section>
      )}

      {pratica.fontes && pratica.fontes.length > 0 && (
        <p className="mt-8 flex items-start gap-2 text-base text-ink-soft">
          <BookMarked className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          Fontes: {pratica.fontes.join(', ')}
        </p>
      )}
    </article>
  )
}
