import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { favoriteService } from '@/services/favoriteService'
import { programService } from '@/services/programService'
import { Programa } from '@/types'
import ProgramCard from '@/components/ProgramCard'
import LoadingState from '@/components/LoadingState'
import EmptyState from '@/components/EmptyState'

export default function Favorites() {
  const { usuario } = useAuth()
  const [programas, setProgramas] = useState<Programa[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) return
    Promise.all([favoriteService.listar(usuario.id), programService.listar()]).then(([favoritos, todos]) => {
      const idsFavoritos = new Set(favoritos.map((f) => f.programaId))
      setProgramas(todos.filter((p) => idsFavoritos.has(p.id)))
      setCarregando(false)
    })
  }, [usuario])

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold text-ink">Meus programas favoritos</h1>
      <p className="mt-2 text-lg text-ink-soft">Programas que você salvou para acessar rápido depois.</p>

      <div className="mt-8">
        {carregando ? (
          <LoadingState texto="Carregando seus favoritos..." />
        ) : programas.length === 0 ? (
          <EmptyState
            titulo="Você ainda não tem favoritos"
            descricao="Toque no coração de um programa para salvá-lo aqui."
            acao={
              <Link to="/programas" className="rounded-lg bg-pampa-600 px-5 py-3 text-lg font-semibold text-white">
                Encontrar programas
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programas.map((p) => (
              <ProgramCard key={p.id} programa={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
