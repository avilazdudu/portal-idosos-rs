import type { DistanciaKm } from '@/types'

const opcoes: { valor: DistanciaKm | null; rotulo: string }[] = [
  { valor: 5, rotulo: 'Até 5 km' },
  { valor: 10, rotulo: 'Até 10 km' },
  { valor: 25, rotulo: 'Até 25 km' },
  { valor: 50, rotulo: 'Até 50 km' },
  { valor: null, rotulo: 'Qualquer distância' },
]

export default function DistanceSelector({
  valor,
  onChange,
  temReferencia,
}: {
  valor: DistanciaKm | null
  onChange: (valor: DistanciaKm | null) => void
  temReferencia: boolean
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-bold text-ink">Distância</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((op) => (
          <button
            key={op.rotulo}
            type="button"
            onClick={() => onChange(op.valor)}
            aria-pressed={valor === op.valor}
            className={`min-h-12 rounded-full border-2 px-4 py-2 text-base font-semibold ${
              valor === op.valor
                ? 'border-pampa-600 bg-pampa-600 text-white'
                : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
            }`}
          >
            {op.rotulo}
          </button>
        ))}
      </div>
      <p className="mt-2 text-base text-ink-soft">
        {temReferencia
          ? 'A distância é uma estimativa em linha reta, não o caminho pelas ruas.'
          : 'Para filtrar por distância, use sua localização ou escolha um município.'}
      </p>
    </fieldset>
  )
}
