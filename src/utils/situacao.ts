import type { Programa, SituacaoPrograma } from '@/types'
import { formatarData } from '@/utils/format'

// ---------------------------------------------------------------------------
// Situação de um programa (diferente da verificação das informações):
//   aberto               -> funciona normalmente (sem aviso)
//   inscricoes_fechadas  -> continua visível, mas sem botão de inscrição
//   indisponivel         -> temporariamente fora do ar, sem botão de inscrição
// Para esconder um programa de todas as listas, use o campo "ativo" (false).
// ---------------------------------------------------------------------------

export interface InfoSituacao {
  situacao: SituacaoPrograma
  /** Texto curto do selo. Vazio quando o programa está aberto (nenhum aviso é exibido). */
  rotulo?: string
  /** Explicação para o usuário: observação do administrador + previsão de retorno. */
  mensagem?: string
  /** Se o botão de inscrição pode ser exibido. */
  inscricaoDisponivel: boolean
}

type DadosSituacao = Pick<Programa, 'situacao' | 'situacaoObservacao' | 'situacaoAte'>

function previsao(situacao: SituacaoPrograma, ate: string | undefined, agora: Date): string | undefined {
  if (!ate) return undefined
  const instante = Date.parse(ate)
  if (Number.isNaN(instante)) return undefined
  const termo = situacao === 'inscricoes_fechadas' ? 'reabertura' : 'retorno'
  if (instante >= agora.getTime() - 24 * 60 * 60 * 1000) {
    return `Previsão de ${termo}: ${formatarData(ate)}.`
  }
  // Nunca reabrimos automaticamente: a data passou, então pedimos confirmação.
  return `A data prevista de ${termo} já passou. Confirme a situação com a instituição.`
}

export function obterInfoSituacao(programa: DadosSituacao, agora: Date = new Date()): InfoSituacao {
  if (programa.situacao === 'aberto') return { situacao: 'aberto', inscricaoDisponivel: true }

  const rotulo = programa.situacao === 'inscricoes_fechadas' ? 'Inscrições fechadas' : 'Temporariamente indisponível'
  const observacao = programa.situacaoObservacao?.trim()
  const dataPrevista = previsao(programa.situacao, programa.situacaoAte, agora)
  const mensagem =
    [observacao, dataPrevista].filter(Boolean).join(' ') || 'Consulte a instituição responsável para saber mais.'

  return { situacao: programa.situacao, rotulo, mensagem, inscricaoDisponivel: false }
}

export interface EntradaSituacao {
  ativo?: boolean
  situacao?: SituacaoPrograma
  observacao?: string
  /** Data prevista de reabertura/retorno, no formato AAAA-MM-DD. */
  ate?: string
}

export function validarEntradaSituacao(entrada: EntradaSituacao): string[] {
  const erros: string[] = []
  if (entrada.ate && (!/^\d{4}-\d{2}-\d{2}$/.test(entrada.ate) || Number.isNaN(Date.parse(entrada.ate)))) {
    erros.push('A data prevista deve estar no formato AAAA-MM-DD (ex.: 2026-03-01).')
  }
  if (entrada.observacao && entrada.observacao.length > 300) {
    erros.push('A observação deve ter no máximo 300 caracteres.')
  }
  return erros
}
