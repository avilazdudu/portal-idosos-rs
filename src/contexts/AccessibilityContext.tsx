import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { readLocal, writeLocal } from '@/lib/storage'

type TamanhoTexto = 'normal' | 'grande' | 'muito-grande'
type Contraste = 'normal' | 'alto'
type Movimento = 'normal' | 'reduzido'

interface AccessibilityState {
  tamanhoTexto: TamanhoTexto
  contraste: Contraste
  movimento: Movimento
  setTamanhoTexto: (v: TamanhoTexto) => void
  setContraste: (v: Contraste) => void
  setMovimento: (v: Movimento) => void
}

const AccessibilityContext = createContext<AccessibilityState | null>(null)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [tamanhoTexto, setTamanhoTexto] = useState<TamanhoTexto>(() => readLocal<TamanhoTexto>('a11y-texto', 'normal'))
  const [contraste, setContraste] = useState<Contraste>(() => readLocal<Contraste>('a11y-contraste', 'normal'))
  const [movimento, setMovimento] = useState<Movimento>(() => readLocal<Movimento>('a11y-movimento', 'normal'))

  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', tamanhoTexto)
    writeLocal('a11y-texto', tamanhoTexto)
  }, [tamanhoTexto])

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', contraste)
    writeLocal('a11y-contraste', contraste)
  }, [contraste])

  useEffect(() => {
    document.documentElement.setAttribute('data-motion', movimento)
    writeLocal('a11y-movimento', movimento)
  }, [movimento])

  return (
    <AccessibilityContext.Provider
      value={{ tamanhoTexto, contraste, movimento, setTamanhoTexto, setContraste, setMovimento }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  return ctx
}
