import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, List, Map as MapIcon } from 'lucide-react'
import type {
  DistanciaKm,
  FiltrosMapa,
  LocalAtendimento,
  ModoDeslocamento,
  PontoReferencia,
  PreferenciasUsuario,
  Programa,
} from '@/types'
import { municipiosReferencia } from '@/data/referenciasRS'
import { useAuth } from '@/contexts/AuthContext'
import { programService } from '@/services/programService'
import { mapService } from '@/services/mapService'
import { preferenceService } from '@/services/preferenceService'
import { ErroGeolocalizacao, obterPosicaoAtual } from '@/services/geolocationService'
import { ErroGeocodificacao, geocodificarEndereco } from '@/services/geocodingService'
import {
  FILTROS_MAPA_INICIAIS,
  ehMapeavel,
  filtrarAtividades,
  filtrarPorDistancia,
  montarAtividades,
  ordenarAtividades,
} from '@/utils/filtrosMapa'
import { normalizar } from '@/utils/text'
import MapFilters from '@/components/MapFilters'
import MapErrorBoundary from '@/components/MapErrorBoundary'
import NearbyActivitiesList from '@/components/NearbyActivitiesList'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'

// O mapa (Leaflet) é carregado só quando a página é aberta, para não pesar no resto do site.
const ActivityMap = lazy(() => import('@/components/ActivityMap'))

const DISTANCIA_DAS_PREFERENCIAS: Record<PreferenciasUsuario['distanciaPreferida'], DistanciaKm | null> = {
  '5km': 5,
  '10km': 10,
  '25km': 25,
  qualquer: null,
}

type StatusLocalizacao = { tipo: 'parado' } | { tipo: 'carregando' } | { tipo: 'ok' } | { tipo: 'erro'; mensagem: string }

function textoQuantidade(n: number): string {
  if (n === 0) return 'Não encontramos atividades'
  return `Encontramos ${n} ${n === 1 ? 'atividade' : 'atividades'}`
}

