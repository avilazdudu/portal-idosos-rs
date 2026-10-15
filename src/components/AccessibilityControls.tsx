import { Type, Contrast, Waves } from 'lucide-react'
import { useAccessibility } from '@/contexts/AccessibilityContext'

export default function AccessibilityControls() {
  const { tamanhoTexto, setTamanhoTexto, contraste, setContraste, movimento, setMovimento } = useAccessibility()

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Controles de acessibilidade">
      <div className="flex items-center gap-1 rounded-lg border border-pampa-100 p-1">
        <Type className="ml-1 h-5 w-5 text-pampa-700" aria-hidden="true" />
        {(
          [
            ['normal', 'A'],
            ['grande', 'A+'],
            ['muito-grande', 'A++'],
          ] as const
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setTamanhoTexto(valor)}
            aria-pressed={tamanhoTexto === valor}
            className={`rounded px-2 py-1 text-sm font-bold ${
              tamanhoTexto === valor ? 'bg-pampa-600 text-white' : 'text-ink-soft hover:bg-cream-deep'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      <button
        onClick={() => setContraste(contraste === 'alto' ? 'normal' : 'alto')}
        aria-pressed={contraste === 'alto'}
        className={`flex items-center gap-1 rounded-lg border border-pampa-100 px-3 py-2 text-sm font-semibold ${
          contraste === 'alto' ? 'bg-pampa-600 text-white' : 'text-ink-soft hover:bg-cream-deep'
        }`}
      >
        <Contrast className="h-5 w-5" aria-hidden="true" />
        Alto contraste
      </button>

      <button
        onClick={() => setMovimento(movimento === 'reduzido' ? 'normal' : 'reduzido')}
        aria-pressed={movimento === 'reduzido'}
        className={`flex items-center gap-1 rounded-lg border border-pampa-100 px-3 py-2 text-sm font-semibold ${
          movimento === 'reduzido' ? 'bg-pampa-600 text-white' : 'text-ink-soft hover:bg-cream-deep'
        }`}
      >
        <Waves className="h-5 w-5" aria-hidden="true" />
        Reduzir animações
      </button>
    </div>
  )
}
