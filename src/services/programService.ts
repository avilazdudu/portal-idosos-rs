import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockProgramas } from '@/data/mockPrograms'
import { FiltrosPrograma, Programa } from '@/types'
import { filtrarProgramas } from '@/utils/filtros'
import { EntradaVerificacao, validarEntradaVerificacao } from '@/utils/verification'
import { EntradaSituacao, validarEntradaSituacao } from '@/utils/situacao'

async function listarLocal(filtros?: FiltrosPrograma): Promise<Programa[]> {
  return filtrarProgramas(mockProgramas.filter((p) => p.ativo), filtros)
}

async function buscarPorSlugLocal(slug: string): Promise<Programa | null> {
  return mockProgramas.find((p) => p.slug === slug && p.ativo) ?? null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Programa {
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    nome: row.name,
    descricao: row.description,
    descricaoCompleta: row.description_full ?? undefined,
    objetivo: row.objective ?? undefined,
    instituicao: row.organization,
    categoria: row.category,
    subcategoria: row.subcategory ?? undefined,
    municipio: row.city,
    regiao: row.region,
    endereco: row.address ?? undefined,
    telefone: row.phone ?? undefined,
    email: row.email ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    registrationUrl: row.registration_url ?? undefined,
    modalidade: row.modality,
    faixaEtaria: row.age_range,
    gratuidade: row.is_free,
    acessibilidade: row.accessibility_information ?? undefined,
    horarios: row.schedule ?? undefined,
    publicoAlvo: row.target_audience ?? undefined,
    imagemUrl: row.image_url ?? undefined,
    tags: row.tags ?? [],
    fonteOficial: row.source ?? undefined,
    statusVerificacao: row.verification_status ?? 'revisar',
    ultimaVerificacaoEm: row.last_verified_at ?? undefined,
    ativo: row.is_active ?? true,
    situacao: row.availability ?? 'aberto',
    situacaoObservacao: row.availability_note ?? undefined,
    situacaoAte: row.availability_until ?? undefined,
    criadoEm: row.created_at,
    atualizadoEm: row.updated_at,
  }
}

async function listarSupabase(filtros?: FiltrosPrograma): Promise<Programa[]> {
  // Filtros simples são aplicados no banco; a busca por texto (sem acentos) e os demais
  // filtros são aplicados em filtrarProgramas, pois o conjunto de programas é pequeno.
  let query = supabase!.from('programs').select('*').eq('is_active', true)

  if (filtros?.categoria) query = query.eq('category', filtros.categoria)
  if (filtros?.regiao) query = query.eq('region', filtros.regiao)
  if (filtros?.modalidade) query = query.eq('modality', filtros.modalidade)

  const { data, error } = await query
  if (error) throw error
  return filtrarProgramas((data ?? []).map(mapRow), filtros)
}

async function buscarPorSlugSupabase(slug: string): Promise<Programa | null> {
  const { data, error } = await supabase!.from('programs').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

async function marcarComoVerificadoSupabase(programaId: string, entrada: EntradaVerificacao): Promise<Programa> {
  // A função verificar_programa (supabase/schema.sql) confere se o usuário é administrador,
  // grava a fonte, define a data de verificação como agora e muda o status para 'verificado'.
  const { data, error } = await supabase!.rpc('verificar_programa', {
    p_program_id: programaId,
    p_fonte: entrada.fonteOficial.trim(),
    p_registration_url: entrada.registrationUrl?.trim() || null,
    p_website_url: entrada.websiteUrl?.trim() || null,
  })
  if (error) throw error
  return mapRow(data)
}

async function marcarComoVerificado(programaId: string, entrada: EntradaVerificacao): Promise<Programa> {
  const erros = validarEntradaVerificacao(entrada)
  if (erros.length > 0) throw new Error(erros.join(' '))
  if (!isSupabaseConfigured) {
    throw new Error('A verificação de programas só está disponível com o Supabase configurado.')
  }
  return marcarComoVerificadoSupabase(programaId, entrada)
}

async function listarTodos(): Promise<Programa[]> {
  // Para a futura área administrativa: inclui programas desativados.
  // No Supabase, só administradores enxergam os desativados (policy "Admins gerenciam programas").
  if (!isSupabaseConfigured) return mockProgramas
  const { data, error } = await supabase!.from('programs').select('*')
  if (error) throw error
  return (data ?? []).map(mapRow)
}

async function alterarSituacao(programaId: string, entrada: EntradaSituacao): Promise<Programa> {
  const erros = validarEntradaSituacao(entrada)
  if (erros.length > 0) throw new Error(erros.join(' '))
  if (!isSupabaseConfigured) {
    throw new Error('A alteração da situação de programas só está disponível com o Supabase configurado.')
  }

  const campos: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (entrada.ativo !== undefined) campos.is_active = entrada.ativo
  if (entrada.situacao !== undefined) campos.availability = entrada.situacao
  if (entrada.observacao !== undefined) campos.availability_note = entrada.observacao.trim() || null
  if (entrada.ate !== undefined) campos.availability_until = entrada.ate || null
  // Ao voltar para "aberto", limpa o aviso e a previsão para não sobrar texto antigo.
  if (entrada.situacao === 'aberto') {
    campos.availability_note = null
    campos.availability_until = null
  }

  const { data, error } = await supabase!.from('programs').update(campos).eq('id', programaId).select().single()
  if (error) throw error
  return mapRow(data)
}

export const programService = {
  listar: (filtros?: FiltrosPrograma) =>
    isSupabaseConfigured ? listarSupabase(filtros) : listarLocal(filtros),
  buscarPorSlug: (slug: string) =>
    isSupabaseConfigured ? buscarPorSlugSupabase(slug) : buscarPorSlugLocal(slug),
  marcarComoVerificado,
  listarTodos,
  alterarSituacao,
}
