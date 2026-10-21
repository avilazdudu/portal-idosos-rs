import { Link } from 'react-router-dom'
import type { AtividadeNoMapa, ModoDeslocamento, PontoReferencia } from '@/types'
import { rotuloGratuidade, rotuloModalidade } from '@/utils/format'
import { formatarDistanciaAproximada } from '@/utils/geo'
import CategoriaChip from '@/components/CategoriaChip'
import DirectionsButton from '@/components/DirectionsButton'

// Conteúdo compacto do balão que abre ao clicar em um marcador.
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
  const endereco =
    [local.endereco, local.municipio].filter(Boolean).join(' — ') || 'Consulte a instituição responsável'

  return (
    <div className="flex w-[270px] max-w-full flex-col gap-1.5 text-ink">
      <div className="pr-8">
        <CategoriaChip slug={programa.categoria} />
      </div>
      <p className="text-lg font-bold leading-snug">{programa.nome}</p>
      <p className="text-[15px] leading-snug text-ink-soft">{programa.instituicao}</p>
      <p className="text-[15px] leading-snug">{endereco}</p>
      <p className="text-[15px] leading-snug text-ink-soft">
        {rotuloGratuidade[programa.gratuidade]} · {rotuloModalidade[programa.modalidade]}
        {atividade.distanciaKm !== undefined &&
          ` · ${formatarDistanciaAproximada(atividade.distanciaKm)} em linha reta`}
      </p>
      {atividade.combinaComPreferencias && (
        <p className="text-[15px] font-semibold text-chimarrao-600">★ Combina com suas preferências</p>
      )}
      <div className="mt-1 grid grid-cols-2 gap-2">
        <Link
          to={`/programas/${programa.slug}`}
          className="flex min-h-11 items-center justify-center rounded-lg border-2 border-pampa-600 px-2 py-2 text-base font-semibold text-pampa-700 hover:bg-pampa-50"
        >
          Ver detalhes
        </Link>
        <DirectionsButton local={local} modo={modo} referencia={referencia} compacto />
      </div>
    </div>
  )
}