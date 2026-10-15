import type { ReactNode } from 'react'
import { FiltrosPrograma, CategoriaSlug, Modalidade, Gratuidade, AcessibilidadeInfo } from '@/types'
import { categorias } from '@/data/categories'
import { rotuloFaixaEtaria } from '@/utils/format'

const regioes = ['Porto Alegre', 'Região Metropolitana', 'Serra', 'Vale do Sinos', 'Norte', 'Sul', 'Centro', 'Outras']
const faixasEtarias = ['60+', '65+', '70+', 'todas'] as const
const modalidades: { valor: Modalidade; rotulo: string }[] = [
  { valor: 'presencial', rotulo: 'Presencial' },
  { valor: 'online', rotulo: 'Online' },
  { valor: 'hibrido', rotulo: 'Híbrido' },
]
const gratuidades: { valor: Gratuidade; rotulo: string }[] = [
  { valor: 'gratuito', rotulo: 'Gratuito' },
  { valor: 'pago', rotulo: 'Pago' },
  { valor: 'gratuito_ou_pago', rotulo: 'Gratuito ou pago' },
]
const opcoesAcessibilidade: { chave: keyof AcessibilidadeInfo; rotulo: string }[] = [
  { chave: 'acessivelCadeirantes', rotulo: 'Acessível para cadeirantes' },
  { chave: 'possuiTransporte', rotulo: 'Possui transporte' },
  { chave: 'possuiInterprete', rotulo: 'Possui intérprete' },
  { chave: 'atividadesAdaptadas', rotulo: 'Atividades adaptadas' },
  { chave: 'atendimentoEspecializado', rotulo: 'Atendimento especializado' },
]

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="border-b border-pampa-100 py-5 first:pt-0 last:border-0">
      <p className="mb-3 text-lg font-bold text-ink">{titulo}</p>
      {children}
    </div>
  )
}

function Pilula({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-full border-2 px-4 py-2 text-base font-semibold transition-colors ${
        ativo ? 'border-pampa-600 bg-pampa-600 text-white' : 'border-pampa-100 text-ink-soft hover:border-pampa-300'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterPanel({
  filtros,
  onChange,
}: {
  filtros: FiltrosPrograma
  onChange: (filtros: FiltrosPrograma) => void
}) {
  function alternarCategoria(cat: CategoriaSlug) {
    onChange({ ...filtros, categoria: filtros.categoria === cat ? undefined : cat })
  }

  function alternarAcessibilidade(chave: keyof AcessibilidadeInfo) {
    const atual = filtros.acessibilidade ?? []
    const novo = atual.includes(chave) ? atual.filter((c) => c !== chave) : [...atual, chave]
    onChange({ ...filtros, acessibilidade: novo })
  }

  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xl font-bold text-ink">Filtros</p>
        <button onClick={() => onChange({})} className="text-base font-semibold text-pampa-700 hover:underline">
          Limpar tudo
        </button>
      </div>

      <Secao titulo="Categoria">
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Pilula key={c.slug} ativo={filtros.categoria === c.slug} onClick={() => alternarCategoria(c.slug)}>
              {c.nome}
            </Pilula>
          ))}
        </div>
      </Secao>

      <Secao titulo="Região">
        <div className="flex flex-wrap gap-2">
          {regioes.map((r) => (
            <Pilula key={r} ativo={filtros.regiao === r} onClick={() => onChange({ ...filtros, regiao: filtros.regiao === r ? undefined : r })}>
              {r}
            </Pilula>
          ))}
        </div>
      </Secao>

      <Secao titulo="Faixa etária">
        <div className="flex flex-wrap gap-2">
          {faixasEtarias.map((f) => (
            <Pilula
              key={f}
              ativo={filtros.faixaEtaria === f}
              onClick={() => onChange({ ...filtros, faixaEtaria: filtros.faixaEtaria === f ? undefined : f })}
            >
              {rotuloFaixaEtaria[f]}
            </Pilula>
          ))}
        </div>
      </Secao>

      <Secao titulo="Modalidade">
        <div className="flex flex-wrap gap-2">
          {modalidades.map((m) => (
            <Pilula
              key={m.valor}
              ativo={filtros.modalidade === m.valor}
              onClick={() => onChange({ ...filtros, modalidade: filtros.modalidade === m.valor ? undefined : m.valor })}
            >
              {m.rotulo}
            </Pilula>
          ))}
        </div>
      </Secao>

      <Secao titulo="Gratuidade">
        <div className="flex flex-wrap gap-2">
          {gratuidades.map((g) => (
            <Pilula
              key={g.valor}
              ativo={filtros.gratuidade === g.valor}
              onClick={() => onChange({ ...filtros, gratuidade: filtros.gratuidade === g.valor ? undefined : g.valor })}
            >
              {g.rotulo}
            </Pilula>
          ))}
        </div>
      </Secao>

      <Secao titulo="Acessibilidade">
        <div className="flex flex-col gap-3">
          {opcoesAcessibilidade.map((op) => (
            <label key={op.chave} className="flex cursor-pointer items-center gap-3 text-lg text-ink-soft">
              <input
                type="checkbox"
                checked={filtros.acessibilidade?.includes(op.chave) ?? false}
                onChange={() => alternarAcessibilidade(op.chave)}
                className="h-6 w-6 rounded border-2 border-pampa-300 text-pampa-600 focus:ring-pampa-400"
              />
              {op.rotulo}
            </label>
          ))}
        </div>
      </Secao>
    </div>
  )
}
