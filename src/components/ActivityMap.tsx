import { useEffect, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { divIcon, latLngBounds, type DivIcon, type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Map as MapIcon, MapPin, Minus, Plus } from 'lucide-react'
import type { AtividadeMapeavel, CategoriaSlug, ModoDeslocamento, PontoReferencia, TipoReferencia } from '@/types'
import { LIMITES_RS_LEAFLET } from '@/utils/geo'
import { visualCategoria } from '@/utils/categoriaVisual'
import ActivityPopup from '@/components/ActivityPopup'

// Provedor de mapas: OpenStreetMap (atribuição obrigatória exibida no mapa).
// O servidor público de tiles é para uso leve: em produção com muito acesso, use um provedor
// próprio definindo VITE_MAP_TILE_URL e VITE_MAP_TILE_ATTRIBUTION (veja docs/MAPA.md).
const TILE_URL = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUICAO =
  import.meta.env.VITE_MAP_TILE_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">Colaboradores do OpenStreetMap</a>'

interface Props {
  atividades: AtividadeMapeavel[]
  selecionadoId: string | null
  onSelecionar: (id: string) => void
  /** Pedido para centralizar em um marcador (vem da lista); seq muda a cada pedido. */
  foco: { id: string; seq: number } | null
  referencia: PontoReferencia | null
  raioKm: number | null
  /** Muda quando a pessoa faz uma busca: ajusta o mapa para mostrar os resultados. */
  ajusteSeq: number
  modo: ModoDeslocamento
}

function animar(): boolean {
  return document.documentElement.getAttribute('data-motion') !== 'reduzido'
}

function zoomPorRaio(raioKm: number | null): number {
  if (!raioKm) return 12
  if (raioKm <= 5) return 13
  if (raioKm <= 10) return 12
  if (raioKm <= 25) return 11
  return 10
}

const cacheIcones = new Map<string, DivIcon>()

function iconeAtividade(categoria: CategoriaSlug, selecionado: boolean, preferida: boolean): DivIcon {
  const chave = `${categoria}|${selecionado}|${preferida}`
  const existente = cacheIcones.get(chave)
  if (existente) return existente

  const { emoji, cor } = visualCategoria[categoria]
  const tamanho = selecionado ? 48 : 40
  const anel = selecionado ? '0 0 0 4px #C9642B,' : ''
  const estrela = preferida
    ? '<span style="position:absolute;top:-8px;right:-8px;width:20px;height:20px;border-radius:50%;background:#FFFFFF;border:2px solid #C9642B;color:#8C3F19;font-size:12px;line-height:16px;text-align:center">★</span>'
    : ''
  const html =
    `<div aria-hidden="true" style="position:relative;display:flex;align-items:center;justify-content:center;` +
    `width:${tamanho}px;height:${tamanho}px;border-radius:50%;background:${cor};border:3px solid #FFFFFF;` +
    `box-shadow:${anel}0 2px 6px rgba(0,0,0,.45);font-size:${selecionado ? 24 : 20}px;line-height:1">${emoji}${estrela}</div>`

  const icone = divIcon({
    html,
    className: 'marcador-atividade',
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho / 2],
    popupAnchor: [0, -tamanho / 2],
  })
  cacheIcones.set(chave, icone)
  return icone
}

// Usuário: círculo azul. Município/endereço pesquisado: quadrado girado. Formas diferentes, não só cores.
function iconeReferencia(tipo: TipoReferencia): DivIcon {
  const chave = `ref|${tipo}`
  const existente = cacheIcones.get(chave)
  if (existente) return existente
  const html =
    tipo === 'usuario'
      ? '<div aria-hidden="true" style="width:24px;height:24px;border-radius:50%;background:#1D4ED8;border:4px solid #FFFFFF;box-shadow:0 0 0 3px #1D4ED8"></div>'
      : '<div aria-hidden="true" style="width:22px;height:22px;background:#0F172A;border:4px solid #FFFFFF;box-shadow:0 0 0 3px #0F172A;transform:rotate(45deg)"></div>'
  const icone = divIcon({ html, className: 'marcador-atividade', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16] })
  cacheIcones.set(chave, icone)
  return icone
}

const botaoControle =
  'flex min-h-12 items-center gap-2 rounded-lg border-2 border-pampa-600 bg-white px-4 py-2 text-lg font-semibold text-pampa-700 hover:bg-pampa-50'

