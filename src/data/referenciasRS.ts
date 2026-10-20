import type { Coordenadas } from '@/types'

// Pontos de REFERÊNCIA para buscar "perto de" um município. Não são locais de programas.
// São centros aproximados dos municípios, usados só para centralizar o mapa e calcular
// distância em linha reta. Se quiser mais precisão, ajuste os valores (ou adicione cidades).
export interface MunicipioReferencia extends Coordenadas {
  nome: string
}

export const municipiosReferencia: MunicipioReferencia[] = [
  { nome: 'Porto Alegre', latitude: -30.0346, longitude: -51.2177 },
  { nome: 'Canoas', latitude: -29.9178, longitude: -51.1839 },
  { nome: 'Novo Hamburgo', latitude: -29.6783, longitude: -51.1306 },
  { nome: 'São Leopoldo', latitude: -29.7604, longitude: -51.1472 },
  { nome: 'Caxias do Sul', latitude: -29.1678, longitude: -51.1794 },
  { nome: 'Pelotas', latitude: -31.7654, longitude: -52.3376 },
  { nome: 'Santa Maria', latitude: -29.6842, longitude: -53.8069 },
  { nome: 'Passo Fundo', latitude: -28.2628, longitude: -52.4067 },
  { nome: 'Rio Grande', latitude: -32.035, longitude: -52.0986 },
  { nome: 'Bento Gonçalves', latitude: -29.1661, longitude: -51.5189 },
]
