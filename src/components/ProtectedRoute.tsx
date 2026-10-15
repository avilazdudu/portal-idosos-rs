import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingState from '@/components/LoadingState'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return <LoadingState texto="Verificando sua conta..." />
  if (!usuario) return <Navigate to="/login" state={{ de: location.pathname }} replace />
  return <>{children}</>
}
