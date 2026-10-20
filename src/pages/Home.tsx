import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, HeartPulse, Smartphone, Users, ArrowRight, MapPin } from 'lucide-react'
import { categorias } from '@/data/categories'
import { programService } from '@/services/programService'
import { preferenceService } from '@/services/preferenceService'
import { recomendarProgramas } from '@/services/recommendationService'
import { useAuth } from '@/contexts/AuthContext'
import CategoryCard from '@/components/CategoryCard'
import ProgramCard from '@/components/ProgramCard'
import LoadingState from '@/components/LoadingState'
import { Programa, PreferenciasUsuario } from '@/types'

const acoesRapidas = [
  { icone: Activity, texto: 'Quero praticar exercícios', destino: '/programas?categoria=esporte' },
  { icone: HeartPulse, texto: 'Quero cuidar da minha saúde', destino: '/programas?categoria=saude' },
  { icone: Users, texto: 'Quero conhecer pessoas', destino: '/programas?categoria=convivencia' },
  { icone: Smartphone, texto: 'Quero aprender tecnologia', destino: '/programas?categoria=inclusao-digital' },
]

const regioes = ['Porto Alegre', 'Região Metropolitana', 'Serra', 'Vale do Sinos', 'Norte', 'Sul', 'Centro', 'Outras']

export default function Home() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [programas, setProgramas] = useState<Programa[]>([])
  const [recomendados, setRecomendados] = useState<Programa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [regiaoEscolhida, setRegiaoEscolhida] = useState('')

  useEffect(() => {
    programService.listar().then((lista) => {
      setProgramas(lista)
      setCarregando(false)
    })
  }, [])

  useEffect(() => {
    if (!usuario) {
      setRecomendados([])
      return
    }
    preferenceService.buscar(usuario.id).then((preferencias: PreferenciasUsuario | null) => {
      if (preferencias && programas.length) {
        setRecomendados(recomendarProgramas(programas, preferencias))
      }
    })
  }, [usuario, programas])

  return (
    <div>
      {/* Hero: a acao, nao a propaganda */}
      <section className="border-b border-pampa-100 bg-gradient-to-b from-pampa-50 to-cream">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-bold leading-tight text-pampa-900 sm:text-4xl">
              Encontre atividades, serviços e oportunidades para viver melhor.
            </h1>
            <p className="mt-4 text-xl text-ink-soft">
              Uma plataforma para conectar você a programas, atividades e informações para a terceira idade no Rio
              Grande do Sul.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/programas"
                className="rounded-lg bg-pampa-600 px-6 py-4 text-xl font-semibold text-white hover:bg-pampa-700"
              >
                Encontrar programas
              </Link>
              <Link
                to="/boas-praticas"
                className="rounded-lg border-2 border-pampa-600 px-6 py-4 text-xl font-semibold text-pampa-700 hover:bg-pampa-50"
              >
                Ver boas práticas
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {acoesRapidas.map((acao) => (
              <Link
                key={acao.texto}
                to={acao.destino}
                className="card-surface flex items-center gap-3 p-4 hover:border-pampa-400"
              >
                <span className="rounded-xl bg-chimarrao-50 p-2.5 text-chimarrao-500">
                  <acao.icone className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-lg font-semibold text-ink">{acao.texto}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="container-page py-14">
        <h2 className="text-2xl font-bold text-ink">Explore por categoria</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categorias.map((c) => (
            <CategoryCard key={c.slug} categoria={c} />
          ))}
        </div>
      </section>

      {/* Recomendado para voce */}
      {usuario && recomendados.length > 0 && (
        <section className="border-y border-pampa-100 bg-cream-deep py-14">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-ink">Recomendado para você</h2>
            <p className="mt-1 text-lg text-ink-soft">Baseado nas preferências que você cadastrou.</p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recomendados.map((p) => (
                <ProgramCard key={p.id} programa={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programas em destaque */}
      <section className="container-page py-14">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink">Programas em destaque</h2>
          <Link to="/programas" className="flex items-center gap-1 text-lg font-semibold text-pampa-700 hover:underline">
            Ver todos
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        {carregando ? (
          <LoadingState texto="Carregando programas..." />
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programas.slice(0, 6).map((p) => (
              <ProgramCard key={p.id} programa={p} />
            ))}
          </div>
        )}
      </section>

      {/* Encontre perto de voce */}
      <section className="border-t border-pampa-100 bg-pampa-900 py-14 text-cream">
        <div className="container-page">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <MapPin className="h-7 w-7" aria-hidden="true" />
            Encontre algo perto de você
          </h2>
          <p className="mt-1 max-w-prose2 text-lg text-pampa-100">Escolha uma região para ver os programas disponíveis nela.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {regioes.map((r) => (
              <button
                key={r}
                onClick={() => setRegiaoEscolhida(r)}
                className={`rounded-full border-2 px-5 py-3 text-lg font-semibold transition-colors ${
                  regiaoEscolhida === r ? 'border-chimarrao-400 bg-chimarrao-400 text-pampa-900' : 'border-pampa-600 text-cream hover:border-pampa-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {regiaoEscolhida && (
            <button
              onClick={() => navigate(`/programas?regiao=${encodeURIComponent(regiaoEscolhida)}`)}
              className="mt-6 rounded-lg bg-chimarrao-400 px-6 py-4 text-xl font-semibold text-pampa-900 hover:bg-chimarrao-300"
            >
              Ver programas em {regiaoEscolhida}
            </button>
          )}
          <Link
            to="/mapa"
            className="mt-6 block w-fit rounded-lg border-2 border-pampa-400 px-6 py-4 text-xl font-semibold text-cream hover:bg-pampa-800"
          >
            Abrir o mapa de atividades
          </Link>
        </div>
      </section>
    </div>
  )
}
