import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { authService, CadastroInput, LoginInput } from '@/services/authService'
import { PerfilUsuario } from '@/types'

interface AuthState {
  usuario: PerfilUsuario | null
  carregando: boolean
  cadastrar: (input: CadastroInput) => Promise<void>
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  atualizarPerfil: (perfil: PerfilUsuario) => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<PerfilUsuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    authService
      .usuarioAtual()
      .then(setUsuario)
      .finally(() => setCarregando(false))
  }, [])

  const cadastrar = useCallback(async (input: CadastroInput) => {
    const perfil = await authService.cadastrar(input)
    setUsuario(perfil)
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const perfil = await authService.login(input)
    setUsuario(perfil)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUsuario(null)
  }, [])

  const atualizarPerfil = useCallback(async (perfil: PerfilUsuario) => {
    const atualizado = await authService.atualizarPerfil(perfil)
    setUsuario(atualizado)
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, carregando, cadastrar, login, logout, atualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
