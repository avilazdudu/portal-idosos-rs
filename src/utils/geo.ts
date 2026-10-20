import type { Coordenadas, LocalAtendimento, ModoDeslocamento } from '@/types'

// Caixa que envolve o Rio Grande do Sul. Serve para (1) a visão inicial do mapa e
// (2) detectar coordenadas obviamente erradas (ex.: latitude e longitude trocadas).
export const LIMITES_RS = { sul: -33.75, norte: -27.08, oeste: -57.65, leste: -49.69 } as const
export const LIMITES_RS_LEAFLET: [[number, number], [number, number]] = [
  [LIMITES_RS.sul, LIMITES_RS.oeste],
  [LIMITES_RS.norte, LIMITES_RS.leste],
]

export function coordenadasNoRS(latitude: number, longitude: number): boolean {
  return (
    latitude >= LIMITES_RS.sul &&
    latitude <= LIMITES_RS.norte &&
    longitude >= LIMITES_RS.oeste &&
    longitude <= LIMITES_RS.leste
  )
}

export function coordenadasValidas(latitude: unknown, longitude: unknown, estado = 'RS'): boolean {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false
  return estado === 'RS' ? coordenadasNoRS(latitude, longitude) : true
}

/**
 * Coordenadas que podem virar marcador: precisam ser válidas E ter sido verificadas por uma pessoa.
 * Local sem verificação nunca aparece no mapa (apenas na lista).
 */
export function coordenadasDoLocal(local: LocalAtendimento): Coordenadas | null {
  if (!local.localizacaoVerificadaEm) return null
  if (!coordenadasValidas(local.latitude, local.longitude, local.estado)) return null
  return { latitude: local.latitude as number, longitude: local.longitude as number }
}

/** Distância em linha reta (fórmula de Haversine). NÃO é a distância por ruas. */
export function distanciaEmLinhaRetaKm(a: Coordenadas, b: Coordenadas): number {
  const RAIO_TERRA_KM = 6371
  const rad = (graus: number) => (graus * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 2 * RAIO_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

const formatadorKm = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

/** Texto de distância sempre identificado como estimativa. Ex.: "a cerca de 3,4 km". */
export function formatarDistanciaAproximada(km: number): string {
  if (km < 1) return 'a menos de 1 km'
  const arredondado = km < 10 ? Math.round(km * 10) / 10 : Math.round(km)
  return `a cerca de ${formatadorKm.format(arredondado)} km`
}

// ---------------------------------------------------------------------------
// Google Maps: "Como chegar"
// ---------------------------------------------------------------------------

const MODOS_GOOGLE: Record<ModoDeslocamento, string> = {
  carro: 'driving',
  a_pe: 'walking',
  transporte_publico: 'transit',
}

export const ROTULO_MODO: Record<ModoDeslocamento, string> = {
  carro: 'De carro',
  a_pe: 'A pé',
  transporte_publico: 'Transporte público',
}

/**
 * Destino enviado ao Google Maps: coordenadas verificadas quando existem; senão o endereço
 * cadastrado. Retorna null quando não há como navegar (nunca inventamos um destino).
 */
export function destinoParaNavegacao(local: LocalAtendimento): string | null {
  const coordenadas = coordenadasDoLocal(local)
  if (coordenadas) return `${coordenadas.latitude},${coordenadas.longitude}`

  const endereco = local.endereco?.trim()
  if (!endereco) return null
  const texto = [endereco, local.municipio, local.estado, 'Brasil'].filter(Boolean).join(', ')
  return texto.length <= 250 ? texto : null
}

export function montarUrlComoChegar(destino: string, modo: ModoDeslocamento, origem?: Coordenadas | null): string {
  const parametros = new URLSearchParams({ api: '1', destination: destino, travelmode: MODOS_GOOGLE[modo] })
  if (origem) parametros.set('origin', `${origem.latitude},${origem.longitude}`)
  return `https://www.google.com/maps/dir/?${parametros.toString()}`
}
