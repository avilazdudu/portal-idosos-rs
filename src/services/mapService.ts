import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockLocais } from '@/data/mockLocais'
import { coordenadasValidas } from '@/utils/geo'
import type { LocalAtendimento } from '@/types'

// Locais de atendimento dos programas (tabela program_locations).
// A página /mapa só mostra marcador para locais com coordenadas válidas e verificadas.

async function listarLocal(): Promise<LocalAtendimento[]> {
  return mockLocais
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): LocalAtendimento {
  return {
    id: row.id,
    programaId: row.program_id,
    nome: row.name ?? undefined,
    endereco: row.address ?? undefined,
    municipio: row.city,
    estado: row.state ?? 'RS',
    cep: row.postal_code ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    fonteLocalizacao: row.location_source ?? undefined,
    localizacaoVerificadaEm: row.location_verified_at ?? undefined,
  }
}

async function listarSupabase(): Promise<LocalAtendimento[]> {
  // O RLS já limita aos locais de programas ativos (administradores veem todos).
  const { data, error } = await supabase!.from('program_locations').select('*')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

export interface EntradaLocalizacao {
  latitude: number
  longitude: number
  /** Como a posição foi conferida. Ex.: "Conferido no Google Maps em 2026-10-19". */
  fonte: string
}

export function validarEntradaLocalizacao(entrada: EntradaLocalizacao): string[] {
  const erros: string[] = []
  if (!coordenadasValidas(entrada.latitude, entrada.longitude, 'RS')) {
    erros.push(
      'As coordenadas precisam estar dentro do Rio Grande do Sul. Confira se latitude e longitude não foram trocadas (no RS, ambas são negativas e a latitude fica perto de -30).',
    )
  }
  if (!entrada.fonte || !entrada.fonte.trim()) {
    erros.push('Informe como a localização foi conferida (fonte).')
  }
  return erros
}

/**
 * Corrige/define a posição de um local e o marca como verificado agora.
 * Pensado para a futura área administrativa; exige administrador no Supabase (RLS).
 */
async function definirLocalizacao(localId: string, entrada: EntradaLocalizacao): Promise<LocalAtendimento> {
  const erros = validarEntradaLocalizacao(entrada)
  if (erros.length > 0) throw new Error(erros.join(' '))
  if (!isSupabaseConfigured) {
    throw new Error('A correção de localizações só está disponível com o Supabase configurado.')
  }

  const agora = new Date().toISOString()
  const { data, error } = await supabase!
    .from('program_locations')
    .update({
      latitude: entrada.latitude,
      longitude: entrada.longitude,
      location_source: entrada.fonte.trim(),
      location_verified_at: agora,
      updated_at: agora,
    })
    .eq('id', localId)
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export const mapService = {
  listarLocais: () => (isSupabaseConfigured ? listarSupabase() : listarLocal()),
  definirLocalizacao,
}
