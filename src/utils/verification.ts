import type { Programa, StatusVerificacao } from '@/types'

// ---------------------------------------------------------------------------
// Regras de verificação de programas
//
// O status que aparece para o usuário (🟢 / 🟡 / 🔴) NÃO é só o campo salvo no banco:
// ele é calculado a partir de três dados do programa —
//   fonteOficial, ultimaVerificacaoEm e statusVerificacao —
// para que uma informação "verificada" envelheça sozinha e nunca fique verde para sempre.
// ---------------------------------------------------------------------------

/** Até este número de dias após a verificação, o programa aparece como 🟢 verificado. */
export const DIAS_VERIFICACAO_VALIDA = 90
/** Acima deste número de dias, o programa passa a 🔴 desatualizado. */
export const DIAS_LIMITE_DESATUALIZADO = 180

const MS_POR_DIA = 24 * 60 * 60 * 1000

export interface ResultadoVerificacao {
  status: StatusVerificacao
  /** Explicação em linguagem simples, exibida ao usuário e útil para o administrador. */
  motivo: string
  /** Dias desde a última verificação (quando há data válida). */
  dias?: number
}

type DadosVerificacao = Pick<Programa, 'statusVerificacao' | 'fonteOficial' | 'ultimaVerificacaoEm'>

function diasDesde(iso: string, agora: Date): number | null {
  const instante = Date.parse(iso)
  if (Number.isNaN(instante)) return null
  return Math.floor((agora.getTime() - instante) / MS_POR_DIA)
}

function textoDias(dias: number): string {
  if (dias <= 0) return 'hoje'
  if (dias === 1) return 'há 1 dia'
  return `há ${dias} dias`
}

export function calcularStatusVerificacao(programa: DadosVerificacao, agora: Date = new Date()): ResultadoVerificacao {
  // 1. Um administrador pode marcar manualmente como desatualizado (ex.: link quebrado).
  if (programa.statusVerificacao === 'desatualizado') {
    return { status: 'desatualizado', motivo: 'Um administrador marcou esta informação como desatualizada.' }
  }

  // 2. Sem fonte oficial não existe verificação possível.
  if (!programa.fonteOficial || !programa.fonteOficial.trim()) {
    return { status: 'revisar', motivo: 'Nenhuma fonte oficial foi cadastrada para este programa.' }
  }

  // 3. Sem data (ou com data inválida), não dá para saber se a informação ainda vale.
  if (!programa.ultimaVerificacaoEm) {
    return { status: 'revisar', motivo: 'A data da última verificação não foi cadastrada.' }
  }
  const dias = diasDesde(programa.ultimaVerificacaoEm, agora)
  if (dias === null || dias < 0) {
    return { status: 'revisar', motivo: 'A data da última verificação é inválida.' }
  }

  // 4. Existe fonte e data, mas ninguém marcou como verificado.
  if (programa.statusVerificacao !== 'verificado') {
    return { status: 'revisar', motivo: 'As informações ainda não foram confirmadas por um administrador.', dias }
  }

  // 5. Verificado: a validade depende da idade da verificação.
  if (dias > DIAS_LIMITE_DESATUALIZADO) {
    return {
      status: 'desatualizado',
      motivo: `Última verificação ${textoDias(dias)}. Passou de ${DIAS_LIMITE_DESATUALIZADO} dias: as informações podem estar desatualizadas.`,
      dias,
    }
  }
  if (dias > DIAS_VERIFICACAO_VALIDA) {
    return {
      status: 'revisar',
      motivo: `Última verificação ${textoDias(dias)}. Recomenda-se conferir de novo (validade de ${DIAS_VERIFICACAO_VALIDA} dias).`,
      dias,
    }
  }
  return { status: 'verificado', motivo: `Verificado ${textoDias(dias)} com base em: ${programa.fonteOficial.trim()}.`, dias }
}

// ---------------------------------------------------------------------------
// Validação dos dados informados por quem verifica o programa
// ---------------------------------------------------------------------------

export interface EntradaVerificacao {
  fonteOficial: string
  registrationUrl?: string
  websiteUrl?: string
}

export function urlValida(valor: string): boolean {
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

/** Retorna a lista de problemas encontrados (vazia quando a entrada é válida). */
export function validarEntradaVerificacao(entrada: EntradaVerificacao): string[] {
  const erros: string[] = []
  if (!entrada.fonteOficial || !entrada.fonteOficial.trim()) {
    erros.push('Informe a fonte oficial (nome do órgão ou endereço da página consultada).')
  }
  if (entrada.registrationUrl && !urlValida(entrada.registrationUrl)) {
    erros.push('O link de inscrição não é um endereço válido (use http:// ou https://).')
  }
  if (entrada.websiteUrl && !urlValida(entrada.websiteUrl)) {
    erros.push('O site oficial não é um endereço válido (use http:// ou https://).')
  }
  return erros
}
