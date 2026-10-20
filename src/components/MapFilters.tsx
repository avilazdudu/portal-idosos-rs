import { useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import type { CategoriaSlug, FiltrosMapa, ModoDeslocamento } from '@/types'
import { categorias } from '@/data/categories'
import { municipiosReferencia } from '@/data/referenciasRS'
import { ROTULO_MODO } from '@/utils/geo'
import DistanceSelector from '@/components/DistanceSelector'
import LocationButton from '@/components/LocationButton'

interface Props {
  filtros: FiltrosMapa
  onChange: (filtros: FiltrosMapa) => void
  onBuscar: (texto: string) => void
  onProcurarEndereco: (texto: string) => void
  procurandoEndereco: boolean
  onUsarLocalizacao: () => void
  localizando: boolean
  temLocalizacaoDoUsuario: boolean
  municipioSelecionado: string
  onEscolherMunicipio: (nome: string) => void
  temReferencia: boolean
  onRemoverReferencia: () => void
  modo: ModoDeslocamento
  onModoChange: (modo: ModoDeslocamento) => void
  mostrarMinhasCategorias: boolean
  onLimpar: () => void
}

const campo =
  'min-h-12 w-full rounded-lg border-2 border-pampa-100 bg-white px-4 py-3 text-lg text-ink focus:border-pampa-400 focus:outline-none'

const modos: ModoDeslocamento[] = ['carro', 'a_pe', 'transporte_publico']

export default function MapFilters(props: Props) {
  const { filtros, onChange } = props
  const [texto, setTexto] = useState(filtros.busca ?? '')

  function aoEnviar(e: FormEvent) {
    e.preventDefault()
    props.onBuscar(texto)
  }

  function limpar() {
    setTexto('')
    props.onLimpar()
  }

  return (
    <div className="card-surface flex flex-col gap-6 p-5">
      <form onSubmit={aoEnviar} role="search" className="flex flex-col gap-3">
        <label htmlFor="busca-mapa" className="text-lg font-bold text-ink">
          Pesquisar por cidade, endereço ou atividade
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pampa-600"
              aria-hidden="true"
            />
            <input
              id="busca-mapa"
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ex.: Caxias do Sul, Sesc, dança"
              className={`${campo} pl-12`}
            />
          </div>
          <button
            type="submit"
            className="min-h-12 rounded-lg bg-pampa-600 px-6 py-3 text-lg font-bold text-white hover:bg-pampa-700"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => props.onProcurarEndereco(texto)}
            disabled={props.procurandoEndereco || texto.trim().length < 3}
            className="min-h-12 rounded-lg border-2 border-pampa-600 px-5 py-3 text-lg font-bold text-pampa-700 hover:bg-pampa-50 disabled:opacity-50"
          >
            {props.procurandoEndereco ? 'Procurando...' : 'Procurar endereço'}
          </button>
        </div>
        <p className="text-base text-ink-soft">
          “Procurar endereço” envia o que você digitou ao serviço OpenStreetMap para achar o ponto no mapa.
        </p>
      </form>

      <div className="grid gap-6 md:grid-cols-2">
        <LocationButton
          onClick={props.onUsarLocalizacao}
          carregando={props.localizando}
          ativo={props.temLocalizacaoDoUsuario}
        />
        <div>
          <label htmlFor="municipio-mapa" className="mb-2 block text-lg font-bold text-ink">
            Ou escolha um município
          </label>
          <select
            id="municipio-mapa"
            value={props.municipioSelecionado}
            onChange={(e) => e.target.value && props.onEscolherMunicipio(e.target.value)}
            className={campo}
          >
            <option value="">Escolher um município...</option>
            {municipiosReferencia.map((m) => (
              <option key={m.nome} value={m.nome}>
                {m.nome}
              </option>
            ))}
          </select>
          {props.temReferencia && (
            <button
              type="button"
              onClick={props.onRemoverReferencia}
              className="mt-2 text-base font-semibold text-pampa-700 underline"
            >
              Parar de usar este ponto de referência
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="categoria-mapa" className="mb-2 block text-lg font-bold text-ink">
            Categoria
          </label>
          <select
            id="categoria-mapa"
            value={filtros.categoria ?? ''}
            onChange={(e) => onChange({ ...filtros, categoria: (e.target.value as CategoriaSlug) || undefined })}
            className={campo}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <DistanceSelector
          valor={filtros.distanciaKm}
          onChange={(distanciaKm) => onChange({ ...filtros, distanciaKm })}
          temReferencia={props.temReferencia}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-3 text-lg text-ink">
          <input
            type="checkbox"
            checked={filtros.apenasGratuitas}
            onChange={(e) => onChange({ ...filtros, apenasGratuitas: e.target.checked })}
            className="h-6 w-6 rounded border-2 border-pampa-300 text-pampa-600"
          />
          Somente atividades gratuitas
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-lg text-ink">
          <input
            type="checkbox"
            checked={filtros.apenasPresenciais}
            onChange={(e) => onChange({ ...filtros, apenasPresenciais: e.target.checked })}
            className="h-6 w-6 rounded border-2 border-pampa-300 text-pampa-600"
          />
          Somente atividades presenciais
        </label>
        {props.mostrarMinhasCategorias && (
          <label className="flex cursor-pointer items-center gap-3 text-lg text-ink">
            <input
              type="checkbox"
              checked={filtros.apenasMinhasCategorias}
              onChange={(e) => onChange({ ...filtros, apenasMinhasCategorias: e.target.checked })}
              className="h-6 w-6 rounded border-2 border-pampa-300 text-pampa-600"
            />
            Mostrar só as minhas categorias favoritas
          </label>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-lg font-bold text-ink">Como você prefere ir?</legend>
        <div className="flex flex-wrap gap-2">
          {modos.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => props.onModoChange(m)}
              aria-pressed={props.modo === m}
              className={`min-h-12 rounded-full border-2 px-4 py-2 text-base font-semibold ${
                props.modo === m
                  ? 'border-pampa-600 bg-pampa-600 text-white'
                  : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
              }`}
            >
              {ROTULO_MODO[m]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-base text-ink-soft">
          Usado no botão “Como chegar”. O Google Maps mostra o que está disponível para cada trajeto.
        </p>
      </fieldset>

      <button
        type="button"
        onClick={limpar}
        className="min-h-12 w-fit rounded-lg border-2 border-pampa-100 px-5 py-3 text-lg font-semibold text-ink-soft hover:bg-cream-deep"
      >
        Limpar filtros
      </button>
    </div>
  )
}
