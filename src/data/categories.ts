import { Categoria } from '@/types'

// icone: nome do componente em lucide-react (ver components/CategoryCard.tsx)
export const categorias: Categoria[] = [
  { id: 'cat-esporte', slug: 'esporte', nome: 'Esporte e movimento', descricao: 'Atividades físicas adaptadas, caminhadas e modalidades esportivas.', icone: 'Activity' },
  { id: 'cat-saude', slug: 'saude', nome: 'Saúde e bem-estar', descricao: 'Consultas, prevenção, cuidados com visão, audição e medicamentos.', icone: 'HeartPulse' },
  { id: 'cat-convivencia', slug: 'convivencia', nome: 'Convivência e socialização', descricao: 'Grupos, encontros e atividades para fazer novos amigos.', icone: 'Users' },
  { id: 'cat-educacao', slug: 'educacao', nome: 'Educação', descricao: 'Cursos, universidades abertas e formação continuada.', icone: 'GraduationCap' },
  { id: 'cat-inclusao-digital', slug: 'inclusao-digital', nome: 'Inclusão digital', descricao: 'Aprender a usar celular, computador e internet com segurança.', icone: 'Smartphone' },
  { id: 'cat-cultura-lazer', slug: 'cultura-lazer', nome: 'Cultura e lazer', descricao: 'Passeios, turismo, artes e entretenimento.', icone: 'Drama' },
  { id: 'cat-assistencia', slug: 'assistencia', nome: 'Assistência', descricao: 'Cuidado diário, apoio social e serviços de assistência.', icone: 'HandHeart' },
  { id: 'cat-intergeracional', slug: 'intergeracional', nome: 'Intergeracional', descricao: 'Projetos que aproximam gerações diferentes.', icone: 'UsersRound' },
]

export function categoriaPorSlug(slug: string) {
  return categorias.find((c) => c.slug === slug)
}
