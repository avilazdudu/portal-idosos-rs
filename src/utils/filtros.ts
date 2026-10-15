import { FiltrosPrograma, Programa } from '@/types'
import { normalizar } from '@/utils/text'

// Única implementação de filtragem de programas, usada tanto pela página /programas
// quanto pelo programService (modo demonstração e Supabase).
export function filtrarProgramas(programas: Programa[], filtros?: FiltrosPrograma): Programa[] {
  if (!filtros) return programas
  const termo = filtros.busca ? normalizar(filtros.busca) : ''

  return programas.filter((p) => {
    if (filtros.categoria && p.categoria !== filtros.categoria) return false
    if (filtros.regiao && p.regiao !== filtros.regiao) return false
    if (filtros.faixaEtaria && p.faixaEtaria !== filtros.faixaEtaria && p.faixaEtaria !== 'todas') return false
    if (filtros.modalidade && p.modalidade !== filtros.modalidade) return false
    if (filtros.gratuidade && p.gratuidade !== filtros.gratuidade && p.gratuidade !== 'gratuito_ou_pago') return false
    if (filtros.acessibilidade?.length) {
      const ok = filtros.acessibilidade.every((chave) => p.acessibilidade?.[chave])
      if (!ok) return false
    }
    if (termo) {
      const alvo = normalizar(`${p.nome} ${p.descricao} ${p.instituicao} ${p.municipio} ${p.tags.join(' ')}`)
      if (!alvo.includes(termo)) return false
    }
    return true
  })
}
