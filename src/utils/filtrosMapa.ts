import type {
  AtividadeMapeavel,
  AtividadeNoMapa,
  DistanciaKm,
  FiltrosMapa,
  LocalAtendimento,
  PontoReferencia,
  PreferenciasUsuario,
  Programa,
} from '@/types'
import { coordenadasDoLocal, distanciaEmLinhaRetaKm } from '@/utils/geo'
import { normalizar } from '@/utils/text'

export const FILTROS_MAPA_INICIAIS: FiltrosMapa = {
  busca: undefined,
  categoria: undefined,
  distanciaKm: null,
  apenasGratuitas: false,
  apenasPresenciais: false,
  apenasMinhasCategorias: false,
}

export function ehMapeavel(atividade: AtividadeNoMapa): atividade is AtividadeMapeavel {
  return atividade.coordenadas !== null
}

/** Junta cada local ao seu programa (ativo) e calcula a distância até a referência, se houver. */
export function montarAtividades(
  programas: Programa[],
  locais: LocalAtendimento[],
  referencia: PontoReferencia | null,
  preferencias: PreferenciasUsuario | null,
): AtividadeNoMapa[] {
  const programaPorId = new Map<string, Programa>(programas.map((p) => [p.id, p] as [string, Programa]))
  const categoriasFavoritas = new Set<string>(preferencias?.categoriasPreferidas ?? [])

  const atividades: AtividadeNoMapa[] = []
  for (const local of locais) {
    const programa = programaPorId.get(local.programaId)
    if (!programa) continue // programa desativado ou inexistente
    const coordenadas = coordenadasDoLocal(local)
    atividades.push({
      local,
      programa,
      coordenadas,
      distanciaKm: coordenadas && referencia ? distanciaEmLinhaRetaKm(referencia, coordenadas) : undefined,
      combinaComPreferencias: categoriasFavoritas.has(programa.categoria),
    })
  }
  return atividades
}

/**
 * Filtros que não dependem de distância. Presencial inclui os programas híbridos
 * (eles têm parte presencial); só "online" fica de fora.
 * "Gratuitas" considera apenas as marcadas como gratuitas (não as "gratuito ou pago").
 */
export function filtrarAtividades(atividades: AtividadeNoMapa[], filtros: FiltrosMapa): AtividadeNoMapa[] {
  const termo = filtros.busca ? normalizar(filtros.busca) : ''

  return atividades.filter((a) => {
    const p = a.programa
    if (filtros.categoria && p.categoria !== filtros.categoria) return false
    if (filtros.apenasGratuitas && p.gratuidade !== 'gratuito') return false
    if (filtros.apenasPresenciais && p.modalidade === 'online') return false
    if (filtros.apenasMinhasCategorias && !a.combinaComPreferencias) return false
    if (termo) {
      const alvo = normalizar(
        [p.nome, p.instituicao, a.local.nome, a.local.endereco, a.local.municipio, ...p.tags]
          .filter(Boolean)
          .join(' '),
      )
      if (!alvo.includes(termo)) return false
    }
    return true
  })
}

/** Só se aplica a locais com coordenadas; os demais não têm distância conhecida. */
export function filtrarPorDistancia(
  atividades: AtividadeMapeavel[],
  distanciaKm: DistanciaKm | null,
  referencia: PontoReferencia | null,
): AtividadeMapeavel[] {
  if (!distanciaKm || !referencia) return atividades
  return atividades.filter((a) => a.distanciaKm !== undefined && a.distanciaKm <= distanciaKm)
}

export function ordenarAtividades<T extends AtividadeNoMapa>(lista: T[], temReferencia: boolean): T[] {
  return [...lista].sort((a, b) => {
    if (temReferencia && a.distanciaKm !== undefined && b.distanciaKm !== undefined) {
      return a.distanciaKm - b.distanciaKm
    }
    if (a.combinaComPreferencias !== b.combinaComPreferencias) return a.combinaComPreferencias ? -1 : 1
    const municipios = a.local.municipio.localeCompare(b.local.municipio, 'pt-BR')
    if (municipios !== 0) return municipios
    return a.programa.nome.localeCompare(b.programa.nome, 'pt-BR')
  })
}
