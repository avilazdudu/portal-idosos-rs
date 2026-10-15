import { useEffect, useState, type MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { favoriteService } from '@/services/favoriteService'

export default function FavoriteButton({
  programaId,
  tamanho = 'normal',
}: {
  programaId: string
  tamanho?: 'normal' | 'grande'
}) {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [favorito, setFavorito] = useState(false)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!usuario) {
      setFavorito(false)
      return
    }
    favoriteService.listar(usuario.id).then((lista) => {
      setFavorito(lista.some((f) => f.programaId === programaId))
    })
  }, [usuario, programaId])

  async function alternar(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!usuario) {
      navigate('/login')
      return
    }
    setCarregando(true)
    try {
      if (favorito) {
        await favoriteService.remover(usuario.id, programaId)
        setFavorito(false)
      } else {
        await favoriteService.adicionar(usuario.id, programaId)
        setFavorito(true)
      }
    } finally {
      setCarregando(false)
    }
  }

  const tamanhoClasse = tamanho === 'grande' ? 'h-7 w-7' : 'h-6 w-6'

  return (
    <button
      onClick={alternar}
      disabled={carregando}
      aria-pressed={favorito}
      aria-label={favorito ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={`flex items-center justify-center rounded-full border-2 p-2 transition-colors ${
        favorito ? 'border-chimarrao-400 bg-chimarrao-50 text-chimarrao-500' : 'border-pampa-100 text-ink-soft hover:border-chimarrao-300'
      }`}
    >
      <Heart className={tamanhoClasse} fill={favorito ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  )
}
