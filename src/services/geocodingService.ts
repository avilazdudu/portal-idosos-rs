import type { Coordenadas } from '@/types'
import { LIMITES_RS, coordenadasNoRS } from '@/utils/geo'
import { normalizar } from '@/utils/text'

// Geocodificação (texto -> coordenadas) pelo Nominatim do OpenStreetMap.
//
// Uso responsável, conforme a política do serviço público (https://operations.osmfoundation.org/policies/nominatim/):
//  - só roda quando a pessoa clica em "Procurar endereço" (nada de busca a cada tecla);
//  - no máximo 1 consulta por segundo;
//  - resultados repetidos vêm do cache em memória (não guardamos o que a pessoa digitou em disco);
//  - restrito ao Rio Grande do Sul.
// Para uso intenso, troque por um provedor próprio/pago. Isto NÃO é usado para cadastrar os
// locais dos programas: para isso veja scripts/sugerir-coordenadas.mjs e docs/MAPA.md.

export interface ResultadoGeocodificacao extends Coordenadas {
  descricao: string
}

export class ErroGeocodificacao extends Error {}

const URL_BASE = 'https://nominatim.openstreetmap.org/search'
const INTERVALO_MINIMO_MS = 1100
const cache = new Map<string, ResultadoGeocodificacao | null>()
let ultimaConsultaEm = 0

const emailContato = import.meta.env.VITE_NOMINATIM_EMAIL

interface ItemNominatim {
  lat: string
  lon: string
  display_name: string
}

export async function geocodificarEndereco(texto: string): Promise<ResultadoGeocodificacao | null> {
  const consulta = texto.trim()
  if (consulta.length < 3) {
    throw new ErroGeocodificacao('Digite pelo menos 3 letras do endereço ou do município.')
  }

  const chave = normalizar(consulta)
  if (cache.has(chave)) return cache.get(chave) ?? null

  const espera = ultimaConsultaEm + INTERVALO_MINIMO_MS - Date.now()
  if (espera > 0) await new Promise<void>((resolver) => setTimeout(resolver, espera))
  ultimaConsultaEm = Date.now()

  const parametros = new URLSearchParams({
    q: `${consulta}, Rio Grande do Sul, Brasil`,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'br',
    'accept-language': 'pt-BR',
    viewbox: `${LIMITES_RS.oeste},${LIMITES_RS.norte},${LIMITES_RS.leste},${LIMITES_RS.sul}`,
    bounded: '1',
  })
  if (emailContato) parametros.set('email', emailContato)

  let resposta: Response
  try {
    resposta = await fetch(`${URL_BASE}?${parametros.toString()}`, { headers: { Accept: 'application/json' } })
  } catch {
    throw new ErroGeocodificacao(
      'Não foi possível consultar o serviço de endereços. Verifique sua internet e tente de novo.',
    )
  }
  if (!resposta.ok) {
    throw new ErroGeocodificacao('O serviço de endereços está indisponível agora. Tente de novo em alguns minutos.')
  }

  const dados = (await resposta.json()) as ItemNominatim[]
  const primeiro = dados[0]
  if (!primeiro) {
    cache.set(chave, null)
    return null
  }

  const latitude = Number(primeiro.lat)
  const longitude = Number(primeiro.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !coordenadasNoRS(latitude, longitude)) {
    cache.set(chave, null)
    return null
  }

  const resultado: ResultadoGeocodificacao = {
    latitude,
    longitude,
    descricao: primeiro.display_name.split(',').slice(0, 3).join(',').trim(),
  }
  cache.set(chave, resultado)
  return resultado
}
