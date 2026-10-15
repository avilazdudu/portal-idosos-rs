import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { readLocal, writeLocal, uid } from '@/lib/storage'
import { PerfilUsuario } from '@/types'

export interface CadastroInput {
  nome: string
  email: string
  senha: string
  municipio: string
  faixaEtaria?: PerfilUsuario['faixaEtaria']
  dataNascimento?: string
}

export interface LoginInput {
  email: string
  senha: string
}

// --- Modo demonstracao (localStorage) -------------------------------------------------

interface ContaLocal {
  senha: string
  perfil: PerfilUsuario
}

function lerContas(): Record<string, ContaLocal> {
  return readLocal<Record<string, ContaLocal>>('contas', {})
}

function salvarContas(contas: Record<string, ContaLocal>) {
  writeLocal('contas', contas)
}

async function cadastrarLocal(input: CadastroInput): Promise<PerfilUsuario> {
  const contas = lerContas()
  if (contas[input.email]) {
    throw new Error('Já existe uma conta com este e-mail.')
  }
  const perfil: PerfilUsuario = {
    id: uid(),
    nome: input.nome,
    email: input.email,
    municipio: input.municipio,
    faixaEtaria: input.faixaEtaria,
    dataNascimento: input.dataNascimento,
    criadoEm: new Date().toISOString(),
  }
  contas[input.email] = { senha: input.senha, perfil }
  salvarContas(contas)
  writeLocal('sessao', perfil.id)
  return perfil
}

async function loginLocal(input: LoginInput): Promise<PerfilUsuario> {
  const contas = lerContas()
  const conta = contas[input.email]
  if (!conta || conta.senha !== input.senha) {
    throw new Error('E-mail ou senha incorretos.')
  }
  writeLocal('sessao', conta.perfil.id)
  return conta.perfil
}

async function logoutLocal(): Promise<void> {
  writeLocal('sessao', null)
}

async function usuarioAtualLocal(): Promise<PerfilUsuario | null> {
  const sessaoId = readLocal<string | null>('sessao', null)
  if (!sessaoId) return null
  const contas = lerContas()
  const conta = Object.values(contas).find((c) => c.perfil.id === sessaoId)
  return conta?.perfil ?? null
}

async function atualizarPerfilLocal(perfil: PerfilUsuario): Promise<PerfilUsuario> {
  const contas = lerContas()
  const conta = contas[perfil.email]
  if (conta) {
    conta.perfil = perfil
    salvarContas(contas)
  }
  return perfil
}

// --- Modo Supabase ----------------------------------------------------------------------

async function cadastrarSupabase(input: CadastroInput): Promise<PerfilUsuario> {
  const { data, error } = await supabase!.auth.signUp({
    email: input.email,
    password: input.senha,
  })
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error('Não foi possível criar a conta.')

  const perfil: PerfilUsuario = {
    id: userId,
    nome: input.nome,
    email: input.email,
    municipio: input.municipio,
    faixaEtaria: input.faixaEtaria,
    dataNascimento: input.dataNascimento,
    criadoEm: new Date().toISOString(),
  }

  const { error: perfilError } = await supabase!.from('profiles').insert({
    id: perfil.id,
    name: perfil.nome,
    email: perfil.email,
    city: perfil.municipio,
    birth_date: perfil.dataNascimento ?? null,
  })
  if (perfilError) throw perfilError

  return perfil
}

async function loginSupabase(input: LoginInput): Promise<PerfilUsuario> {
  const { data, error } = await supabase!.auth.signInWithPassword({
    email: input.email,
    password: input.senha,
  })
  if (error) throw error
  const userId = data.user?.id
  if (!userId) throw new Error('Não foi possível entrar.')

  const { data: perfilRow, error: perfilError } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (perfilError) throw perfilError

  return mapPerfilRow(perfilRow)
}

async function logoutSupabase(): Promise<void> {
  const { error } = await supabase!.auth.signOut()
  if (error) throw error
}

async function usuarioAtualSupabase(): Promise<PerfilUsuario | null> {
  const { data } = await supabase!.auth.getUser()
  const userId = data.user?.id
  if (!userId) return null

  const { data: perfilRow, error } = await supabase!.from('profiles').select('*').eq('id', userId).single()
  if (error || !perfilRow) return null
  return mapPerfilRow(perfilRow)
}

async function atualizarPerfilSupabase(perfil: PerfilUsuario): Promise<PerfilUsuario> {
  const { error } = await supabase!
    .from('profiles')
    .update({
      name: perfil.nome,
      city: perfil.municipio,
      birth_date: perfil.dataNascimento ?? null,
      avatar_url: perfil.avatarUrl ?? null,
    })
    .eq('id', perfil.id)
  if (error) throw error
  return perfil
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPerfilRow(row: any): PerfilUsuario {
  return {
    id: row.id,
    nome: row.name,
    email: row.email,
    municipio: row.city,
    dataNascimento: row.birth_date ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    criadoEm: row.created_at,
  }
}

// --- API publica do service ---------------------------------------------------------

export const authService = {
  cadastrar: (input: CadastroInput) => (isSupabaseConfigured ? cadastrarSupabase(input) : cadastrarLocal(input)),
  login: (input: LoginInput) => (isSupabaseConfigured ? loginSupabase(input) : loginLocal(input)),
  logout: () => (isSupabaseConfigured ? logoutSupabase() : logoutLocal()),
  usuarioAtual: () => (isSupabaseConfigured ? usuarioAtualSupabase() : usuarioAtualLocal()),
  atualizarPerfil: (perfil: PerfilUsuario) =>
    isSupabaseConfigured ? atualizarPerfilSupabase(perfil) : atualizarPerfilLocal(perfil),
}