export default function ActivityMap({
  atividades,
  selecionadoId,
  onSelecionar,
  foco,
  referencia,
  raioKm,
  ajusteSeq,
  modo,
}: Props) {
  const [mapa, setMapa] = useState<LeafletMap | null>(null)
  const [errosDeTile, setErrosDeTile] = useState(0)
  const marcadores = useRef<Record<string, LeafletMarker | null>>({})
  const areaDoMapa = useRef<HTMLDivElement>(null)
  const jaAjustouTamanho = useRef(false)
  const atividadesRef = useRef(atividades)
  atividadesRef.current = atividades
  const referenciaRef = useRef(referencia)
  referenciaRef.current = referencia

  // O mapa pode nascer escondido (aba "Lista" no celular): recalcula o tamanho quando aparecer.
  useEffect(() => {
    const area = areaDoMapa.current
    if (!mapa || !area || typeof ResizeObserver === 'undefined') return
    const observador = new ResizeObserver(() => {
      mapa.invalidateSize()
      if (!jaAjustouTamanho.current && area.clientWidth > 0) {
        jaAjustouTamanho.current = true
        if (!referenciaRef.current) mapa.fitBounds(LIMITES_RS_LEAFLET, { animate: false })
      }
    })
    observador.observe(area)
    return () => observador.disconnect()
  }, [mapa])

  // Nova referência (localização, município ou endereço): centraliza nela.
  useEffect(() => {
    if (!mapa || !referencia) return
    mapa.setView([referencia.latitude, referencia.longitude], zoomPorRaio(raioKm), { animate: animar() })
  }, [mapa, referencia, raioKm])

  // Depois de uma busca sem referência: mostra os resultados.
  useEffect(() => {
    if (!mapa || ajusteSeq === 0 || referenciaRef.current) return
    const lista = atividadesRef.current
    if (lista.length === 0) return
    if (lista.length === 1) {
      const c = lista[0].coordenadas
      mapa.setView([c.latitude, c.longitude], 14, { animate: animar() })
      return
    }
    const limites = latLngBounds(lista.map((a) => [a.coordenadas.latitude, a.coordenadas.longitude] as [number, number]))
    mapa.fitBounds(limites, { padding: [48, 48], maxZoom: 15, animate: animar() })
  }, [mapa, ajusteSeq])

  // Pedido vindo da lista ("Ver no mapa"): centraliza e abre o balão.
  useEffect(() => {
    if (!mapa || !foco) return
    const alvo = atividadesRef.current.find((a) => a.local.id === foco.id)
    if (!alvo) return
    mapa.invalidateSize()
    mapa.setView([alvo.coordenadas.latitude, alvo.coordenadas.longitude], Math.max(mapa.getZoom(), 14), {
      animate: animar(),
    })
    marcadores.current[foco.id]?.openPopup()
  }, [mapa, foco])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Controles do mapa">
        <button type="button" onClick={() => mapa?.zoomIn()} className={botaoControle}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          Aproximar
        </button>
        <button type="button" onClick={() => mapa?.zoomOut()} className={botaoControle}>
          <Minus className="h-5 w-5" aria-hidden="true" />
          Afastar
        </button>
        <button
          type="button"
          onClick={() => mapa?.fitBounds(LIMITES_RS_LEAFLET, { animate: animar() })}
          className={botaoControle}
        >
          <MapIcon className="h-5 w-5" aria-hidden="true" />
          Ver todo o Rio Grande do Sul
        </button>
        {referencia && (
          <button
            type="button"
            onClick={() =>
              mapa?.setView([referencia.latitude, referencia.longitude], zoomPorRaio(raioKm), { animate: animar() })
            }
            className={botaoControle}
          >
            <MapPin className="h-5 w-5" aria-hidden="true" />
            Voltar para {referencia.tipo === 'usuario' ? 'onde estou' : 'o ponto de referência'}
          </button>
        )}
      </div>

      <div
        ref={areaDoMapa}
        role="region"
        aria-label="Mapa interativo de atividades. A lista de atividades traz as mesmas informações."
        className="h-[60vh] min-h-[420px] overflow-hidden rounded-xl2 border-2 border-pampa-100 lg:h-[70vh]"
      >
        <MapContainer
          ref={setMapa}
          bounds={LIMITES_RS_LEAFLET}
          zoomControl={false}
          scrollWheelZoom={false}
          minZoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url={TILE_URL}
            attribution={ATRIBUICAO}
            eventHandlers={{ tileerror: () => setErrosDeTile((n) => n + 1) }}
          />

          {referencia && referencia.tipo === 'usuario' && referencia.precisaoMetros !== undefined && referencia.precisaoMetros <= 5000 && (
            <Circle
              center={[referencia.latitude, referencia.longitude]}
              radius={referencia.precisaoMetros}
              pathOptions={{ color: '#1D4ED8', weight: 1, fillOpacity: 0.08 }}
            />
          )}
          {referencia && raioKm && (
            <Circle
              center={[referencia.latitude, referencia.longitude]}
              radius={raioKm * 1000}
              pathOptions={{ color: '#1B5E5A', weight: 2, dashArray: '6 6', fillOpacity: 0.04 }}
            />
          )}

          {referencia && (
            <Marker
              position={[referencia.latitude, referencia.longitude]}
              icon={iconeReferencia(referencia.tipo)}
              title={referencia.tipo === 'usuario' ? 'Você está aqui' : referencia.rotulo}
              zIndexOffset={1000}
            >
              <Popup>
                <p className="text-lg font-bold">{referencia.tipo === 'usuario' ? 'Você está aqui' : referencia.rotulo}</p>
                {referencia.tipo === 'usuario' && (
                  <p className="text-base">A posição do aparelho pode ter pequenas imprecisões.</p>
                )}
              </Popup>
            </Marker>
          )}

          {atividades.map((a) => (
            <Marker
              key={a.local.id}
              ref={(marcador) => {
                marcadores.current[a.local.id] = marcador
              }}
              position={[a.coordenadas.latitude, a.coordenadas.longitude]}
              icon={iconeAtividade(a.programa.categoria, a.local.id === selecionadoId, a.combinaComPreferencias)}
              title={`${a.programa.nome} — ${a.local.municipio}`}
              eventHandlers={{ click: () => onSelecionar(a.local.id) }}
            >
              <Popup minWidth={260} maxWidth={340}>
                <ActivityPopup atividade={a} modo={modo} referencia={referencia} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {errosDeTile > 5 && (
        <p role="alert" className="rounded-lg bg-[#FBF3DF] p-3 text-base font-medium text-ink">
          Algumas partes do mapa não carregaram. Verifique sua internet. A lista de atividades continua disponível.
        </p>
      )}
    </div>
  )
}
