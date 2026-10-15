import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { preferenceService } from '@/services/preferenceService'
import { categorias } from '@/data/categories'
import { CategoriaSlug, Modalidade } from '@/types'
import LoadingState from '@/components/LoadingState'

const listaInteresses = [
  'Atividade física', 'Caminhada', 'Esportes', 'Dança', 'Música', 'Artes', 'Viagens', 'Cursos',
  'Tecnologia', 'Celular', 'Computador', 'Saúde', 'Alimentação', 'Socialização', 'Jogos', 'Cultura',
  'Voluntariado', 'Jardinagem', 'Leitura',
]

const listaOQueProcura = [
  'Fazer novos amigos', 'Praticar exercícios', 'Aprender coisas novas', 'Cuidar melhor da saúde',
  'Aprender tecnologia', 'Encontrar atividades perto de casa', 'Participar de grupos', 'Encontrar serviços para idosos',
]

const listaModalidade: { valor: Modalidade | 'tanto_faz'; rotulo: string }[] = [
  { valor: 'presencial', rotulo: 'Presencial' },
  { valor: 'online', rotulo: 'Online' },
  { valor: 'tanto_faz', rotulo: 'Tanto faz' },
]

const listaDistancia: { valor: '5km' | '10km' | '25km' | 'qualquer'; rotulo: string }[] = [
  { valor: '5km', rotulo: 'Até 5 km' },
  { valor: '10km', rotulo: 'Até 10 km' },
  { valor: '25km', rotulo: 'Até 25 km' },
  { valor: 'qualquer', rotulo: 'Qualquer distância' },
]

function GrupoOpcoes<T extends string>({
  opcoes,
  selecionadas,
  onAlternar,
  rotulo = (v) => v,
}: {
  opcoes: T[]
  selecionadas: T[]
  onAlternar: (v: T) => void
  rotulo?: (v: T) => string
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onAlternar(op)}
          aria-pressed={selecionadas.includes(op)}
          className={`rounded-full border-2 px-4 py-2 text-base font-semibold ${
            selecionadas.includes(op) ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
          }`}
        >
          {rotulo(op)}
        </button>
      ))}
    </div>
  )
}

export default function Preferences() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [interesses, setInteresses] = useState<string[]>([])
  const [oQueProcura, setOQueProcura] = useState<string[]>([])
  const [categoriasPreferidas, setCategoriasPreferidas] = useState<CategoriaSlug[]>([])
  const [modalidade, setModalidade] = useState<Modalidade | 'tanto_faz'>('tanto_faz')
  const [distancia, setDistancia] = useState<'5km' | '10km' | '25km' | 'qualquer'>('qualquer')

  useEffect(() => {
    if (!usuario) return
    preferenceService.buscar(usuario.id).then((prefs) => {
      if (prefs) {
        setInteresses(prefs.interesses)
        setOQueProcura(prefs.oQueProcura)
        setCategoriasPreferidas(prefs.categoriasPreferidas)
        setModalidade(prefs.modalidadePreferida)
        setDistancia(prefs.distanciaPreferida)
      }
      setCarregando(false)
    })
  }, [usuario])

  function alternar<T>(lista: T[], setLista: (v: T[]) => void, valor: T) {
    setLista(lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor])
  }

  async function salvar() {
    if (!usuario) return
    setSalvando(true)
    try {
      await preferenceService.salvar({
        userId: usuario.id,
        interesses,
        oQueProcura,
        categoriasPreferidas,
        modalidadePreferida: modalidade,
        distanciaPreferida: distancia,
        atualizadoEm: new Date().toISOString(),
      })
      navigate('/')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <LoadingState texto="Carregando suas preferências..." />

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-ink">Conte um pouco sobre o que você gosta.</h1>
      <p className="mt-2 text-lg text-ink-soft">Assim podemos mostrar atividades e informações que combinam com você.</p>

      <div className="card-surface mt-8 p-6">
        <h2 className="text-xl font-bold text-ink">Meus interesses</h2>
        <div className="mt-4">
          <GrupoOpcoes opcoes={listaInteresses} selecionadas={interesses} onAlternar={(v) => alternar(interesses, setInteresses, v)} />
        </div>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="text-xl font-bold text-ink">O que você procura?</h2>
        <div className="mt-4">
          <GrupoOpcoes opcoes={listaOQueProcura} selecionadas={oQueProcura} onAlternar={(v) => alternar(oQueProcura, setOQueProcura, v)} />
        </div>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="text-xl font-bold text-ink">Categorias preferidas</h2>
        <div className="mt-4">
          <GrupoOpcoes
            opcoes={categorias.map((c) => c.slug)}
            selecionadas={categoriasPreferidas}
            onAlternar={(v) => alternar(categoriasPreferidas, setCategoriasPreferidas, v)}
            rotulo={(slug) => categorias.find((c) => c.slug === slug)?.nome ?? slug}
          />
        </div>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="text-xl font-bold text-ink">Modalidade</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {listaModalidade.map((m) => (
            <button
              key={m.valor}
              type="button"
              onClick={() => setModalidade(m.valor)}
              aria-pressed={modalidade === m.valor}
              className={`rounded-full border-2 px-4 py-2 text-base font-semibold ${
                modalidade === m.valor ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
              }`}
            >
              {m.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className="card-surface mt-6 p-6">
        <h2 className="text-xl font-bold text-ink">Distância</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {listaDistancia.map((d) => (
            <button
              key={d.valor}
              type="button"
              onClick={() => setDistancia(d.valor)}
              aria-pressed={distancia === d.valor}
              className={`rounded-full border-2 px-4 py-2 text-base font-semibold ${
                distancia === d.valor ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
              }`}
            >
              {d.rotulo}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="mt-8 w-full rounded-lg bg-pampa-600 px-5 py-4 text-xl font-bold text-white hover:bg-pampa-700 disabled:opacity-60 sm:w-auto"
      >
        {salvando ? 'Salvando...' : 'Salvar preferências'}
      </button>
    </div>
  )
}
