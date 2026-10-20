import { Link } from 'react-router-dom'
import type { AtividadeNoMapa, ModoDeslocamento, PontoReferencia } from '@/types'
import { rotuloGratuidade, rotuloModalidade } from '@/utils/format'
import { formatarDistanciaAproximada } from '@/utils/geo'
import CategoriaChip from '@/components/CategoriaChip'
import DirectionsButton from '@/components/DirectionsButton'

// Conteúdo do balão que abre ao clicar em um marcador.
export default function ActivityPopup({
  atividade,
  modo,
  referencia,
}: {
  atividade: AtividadeNoMapa
  modo: ModoDeslocamento
  referencia: PontoReferencia | null
}) {
  const { programa, local } = atividade

  return (
    <div className="flex min-w-[240px] flex-col gap-2 text-ink">
      <CategoriaChip slug={programa.categoria} />
      <p className="text-xl font-bold leading-tight">{programa.nome}</p>
      <p className="text-base">
        <strong>Instituição:</strong> {programa.instituicao}
      </p>
      <p className="text-base">
        <strong>Endereço:</strong> {local.endereco ?? 'Consulte a instituição responsável'} — {local.municipio}
      </p>
      {atividade.distanciaKm !== undefined && (
        <p className="text-base">
          <strong>Distância:</strong> {formatarDistanciaAproximada(atividade.distanciaKm)} em linha reta
        </p>
      )}
      <p className="text-base">
        <strong>Gratuidade:</strong> {rotuloGratuidade[programa.gratuidade]} · <strong>Modalidade:</strong>{' '}
        {rotuloModalidade[programa.modalidade]}
      </p>
      {atividade.combinaComPreferencias && (
        <p className="text-base font-semibold text-chimarrao-600">★ Combina com suas preferências</p>
      )}
      <div className="mt-1 flex flex-col gap-2">
        <Link
          to={`/programas/${programa.slug}`}
          className="flex min-h-12 items-center justify-center rounded-lg border-2 border-pampa-600 px-4 py-3 text-lg font-semibold text-pampa-700 hover:bg-pampa-50"
        >
          Ver detalhes
        </Link>
        <DirectionsButton local={local} modo={modo} referencia={referencia} />
      </div>
    </div>
  )
}
