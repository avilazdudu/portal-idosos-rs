import { Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({
  valorInicial = '',
  onBuscar,
}: {
  valorInicial?: string
  onBuscar: (termo: string) => void
}) {
  const [termo, setTermo] = useState(valorInicial)

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onBuscar(termo)
      }}
      className="flex w-full items-center gap-2 rounded-xl border-2 border-pampa-100 bg-white p-2 focus-within:border-pampa-400"
    >
      <Search className="ml-2 h-6 w-6 shrink-0 text-pampa-600" aria-hidden="true" />
      <label htmlFor="busca-programas" className="sr-only">
        O que você está procurando?
      </label>
      <input
        id="busca-programas"
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="O que você está procurando? Ex: vôlei, curso de celular, Porto Alegre"
        className="w-full bg-transparent py-2 text-lg text-ink placeholder:text-ink-soft/70 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-pampa-600 px-5 py-3 text-lg font-semibold text-white hover:bg-pampa-700"
      >
        Buscar
      </button>
    </form>
  )
}
