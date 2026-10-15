import { Programa, PreferenciasUsuario } from '@/types'
import { normalizar } from '@/utils/text'

// Sistema de recomendação do MVP: baseado em regras e nas preferências
// cadastradas pelo usuário, sem depender de IA (conforme especificação).
// Cada programa recebe uma pontuação simples e a lista é ordenada por ela.
// As comparações ignoram acentos e maiúsculas.
const OBJETIVOS_POR_CATEGORIA: { objetivo: string; categoria: Programa['categoria'] }[] = [
  { objetivo: 'Fazer novos amigos', categoria: 'convivencia' },
  { objetivo: 'Praticar exercícios', categoria: 'esporte' },
  { objetivo: 'Aprender tecnologia', categoria: 'inclusao-digital' },
  { objetivo: 'Cuidar melhor da saúde', categoria: 'saude' },
]

export function recomendarProgramas(programas: Programa[], preferencias: PreferenciasUsuario | null, limite = 6): Programa[] {
  if (!preferencias) return []

  const interesses = preferencias.interesses.map(normalizar)
  const procura = preferencias.oQueProcura.map(normalizar)

  const pontuados = programas.map((programa) => {
    let pontos = 0

    if (preferencias.categoriasPreferidas.includes(programa.categoria)) pontos += 3

    const textoPrograma = normalizar(`${programa.nome} ${programa.descricao} ${programa.tags.join(' ')}`)
    for (const interesse of interesses) {
      if (textoPrograma.includes(interesse)) pontos += 2
    }

    if (
      preferencias.modalidadePreferida !== 'tanto_faz' &&
      (programa.modalidade === preferencias.modalidadePreferida || programa.modalidade === 'hibrido')
    ) {
      pontos += 1
    }

    for (const { objetivo, categoria } of OBJETIVOS_POR_CATEGORIA) {
      if (procura.includes(normalizar(objetivo)) && programa.categoria === categoria) pontos += 2
    }

    return { programa, pontos }
  })

  return pontuados
    .filter((p) => p.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite)
    .map((p) => p.programa)
}
