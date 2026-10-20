import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import type { AtividadeNoMapa, ModoDeslocamento, PontoReferencia } from '@/types'
import { formatarDistanciaAproximada } from '@/utils/geo'
import { useAuth } from '@/contexts/AuthContext'
import CategoriaChip from '@/components/CategoriaChip'
import DirectionsButton from '@/components/DirectionsButton'
import FavoriteButton from '@/components/FavoriteButton'
import SituacaoBadge from '@/components/SituacaoBadge'
import { obterInfoSituacao } from '@/utils/situacao'

interface Props {
  atividades: AtividadeNoMapa[]
  selecionadoId: string | null
  onVerNoMapa: (id: string) => void
  modo: ModoDeslocamento
  referencia: PontoReferencia | null
  /** Itens sem localização verificada: não têm botão "Ver no mapa". */
  semMapa?: boolean
}

export default function NearbyActivitiesList({
  atividades,
  selecionadoId,
  onVerNoMapa,
  modo,
  referencia,
  semMapa = false,
}: Props) {
  const { usuario } = useAuth()

  // Marcador selecionado no mapa -> o item correspondente aparece e fica destacado na lista.
  useEffect(() => {
    if (!selecionadoId) return
    const reduzido = document.documentElement.getAttribute('data-motion') === 'reduzido'
    document
      .getElementById(`atividade-${selecionadoId}`)
      ?.scrollIntoView({ block: 'nearest', behavior: reduzido ? 'auto' : 'smooth' })
  }, [selecionadoId])

  return (
    <ul className="flex flex-col gap-4">
      {atividades.map((a) => {
        const selecionado = a.local.id === selecionadoId
        const situacao = obterInfoSituacao(a.programa)
        return (
          <li
            key={a.local.id}
            id={`atividade-${a.local.id}`}
            aria-current={selecionado ? 'true' : undefined}
            className={`card-surface flex flex-col gap-3 p-4 ${selecionado ? 'ring-4 ring-chimarrao-400' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-2">
                <CategoriaChip slug={a.programa.categoria} />
                <h3 className="text-xl font-bold leading-tight text-ink">{a.programa.nome}</h3>
                <p className="text-base text-ink-soft">{a.programa.instituicao}</p>
              </div>
              {usuario && <FavoriteButton programaId={a.programa.id} />}
            </div>

            <p className="text-base text-ink">
              {[a.local.nome, a.local.endereco].filter(Boolean).join(' — ') || 'Endereço não cadastrado'}
              {' · '}
              {a.local.municipio}
            </p>

            {a.distanciaKm !== undefined && (
              <p className="text-base font-semibold text-pampa-700">
                {formatarDistanciaAproximada(a.distanciaKm)} em linha reta
              </p>
            )}
            {semMapa && (
              <p className="text-base text-ink-soft">
                A posição deste local no mapa ainda não foi verificada. Você pode usar “Como chegar” pelo endereço.
              </p>
            )}
            {a.combinaComPreferencias && (
              <p className="text-base font-semibold text-chimarrao-600">★ Combina com suas preferências</p>
            )}
            <SituacaoBadge info={situacao} />

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {!semMapa && (
                <button
                  type="button"
                  onClick={() => onVerNoMapa(a.local.id)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-pampa-600 px-4 py-3 text-lg font-semibold text-pampa-700 hover:bg-pampa-50"
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Ver no mapa
                </button>
              )}
              <Link
                to={`/programas/${a.programa.slug}`}
                className="flex min-h-12 items-center justify-center rounded-lg border-2 border-pampa-600 px-4 py-3 text-lg font-semibold text-pampa-700 hover:bg-pampa-50"
              >
                Ver detalhes
              </Link>
              <DirectionsButton local={a.local} modo={modo} referencia={referencia} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
