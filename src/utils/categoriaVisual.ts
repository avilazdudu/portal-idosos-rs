import type { CategoriaSlug } from '@/types'

// Cada categoria tem cor E símbolo: o mapa nunca depende só da cor para diferenciar atividades.
// As cores são escuras o bastante para dar contraste com a borda branca do marcador.
export interface VisualCategoria {
  emoji: string
  cor: string
}

export const visualCategoria: Record<CategoriaSlug, VisualCategoria> = {
  esporte: { emoji: '🏃', cor: '#B45309' },
  saude: { emoji: '❤️', cor: '#B91C1C' },
  convivencia: { emoji: '🤝', cor: '#7E22CE' },
  educacao: { emoji: '📚', cor: '#1D4ED8' },
  'inclusao-digital': { emoji: '📱', cor: '#0E7490' },
  'cultura-lazer': { emoji: '🎭', cor: '#BE185D' },
  assistencia: { emoji: '🏠', cor: '#15803D' },
  intergeracional: { emoji: '👨‍👩‍👧', cor: '#334155' },
}
