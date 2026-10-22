import { Navigation } from 'lucide-react'
import type { LocalAtendimento, ModoDeslocamento, PontoReferencia } from '@/types'
import { destinoParaNavegacao, montarUrlComoChegar } from '@/utils/geo'

// "Como chegar": abre o Google Maps em nova aba, sempre por ação direta da pessoa.
// A origem só é enviada quando é a posição do aparelho ou um endereço que a própria pessoa digitou.
export default function DirectionsButton({
  local,
  modo,
  referencia,
  className = '',
  compacto = false,
}: {
  local: LocalAtendimento
  modo: ModoDeslocamento
  referencia: PontoReferencia | null
  className?: string
  compacto?: boolean
}) {
  const destino = destinoParaNavegacao(local)

  if (!destino) {
    return (
      <span
        className={`flex items-center justify-center rounded-lg bg-cream-deep text-center font-medium text-ink-soft ${
          compacto ? 'min-h-11 px-2 py-2 text-sm' : 'px-4 py-3 text-base'
        }`}
      >
        {compacto ? 'Sem endereço' : 'Endereço para navegação não cadastrado'}
      </span>
    )
  }

  const origem = referencia && referencia.tipo !== 'municipio' ? referencia : null
  const url = montarUrlComoChegar(destino, modo, origem)
  const nome = local.nome ?? local.municipio

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Como chegar: ${nome}. Abre o Google Maps em outra aba.`}
      className={`flex items-center justify-center gap-2 rounded-lg bg-chimarrao-400 font-bold text-ink hover:bg-chimarrao-300 ${
        compacto ? 'min-h-11 px-2 py-2 text-base' : 'min-h-12 px-4 py-3 text-lg'
      } ${className}`}
    >
      {!compacto && <Navigation className="h-5 w-5 shrink-0" aria-hidden="true" />}
      Como chegar
    </a>
  )
}