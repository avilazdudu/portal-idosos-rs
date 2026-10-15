// Tipos centrais da aplicacao. Espelham as tabelas do Supabase descritas em supabase/schema.sql.

export type Modalidade = 'presencial' | 'online' | 'hibrido'
export type Gratuidade = 'gratuito' | 'pago' | 'gratuito_ou_pago'
export type StatusVerificacao = 'verificado' | 'revisar' | 'desatualizado'
export type SituacaoPrograma = 'aberto' | 'inscricoes_fechadas' | 'indisponivel'

export type CategoriaSlug =
  | 'esporte'
  | 'saude'
  | 'convivencia'
  | 'educacao'
  | 'inclusao-digital'
  | 'cultura-lazer'
  | 'assistencia'
  | 'intergeracional'

export interface Categoria {
  id: string
  slug: CategoriaSlug
  nome: string
  descricao: string
  icone: string // nome do icone lucide-react
}

export interface AcessibilidadeInfo {
  acessivelCadeirantes?: boolean
  possuiTransporte?: boolean
  possuiInterprete?: boolean
  atividadesAdaptadas?: boolean
  atendimentoEspecializado?: boolean
}

export interface Programa {
  id: string
  slug: string
  nome: string
  descricao: string
  descricaoCompleta?: string
  objetivo?: string
  instituicao: string
  categoria: CategoriaSlug
  subcategoria?: string
  municipio: string
  regiao: string
  endereco?: string
  telefone?: string
  email?: string
  websiteUrl?: string
  registrationUrl?: string // link oficial de inscricao; nunca inventar
  modalidade: Modalidade
  faixaEtaria: '60+' | '65+' | '70+' | 'todas'
  gratuidade: Gratuidade
  acessibilidade?: AcessibilidadeInfo
  horarios?: string
  publicoAlvo?: string
  imagemUrl?: string
  tags: string[]
  fonteOficial?: string
  statusVerificacao: StatusVerificacao
  ultimaVerificacaoEm?: string // ISO date
  ativo: boolean // false = oculto de listas, busca e recomendações
  situacao: SituacaoPrograma
  situacaoObservacao?: string // mensagem exibida ao usuário
  situacaoAte?: string // data prevista de reabertura/retorno (AAAA-MM-DD)
  criadoEm: string
  atualizadoEm: string
}

export interface BoaPratica {
  id: string
  slug: string
  titulo: string
  categoria: 'saude' | 'atividade-fisica' | 'alimentacao' | 'saude-mental' | 'seguranca-digital' | 'autonomia'
  resumo: string
  conteudo: string
  passoAPasso?: string[]
  dicas?: string[]
  alertas?: string[]
  fontes?: string[]
  imagemUrl?: string
  criadoEm: string
  atualizadoEm: string
}

export interface PerfilUsuario {
  id: string
  nome: string
  email: string
  dataNascimento?: string
  faixaEtaria?: '60+' | '65+' | '70+' | 'todas'
  municipio: string
  avatarUrl?: string
  criadoEm: string
}

export interface PreferenciasUsuario {
  userId: string
  interesses: string[]
  oQueProcura: string[]
  categoriasPreferidas: CategoriaSlug[]
  modalidadePreferida: Modalidade | 'tanto_faz'
  distanciaPreferida: '5km' | '10km' | '25km' | 'qualquer'
  atualizadoEm: string
}

export interface Favorito {
  id: string
  userId: string
  programaId: string
  criadoEm: string
}

export interface FiltrosPrograma {
  busca?: string
  categoria?: CategoriaSlug
  regiao?: string
  faixaEtaria?: Programa['faixaEtaria']
  modalidade?: Modalidade
  gratuidade?: Gratuidade
  acessibilidade?: (keyof AcessibilidadeInfo)[]
}
