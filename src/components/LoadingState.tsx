export default function LoadingState({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pampa-100 border-t-pampa-600" />
      <p className="text-lg font-medium text-ink-soft">{texto}</p>
    </div>
  )
}
