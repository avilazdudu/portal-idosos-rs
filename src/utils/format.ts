export function formatarData(iso?: string): string {
  if (!iso) return 'Não informado'
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
  } catch {
    return 'Não informado'
  }
}

export const rotuloModalidade: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido',
}

export const rotuloGratuidade: Record<string, string> = {
  gratuito: 'Gratuito',
  pago: 'Pago',
  gratuito_ou_pago: 'Gratuito ou pago',
}

export const rotuloFaixaEtaria: Record<string, string> = {
  '60+': '60+',
  '65+': '65+',
  '70+': '70+',
  todas: 'Todas as idades',
}
