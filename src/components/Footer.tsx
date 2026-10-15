import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-pampa-100 bg-pampa-900 text-cream">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xl font-bold">Viver Bem RS</p>
          <p className="mt-2 max-w-prose2 text-pampa-100">
            Um ponto de partida para encontrar programas, serviços e boas práticas para a terceira idade no Rio
            Grande do Sul.
          </p>
        </div>
        <div>
          <p className="text-lg font-semibold">Navegação</p>
          <ul className="mt-3 space-y-2 text-pampa-100">
            <li><Link to="/programas" className="hover:underline">Programas</Link></li>
            <li><Link to="/boas-praticas" className="hover:underline">Boas práticas</Link></li>
            <li><Link to="/favoritos" className="hover:underline">Favoritos</Link></li>
            <li><Link to="/preferencias" className="hover:underline">Minhas preferências</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-lg font-semibold">Importante</p>
          <p className="mt-3 text-pampa-100">
            O Viver Bem RS reune e organiza informações de terceiros para facilitar o acesso, mas não substitui os
            canais oficiais das instituições responsáveis por cada programa. Sempre confirme dados de inscrição
            diretamente com a instituição.
          </p>
        </div>
      </div>
      <div className="border-t border-pampa-700 py-4 text-center text-sm text-pampa-200">
        Projeto de exemplo — dados de programas em fase de verificação.
      </div>
    </footer>
  )
}
