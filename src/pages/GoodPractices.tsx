import { useEffect, useState } from 'react'
import { BoaPratica } from '@/types'
import { goodPracticeService } from '@/services/goodPracticeService'
import GoodPracticeCard from '@/components/GoodPracticeCard'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'

const categoriasFiltro: { valor: BoaPratica['categoria'] | 'todas'; rotulo: string }[] = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'saude', rotulo: 'Saúde' },
  { valor: 'atividade-fisica', rotulo: 'Atividade física' },
  { valor: 'alimentacao', rotulo: 'Alimentação' },
  { valor: 'saude-mental', rotulo: 'Saúde mental e socialização' },
  { valor: 'seguranca-digital', rotulo: 'Segurança digital' },
  { valor: 'autonomia', rotulo: 'Autonomia' },
]

export default function GoodPractices() {
  const [praticas, setPraticas] = useState<BoaPratica[]>([])
  const [categoria, setCategoria] = useState<BoaPratica['categoria'] | 'todas'>('todas')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setCarregando(true)
    goodPracticeService.listar(categoria === 'todas' ? undefined : categoria).then((lista) => {
      setPraticas(lista)
      setCarregando(false)
    })
  }, [categoria])

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Boas práticas para envelhecer bem</h1>
      <p className="mt-2 max-w-prose2 text-lg text-ink-soft">
        Conteúdos simples sobre saúde, atividade física, alimentação, convivência, segurança digital e autonomia.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categoriasFiltro.map((c) => (
          <button
            key={c.valor}
            onClick={() => setCategoria(c.valor)}
            aria-pressed={categoria === c.valor}
            className={`rounded-full border-2 px-4 py-2 text-base font-semibold ${
              categoria === c.valor ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
            }`}
          >
            {c.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {carregando ? (
          <LoadingState texto="Carregando conteúdos..." />
        ) : praticas.length === 0 ? (
          <EmptyState titulo="Nenhum conteúdo por aqui ainda" descricao="Tente escolher outra categoria." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {praticas.map((p) => (
              <GoodPracticeCard key={p.id} pratica={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
