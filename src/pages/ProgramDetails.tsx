import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Users, CheckCircle2 } from 'lucide-react'
import { programService } from '@/services/programService'
import { Programa } from '@/types'
import { rotuloModalidade, rotuloGratuidade, rotuloFaixaEtaria, formatarData } from '@/utils/format'
import { categoriaPorSlug } from '@/data/categories'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import { calcularStatusVerificacao } from '@/utils/verification'
import { obterInfoSituacao } from '@/utils/situacao'
import SituacaoBadge from '@/components/SituacaoBadge'
import FavoriteButton from '@/components/FavoriteButton'

const rotulosAcessibilidade: Record<string, string> = {
  acessivelCadeirantes: 'Acessível para cadeirantes',
  possuiTransporte: 'Possui transporte',
  possuiInterprete: 'Possui intérprete',
  atividadesAdaptadas: 'Atividades adaptadas',
  atendimentoEspecializado: 'Atendimento especializado',
}

export default function ProgramDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [programa, setPrograma] = useState<Programa | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    programService.buscarPorSlug(slug).then(setPrograma)
  }, [slug])

  if (programa === undefined) return <LoadingState texto="Carregando programa..." />
  if (programa === null) {
    return (
      <div className="container-page py-10">
        <EmptyState
          titulo="Programa não encontrado"
          descricao="Esse programa pode ter sido removido ou o endereço está incorreto."
          acao={
            <Link to="/programas" className="rounded-lg bg-pampa-600 px-5 py-3 text-lg font-semibold text-white">
              Ver todos os programas
            </Link>
          }
        />
      </div>
    )
  }

  const categoria = categoriaPorSlug(programa.categoria)
  const verificacao = calcularStatusVerificacao(programa)
  const situacao = obterInfoSituacao(programa)
  const acessibilidadeAtiva = Object.entries(programa.acessibilidade ?? {}).filter(([, v]) => v)

  return (
    <div className="container-page py-10">
      <Link to="/programas" className="flex items-center gap-1 text-lg font-semibold text-pampa-700 hover:underline">
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Voltar para programas
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-pampa-700">{categoria?.nome}</p>
              <h1 className="text-3xl font-bold text-ink">{programa.nome}</h1>
              <p className="mt-1 text-xl text-ink-soft">{programa.instituicao}</p>
            </div>
            <FavoriteButton programaId={programa.id} tamanho="grande" />
          </div>

          {situacao.rotulo && (
            <div role="status" className="mt-4 rounded-xl border border-[#F0C4BC] bg-[#FBEAE7] p-4">
              <SituacaoBadge info={situacao} />
              <p className="mt-2 text-lg text-ink">{situacao.mensagem}</p>
            </div>
          )}

          <div className="mt-4">
            <StatusBadge status={verificacao.status} motivo={verificacao.motivo} />
            <p className="mt-2 text-base text-ink-soft">{verificacao.motivo}</p>
          </div>

          <div className="card-surface mt-6 p-6">
            <h2 className="text-xl font-bold text-ink">Sobre o programa</h2>
            <p className="mt-3 text-lg text-ink-soft">{programa.descricaoCompleta ?? programa.descricao}</p>
            {programa.objetivo && (
              <>
                <h3 className="mt-5 text-lg font-bold text-ink">Objetivo</h3>
                <p className="mt-1 text-lg text-ink-soft">{programa.objetivo}</p>
              </>
            )}
            {programa.publicoAlvo && (
              <>
                <h3 className="mt-5 text-lg font-bold text-ink">Público-alvo</h3>
                <p className="mt-1 flex items-center gap-2 text-lg text-ink-soft">
                  <Users className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {programa.publicoAlvo}
                </p>
              </>
            )}
          </div>

          <div className="card-surface mt-6 p-6">
            <h2 className="text-xl font-bold text-ink">Local e horários</h2>
            <dl className="mt-3 space-y-3 text-lg text-ink-soft">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{programa.endereco ?? `${programa.municipio} — endereço não cadastrado`}</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{programa.horarios ?? 'Horários não cadastrados. Consulte a instituição responsável.'}</span>
              </div>
            </dl>
          </div>

          {acessibilidadeAtiva.length > 0 && (
            <div className="card-surface mt-6 p-6">
              <h2 className="text-xl font-bold text-ink">Acessibilidade</h2>
              <ul className="mt-3 space-y-2">
                {acessibilidadeAtiva.map(([chave]) => (
                  <li key={chave} className="flex items-center gap-2 text-lg text-ink-soft">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-pampa-600" aria-hidden="true" />
                    {rotulosAcessibilidade[chave] ?? chave}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="card-surface p-6">
            <p className="text-lg font-bold text-ink">Informações rápidas</p>
            <dl className="mt-4 space-y-3 text-base text-ink-soft">
              <div className="flex justify-between gap-3">
                <dt className="font-medium">Modalidade</dt>
                <dd>{rotuloModalidade[programa.modalidade]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium">Faixa etária</dt>
                <dd>{rotuloFaixaEtaria[programa.faixaEtaria]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium">Gratuidade</dt>
                <dd>{rotuloGratuidade[programa.gratuidade]}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="font-medium">Região</dt>
                <dd>{programa.regiao}</dd>
              </div>
            </dl>

            <div className="mt-5 space-y-2 border-t border-pampa-100 pt-4 text-base text-ink-soft">
              {programa.telefone && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" /> {programa.telefone}
                </p>
              )}
              {programa.email && (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" /> {programa.email}
                </p>
              )}
              {programa.websiteUrl && (
                <a href={programa.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pampa-700 hover:underline">
                  <Globe className="h-4 w-4 shrink-0" aria-hidden="true" /> Site oficial
                </a>
              )}
            </div>

            {!situacao.inscricaoDisponivel ? (
              <p className="mt-5 rounded-lg bg-cream-deep p-4 text-center text-base font-medium text-ink-soft">
                {situacao.rotulo}. Consulte a instituição responsável.
              </p>
            ) : programa.registrationUrl ? (
              <a
                href={programa.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center rounded-lg bg-pampa-600 px-5 py-4 text-xl font-bold text-white hover:bg-pampa-700"
              >
                Quero participar
              </a>
            ) : (
              <p className="mt-5 rounded-lg bg-cream-deep p-4 text-center text-base font-medium text-ink-soft">
                Informações de inscrição não disponíveis. Consulte a instituição responsável.
              </p>
            )}

            <p className="mt-4 text-sm text-ink-soft">
              Fonte: {programa.fonteOficial ?? 'não cadastrada'} · Última verificação: {formatarData(programa.ultimaVerificacaoEm)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
