import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, HeartHandshake, LogOut, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AccessibilityControls from '@/components/AccessibilityControls'

const links = [
  { to: '/', label: 'Início', mostrarIcone: false },
  { to: '/programas', label: 'Programas', mostrarIcone: false },
  { to: '/mapa', label: 'Mapa de atividades', mostrarIcone: true },
  { to: '/boas-praticas', label: 'Boas práticas', mostrarIcone: false },
  { to: '/favoritos', label: 'Favoritos', mostrarIcone: false },
  { to: '/minha-conta', label: 'Minha conta', mostrarIcone: false },
]

export default function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { usuario, logout } = useAuth()

  return (
    <header className="border-b border-pampa-100 bg-white">
      {/* Faixa de acessibilidade (telas largas). No celular os controles ficam dentro do menu. */}
      <div className="hidden border-b border-pampa-100 bg-pampa-50 xl:block">
        <div className="mx-auto flex w-full max-w-7xl justify-end px-4 py-2 sm:px-6 lg:px-8">
          <AccessibilityControls />
        </div>
      </div>

      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-pampa-700" onClick={() => setMenuAberto(false)}>
          <HeartHandshake className="h-8 w-8 shrink-0" aria-hidden="true" />
          <span className="text-xl font-bold leading-tight">
            Viver Bem
            <span className="block text-sm font-normal text-pampa-500">Rio Grande do Sul</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-3 text-lg font-medium transition-colors ${
                  isActive ? 'bg-pampa-50 text-pampa-700' : 'text-ink-soft hover:bg-cream-deep'
                }`
              }
            >
              {link.mostrarIcone && <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          {usuario ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-ink-soft">Olá, {usuario.nome.split(' ')[0]}</span>
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-ink-soft hover:bg-cream-deep"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-lg px-4 py-3 text-lg font-medium text-pampa-700 hover:bg-cream-deep">
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-lg bg-pampa-600 px-4 py-3 text-lg font-semibold text-white hover:bg-pampa-700"
              >
                Criar conta
              </Link>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-pampa-700 xl:hidden"
          onClick={() => setMenuAberto((v) => !v)}
          aria-expanded={menuAberto}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuAberto ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-pampa-100 bg-white xl:hidden">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Navegação principal (celular)">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-4 py-3 text-lg font-medium ${
                    isActive ? 'bg-pampa-50 text-pampa-700' : 'text-ink-soft'
                  }`
                }
              >
                {link.mostrarIcone && <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />}
                {link.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-pampa-100 pt-3">
              <AccessibilityControls />
            </div>
            {usuario ? (
              <button
                onClick={() => {
                  logout()
                  setMenuAberto(false)
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-lg font-medium text-ink-soft"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sair ({usuario.nome.split(' ')[0]})
              </button>
            ) : (
              <div className="mt-2 flex flex-col gap-2 px-1">
                <Link
                  to="/login"
                  onClick={() => setMenuAberto(false)}
                  className="rounded-lg border border-pampa-600 px-4 py-3 text-center text-lg font-semibold text-pampa-700"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMenuAberto(false)}
                  className="rounded-lg bg-pampa-600 px-4 py-3 text-center text-lg font-semibold text-white"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
