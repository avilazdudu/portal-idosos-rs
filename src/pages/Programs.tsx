import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { programService } from '@/services/programService'
import { Programa, FiltrosPrograma, CategoriaSlug } from '@/types'
import ProgramCard from '@/components/ProgramCard'
import FilterPanel from '@/components/FilterPanel'
import SearchBar from '@/components/SearchBar'
import { filtrarProgramas } from '@/utils/filtros'
import EmptyState from '@/components/EmptyState'
import LoadingState from '@/components/LoadingState'

export default function Programs() {
  const [searchParams] = useSearchParams()
  const [todos, setTodos] = useState<Programa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosPrograma>({
    categoria: (searchParams.get('categoria') as CategoriaSlug) || undefined,
    regiao: searchParams.get('regiao') || undefined,
  })
  const [painelAberto, setPainelAberto] = useState(false)

  useEffect(() => {
    programService.listar().then((lista) => {
      setTodos(lista)
      setCarregando(false)
    })
  }, [])

  const resultado = useMemo(() => filtrarProgramas(todos, filtros), [todos, filtros])

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Programas</h1>
      <p className="mt-1 text-lg text-ink-soft">
        {carregando ? 'Carregando...' : `${resultado.length} programa${resultado.length === 1 ? '' : 's'} encontrado${resultado.length === 1 ? '' : 's'}`}
      </p>

      <div className="mt-6">
        <SearchBar valorInicial={filtros.busca} onBuscar={(termo) => setFiltros((f) => ({ ...f, busca: termo || undefined }))} />
      </div>

      <button
        onClick={() => setPainelAberto(true)}
        className="mt-4 flex items-center gap-2 rounded-lg border-2 border-pampa-600 px-4 py-3 text-lg font-semibold text-pampa-700 lg:hidden"
      >
        <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
        Filtros
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel filtros={filtros} onChange={setFiltros} />
        </aside>

        {painelAberto && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPainelAberto(false)} />
            <div className="relative ml-auto h-full w-full max-w-sm overflow-y-auto bg-cream p-4">
              <button
                onClick={() => setPainelAberto(false)}
                aria-label="Fechar filtros"
                className="mb-3 ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-semibold text-ink-soft"
              >
                <X className="h-6 w-6" aria-hidden="true" />
                Fechar
              </button>
              <FilterPanel filtros={filtros} onChange={setFiltros} />
            </div>
          </div>
        )}

        <div>
          {carregando ? (
            <LoadingState texto="Carregando programas..." />
          ) : resultado.length === 0 ? (
            <EmptyState
              titulo="Não encontramos atividades com esses filtros."
              descricao="Tente mudar a região, a categoria ou limpar os filtros para ver mais opções."
              acao={
                <button onClick={() => setFiltros({})} className="rounded-lg bg-pampa-600 px-5 py-3 text-lg font-semibold text-white">
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {resultado.map((p) => (
                <ProgramCard key={p.id} programa={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
