import { Component, type ReactNode } from 'react'

// Se o mapa falhar (biblioteca, rede, navegador antigo), a lista de atividades continua funcionando.
export default class MapErrorBoundary extends Component<{ children: ReactNode }, { erro: boolean }> {
  state: { erro: boolean } = { erro: false }

  static getDerivedStateFromError() {
    return { erro: true }
  }

  componentDidCatch(erro: unknown) {
    console.error('Falha ao exibir o mapa', erro)
  }

  render() {
    if (this.state.erro) {
      return (
        <div role="alert" className="card-surface p-6">
          <p className="text-xl font-bold text-ink">Não foi possível carregar o mapa.</p>
          <p className="mt-2 text-lg text-ink-soft">
            Você ainda pode encontrar as atividades na lista. Para tentar o mapa de novo, recarregue a página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 min-h-12 rounded-lg bg-pampa-600 px-5 py-3 text-lg font-bold text-white hover:bg-pampa-700"
          >
            Recarregar a página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
