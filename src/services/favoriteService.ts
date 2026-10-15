import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { readLocal, writeLocal, uid } from '@/lib/storage'
import { Favorito } from '@/types'

async function listarLocal(userId: string): Promise<Favorito[]> {
  const todos = readLocal<Favorito[]>('favoritos', [])
  return todos.filter((f) => f.userId === userId)
}

async function adicionarLocal(userId: string, programaId: string): Promise<Favorito> {
  const todos = readLocal<Favorito[]>('favoritos', [])
  const existente = todos.find((f) => f.userId === userId && f.programaId === programaId)
  if (existente) return existente
  const novo: Favorito = { id: uid(), userId, programaId, criadoEm: new Date().toISOString() }
  writeLocal('favoritos', [...todos, novo])
  return novo
}

async function removerLocal(userId: string, programaId: string): Promise<void> {
  const todos = readLocal<Favorito[]>('favoritos', [])
  writeLocal(
    'favoritos',
    todos.filter((f) => !(f.userId === userId && f.programaId === programaId)),
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Favorito {
  return { id: row.id, userId: row.user_id, programaId: row.program_id, criadoEm: row.created_at }
}

async function listarSupabase(userId: string): Promise<Favorito[]> {
  const { data, error } = await supabase!.from('favorites').select('*').eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(mapRow)
}

async function adicionarSupabase(userId: string, programaId: string): Promise<Favorito> {
  const { data, error } = await supabase!
    .from('favorites')
    .insert({ user_id: userId, program_id: programaId })
    .select()
    .single()
  if (error) throw error
  return mapRow(data)
}

async function removerSupabase(userId: string, programaId: string): Promise<void> {
  const { error } = await supabase!.from('favorites').delete().eq('user_id', userId).eq('program_id', programaId)
  if (error) throw error
}

export const favoriteService = {
  listar: (userId: string) => (isSupabaseConfigured ? listarSupabase(userId) : listarLocal(userId)),
  adicionar: (userId: string, programaId: string) =>
    isSupabaseConfigured ? adicionarSupabase(userId, programaId) : adicionarLocal(userId, programaId),
  remover: (userId: string, programaId: string) =>
    isSupabaseConfigured ? removerSupabase(userId, programaId) : removerLocal(userId, programaId),
}
