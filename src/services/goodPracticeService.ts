import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockBoasPraticas } from '@/data/mockGoodPractices'
import { BoaPratica } from '@/types'

async function listarLocal(categoria?: BoaPratica['categoria']): Promise<BoaPratica[]> {
  if (!categoria) return mockBoasPraticas
  return mockBoasPraticas.filter((b) => b.categoria === categoria)
}

async function buscarPorSlugLocal(slug: string): Promise<BoaPratica | null> {
  return mockBoasPraticas.find((b) => b.slug === slug) ?? null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): BoaPratica {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.title,
    categoria: row.category,
    resumo: row.summary,
    conteudo: row.content,
    passoAPasso: row.step_by_step ?? undefined,
    dicas: row.tips ?? undefined,
    alertas: row.alerts ?? undefined,
    fontes: row.sources ?? undefined,
    imagemUrl: row.image_url ?? undefined,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  }
}

async function listarSupabase(categoria?: BoaPratica['categoria']): Promise<BoaPratica[]> {
  let query = supabase!.from('good_practices').select('*')
  if (categoria) query = query.eq('category', categoria)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapRow)
}

async function buscarPorSlugSupabase(slug: string): Promise<BoaPratica | null> {
  const { data, error } = await supabase!.from('good_practices').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

export const goodPracticeService = {
  listar: (categoria?: BoaPratica['categoria']) =>
    isSupabaseConfigured ? listarSupabase(categoria) : listarLocal(categoria),
  buscarPorSlug: (slug: string) =>
    isSupabaseConfigured ? buscarPorSlugSupabase(slug) : buscarPorSlugLocal(slug),
}
