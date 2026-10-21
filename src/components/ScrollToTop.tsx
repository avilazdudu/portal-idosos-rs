import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Volta ao topo da página sempre que a pessoa entra em uma rota diferente.
// Usa "instant" para não animar (o site tem scroll suave no CSS, e isso
// também respeita quem ativou "Reduzir animações").
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}