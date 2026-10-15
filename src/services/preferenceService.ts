import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { readLocal, writeLocal } from '@/lib/storage'
import { PreferenciasUsuario } from '@/types'

async function buscarLocal(userId: string): Promise<PreferenciasUsuario | null> {
  const todas = readLocal<Record<string, PreferenciasUsuario>>('preferencias', {})
  return todas[userId] ?? null
}

async function salvarLocal(preferencias: PreferenciasUsuario): Promise<PreferenciasUsuario> {
  const todas = readLocal<Record<string, PreferenciasUsuario>>('preferencias', {})
  todas[preferencias.userId] = { ...preferencias, atualizadoEm: new Date().toISOString() }
  writeLocal('preferencias', todas)
  return todas[preferencias.userId]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): PreferenciasUsuario {
  return {
    userId: row.user_id,
    interesses: row.interests ?? [],
    oQueProcura: row.what_they_seek ?? [],
    categoriasPreferidas: row.preferred_categories ?? [],
    modalidadePreferida: row.preferred_modality ?? 'tanto_faz',
    distanciaPreferida: row.preferred_distance ?? 'qualquer',
    atualizadoEm: row.updated_at,
  }
}

async function buscarSupabase(userId: string): Promise<PreferenciasUsuario | null> {
  const { data, error } = await supabase!.from('preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

async function salvarSupabase(preferencias: PreferenciasUsuario): Promise<PreferenciasUsuario> {
  const { data, error } = await supabase!
    .from('preferences')
    .upsert({
      user_id: preferencias.userId,
      interests: preferencias.interesses,
      what_they_seek: preferencias.oQueProcura,
      preferred_categories: preferencias.categoriasPreferidas,
      preferred_modality: preferencias.modalidadePreferida,
      preferred_distance: preferencias.distanciaPreferida,
    })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

export const preferenceService = {
  buscar: (userId: string) => (isSupabaseConfigured ? buscarSupabase(userId) : buscarLocal(userId)),
  salvar: (preferencias: PreferenciasUsuario) =>
    isSupabaseConfigured ? salvarSupabase(preferencias) : salvarLocal(preferencias),
}
