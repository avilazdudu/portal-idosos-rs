import { MapPin } from 'lucide-react'

export default function LocationButton({
  onClick,
  carregando,
  ativo,
}: {
  onClick: () => void
  carregando: boolean
  ativo: boolean
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={carregando}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-pampa-600 px-5 py-3 text-lg font-bold text-white hover:bg-pampa-700 disabled:opacity-60 sm:w-auto"
      >
        <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
        {carregando ? 'Procurando sua localização...' : ativo ? 'Atualizar minha localização' : 'Usar minha localização'}
      </button>
      <p className="mt-2 max-w-prose2 text-base text-ink-soft">
        Permita o acesso à sua localização para encontrarmos atividades perto de você. Sua posição fica só neste
        aparelho: não é guardada no nosso banco de dados.
      </p>
    </div>
  )
}