export default function MapPage() {
  const { usuario } = useAuth()

  const [programas, setProgramas] = useState<Programa[]>([])
  const [locais, setLocais] = useState<LocalAtendimento[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroDados, setErroDados] = useState<string | null>(null)
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null)

  const [filtros, setFiltros] = useState<FiltrosMapa>(FILTROS_MAPA_INICIAIS)
  const [referencia, setReferencia] = useState<PontoReferencia | null>(null)
  const [municipioSelecionado, setMunicipioSelecionado] = useState('')
  const [statusLocalizacao, setStatusLocalizacao] = useState<StatusLocalizacao>({ tipo: 'parado' })
  const [procurandoEndereco, setProcurandoEndereco] = useState(false)
  const [avisoEndereco, setAvisoEndereco] = useState<string | null>(null)
  const [modo, setModo] = useState<ModoDeslocamento>('carro')

  const [selecionadoId, setSelecionadoId] = useState<string | null>(null)
  const [foco, setFoco] = useState<{ id: string; seq: number } | null>(null)
  const [ajusteSeq, setAjusteSeq] = useState(0)
  const [visao, setVisao] = useState<'mapa' | 'lista'>('mapa')

  const preferenciasAplicadas = useRef(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErroDados(null)
    try {
      const [listaProgramas, listaLocais] = await Promise.all([programService.listar(), mapService.listarLocais()])
      setProgramas(listaProgramas)
      setLocais(listaLocais)
    } catch {
      setErroDados('Não foi possível carregar as atividades agora. Verifique sua internet e tente de novo.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Preferências do usuário: destacam categorias favoritas e preenchem modalidade e distância iniciais.
  useEffect(() => {
    if (!usuario) {
      setPreferencias(null)
      preferenciasAplicadas.current = false
      return
    }
    preferenceService
      .buscar(usuario.id)
      .then((prefs) => {
        setPreferencias(prefs)
        if (prefs && !preferenciasAplicadas.current) {
          preferenciasAplicadas.current = true
          setFiltros((f) => ({
            ...f,
            apenasPresenciais: prefs.modalidadePreferida === 'presencial' ? true : f.apenasPresenciais,
            distanciaKm: DISTANCIA_DAS_PREFERENCIAS[prefs.distanciaPreferida] ?? f.distanciaKm,
          }))
        }
      })
      .catch(() => setPreferencias(null))
  }, [usuario])

  const atividades = useMemo(
    () => montarAtividades(programas, locais, referencia, preferencias),
    [programas, locais, referencia, preferencias],
  )
  const baseFiltrada = useMemo(() => filtrarAtividades(atividades, filtros), [atividades, filtros])
  const noMapa = useMemo(
    () =>
      ordenarAtividades(
        filtrarPorDistancia(baseFiltrada.filter(ehMapeavel), filtros.distanciaKm, referencia),
        referencia !== null,
      ),
    [baseFiltrada, filtros.distanciaKm, referencia],
  )
  const semLocalizacao = useMemo(
    () =>
      ordenarAtividades(
        baseFiltrada.filter((a) => !a.coordenadas),
        false,
      ),
    [baseFiltrada],
  )
  const existeAlgumLocalNoMapa = atividades.some((a) => a.coordenadas !== null)
  const programasSemLocal = programas.filter((p) => !locais.some((l) => l.programaId === p.id))

  function atualizarFiltros(proximos: FiltrosMapa) {
    setFiltros(proximos)
  }

  function aoBuscar(texto: string) {
    const termo = texto.trim()
    setAvisoEndereco(null)
    // Se for um município conhecido, vira ponto de referência (não filtra por texto):
    // assim aparecem também as atividades das cidades vizinhas.
    const municipio = municipiosReferencia.find((m) => normalizar(m.nome) === normalizar(termo))
    if (municipio) {
      escolherMunicipio(municipio.nome)
      setFiltros((f) => ({ ...f, busca: undefined }))
    } else {
      setFiltros((f) => ({ ...f, busca: termo || undefined }))
      setAjusteSeq((n) => n + 1)
    }
  }

  function escolherMunicipio(nome: string) {
    const municipio = municipiosReferencia.find((m) => m.nome === nome)
    if (!municipio) return
    setMunicipioSelecionado(nome)
    setStatusLocalizacao({ tipo: 'parado' })
    setAvisoEndereco(null)
    setReferencia({
      tipo: 'municipio',
      rotulo: `${municipio.nome} (centro aproximado)`,
      latitude: municipio.latitude,
      longitude: municipio.longitude,
    })
  }

  async function usarLocalizacao() {
    setStatusLocalizacao({ tipo: 'carregando' })
    setAvisoEndereco(null)
    try {
      const posicao = await obterPosicaoAtual()
      setMunicipioSelecionado('')
      setReferencia({ tipo: 'usuario', rotulo: 'Você está aqui', ...posicao })
      setStatusLocalizacao({ tipo: 'ok' })
    } catch (erro) {
      const mensagem =
        erro instanceof ErroGeolocalizacao
          ? erro.message
          : 'Não conseguimos descobrir sua localização. Escolha um município na lista.'
      setStatusLocalizacao({ tipo: 'erro', mensagem })
    }
  }

  async function procurarEndereco(texto: string) {
    setProcurandoEndereco(true)
    setAvisoEndereco(null)
    try {
      const resultado = await geocodificarEndereco(texto)
      if (!resultado) {
        setAvisoEndereco(
          'Não encontramos esse endereço no Rio Grande do Sul. Tente escrever o município junto, por exemplo: “Rua Marquês do Herval, 827, São Leopoldo”.',
        )
        return
      }
      setMunicipioSelecionado('')
      setStatusLocalizacao({ tipo: 'parado' })
      setFiltros((f) => ({ ...f, busca: undefined }))
      setReferencia({
        tipo: 'endereco',
        rotulo: `Endereço pesquisado: ${resultado.descricao}`,
        latitude: resultado.latitude,
        longitude: resultado.longitude,
      })
    } catch (erro) {
      setAvisoEndereco(
        erro instanceof ErroGeocodificacao ? erro.message : 'Não foi possível procurar o endereço agora. Tente de novo.',
      )
    } finally {
      setProcurandoEndereco(false)
    }
  }

  function removerReferencia() {
    setReferencia(null)
    setMunicipioSelecionado('')
    setStatusLocalizacao({ tipo: 'parado' })
  }

  function limparFiltros() {
    setFiltros(FILTROS_MAPA_INICIAIS)
    setAvisoEndereco(null)
    setAjusteSeq((n) => n + 1)
  }

  function verNoMapa(id: string) {
    setSelecionadoId(id)
    setFoco((anterior) => ({ id, seq: (anterior?.seq ?? 0) + 1 }))
    setVisao('mapa')
  }

  const nomeDaReferencia = referencia ? referencia.rotulo : null
  const resumoRegiao = !referencia
    ? 'no mapa do Rio Grande do Sul'
    : filtros.distanciaKm
      ? `a até ${filtros.distanciaKm} km (em linha reta) de ${nomeDaReferencia}`
      : `ordenadas por proximidade de ${nomeDaReferencia}`

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Encontre atividades perto de você</h1>
      <p className="mt-2 max-w-prose2 text-xl text-ink-soft">
        Descubra programas, serviços e atividades para viver melhor perto da sua casa.
      </p>

      <div className="mt-6">
        <MapFilters
          filtros={filtros}
          onChange={atualizarFiltros}
          onBuscar={aoBuscar}
          onProcurarEndereco={procurarEndereco}
          procurandoEndereco={procurandoEndereco}
          onUsarLocalizacao={usarLocalizacao}
          localizando={statusLocalizacao.tipo === 'carregando'}
          temLocalizacaoDoUsuario={referencia?.tipo === 'usuario'}
          municipioSelecionado={municipioSelecionado}
          onEscolherMunicipio={escolherMunicipio}
          temReferencia={referencia !== null}
          onRemoverReferencia={removerReferencia}
          modo={modo}
          onModoChange={setModo}
          mostrarMinhasCategorias={Boolean(preferencias && preferencias.categoriasPreferidas.length > 0)}
          onLimpar={limparFiltros}
        />
      </div>

      <div aria-live="polite" className="mt-4 flex flex-col gap-3">
        {statusLocalizacao.tipo === 'ok' && (
          <p className="rounded-lg bg-pampa-50 p-4 text-lg text-pampa-800">
            Mostrando as atividades em relação à sua localização. A localização do aparelho pode ter pequenas
            imprecisões.
          </p>
        )}
        {statusLocalizacao.tipo === 'erro' && (
          <p role="alert" className="rounded-lg bg-[#FBF3DF] p-4 text-lg text-ink">
            {statusLocalizacao.mensagem}
          </p>
        )}
        {avisoEndereco && (
          <p role="alert" className="rounded-lg bg-[#FBF3DF] p-4 text-lg text-ink">
            {avisoEndereco}
          </p>
        )}
      </div>

      {carregando ? (
        <LoadingState texto="Carregando atividades..." />
      ) : erroDados ? (
        <div className="mt-6">
          <EmptyState
            titulo="Não foi possível carregar as atividades"
            descricao={erroDados}
            acao={
              <button
                type="button"
                onClick={carregar}
                className="min-h-12 rounded-lg bg-pampa-600 px-5 py-3 text-lg font-bold text-white hover:bg-pampa-700"
              >
                Tentar de novo
              </button>
            }
          />
        </div>
      ) : (
        <>
          <p role="status" className="mt-6 text-xl font-bold text-ink">
            {textoQuantidade(noMapa.length)} com localização verificada {resumoRegiao}.
          </p>

          {!existeAlgumLocalNoMapa && (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-cream-deep p-4 text-lg text-ink-soft">
              <Info className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
              Ainda não há locais com posição verificada para mostrar no mapa. As atividades já cadastradas aparecem
              na lista, com o botão “Como chegar” pelo endereço.
            </p>
          )}

          <div className="mt-4 flex gap-2 lg:hidden" role="group" aria-label="Escolha como ver as atividades">
            <button
              type="button"
              onClick={() => setVisao('mapa')}
              aria-pressed={visao === 'mapa'}
              className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-lg font-bold ${
                visao === 'mapa' ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-600 text-pampa-700'
              }`}
            >
              <MapIcon className="h-5 w-5" aria-hidden="true" />
              Mapa
            </button>
            <button
              type="button"
              onClick={() => setVisao('lista')}
              aria-pressed={visao === 'lista'}
              className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-lg font-bold ${
                visao === 'lista' ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-600 text-pampa-700'
              }`}
            >
              <List className="h-5 w-5" aria-hidden="true" />
              Lista
            </button>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
            <section aria-label="Mapa" className={`${visao === 'mapa' ? 'block' : 'hidden'} lg:block`}>
              <MapErrorBoundary>
                <Suspense fallback={<LoadingState texto="Carregando o mapa..." />}>
                  <ActivityMap
                    atividades={noMapa}
                    selecionadoId={selecionadoId}
                    onSelecionar={setSelecionadoId}
                    foco={foco}
                    referencia={referencia}
                    raioKm={filtros.distanciaKm}
                    ajusteSeq={ajusteSeq}
                    modo={modo}
                  />
                </Suspense>
              </MapErrorBoundary>
            </section>

            <section
              aria-label="Lista de atividades"
              className={`${visao === 'lista' ? 'block' : 'hidden'} lg:block lg:max-h-[75vh] lg:overflow-y-auto lg:pr-2`}
            >
              {noMapa.length > 0 ? (
                <NearbyActivitiesList
                  atividades={noMapa}
                  selecionadoId={selecionadoId}
                  onVerNoMapa={verNoMapa}
                  modo={modo}
                  referencia={referencia}
                />
              ) : (
                <EmptyState
                  titulo="Nenhuma atividade no mapa com esses filtros"
                  descricao="Não encontramos atividades com esses filtros. Você pode aumentar a distância da busca ou escolher outra cidade."
                />
              )}

              {semLocalizacao.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-ink">Locais sem posição verificada no mapa</h2>
                  <p className="mt-1 text-lg text-ink-soft">
                    Estes locais têm endereço cadastrado, mas ainda não aparecem no mapa nem entram no filtro de
                    distância, porque a posição exata não foi conferida.
                  </p>
                  <div className="mt-4">
                    <NearbyActivitiesList
                      atividades={semLocalizacao}
                      selecionadoId={selecionadoId}
                      onVerNoMapa={verNoMapa}
                      modo={modo}
                      referencia={referencia}
                      semMapa
                    />
                  </div>
                </div>
              )}

              {programasSemLocal.length > 0 && (
                <p className="mt-8 rounded-lg bg-cream-deep p-4 text-lg text-ink-soft">
                  {programasSemLocal.length} {programasSemLocal.length === 1 ? 'programa não tem' : 'programas não têm'}{' '}
                  local de atendimento cadastrado (por exemplo, programas online, estaduais ou ainda em
                  levantamento). Veja todos em{' '}
                  <Link to="/programas" className="font-semibold text-pampa-700 underline">
                    Programas
                  </Link>
                  .
                </p>
              )}
            </section>
          </div>

          <p className="mt-8 max-w-prose2 text-base text-ink-soft">
            Privacidade: sua localização é usada só neste aparelho para calcular a distância. Ao tocar em “Como
            chegar”, a posição de partida é enviada ao Google Maps para traçar a rota. As distâncias mostradas são
            estimativas em linha reta.
          </p>
        </>
      )}
    </div>
  )
}
