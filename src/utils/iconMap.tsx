import {
  Activity,
  HeartPulse,
  Users,
  GraduationCap,
  Smartphone,
  Drama,
  HandHeart,
  UsersRound,
  type LucideProps,
} from 'lucide-react'
import { ComponentType } from 'react'

const mapa: Record<string, ComponentType<LucideProps>> = {
  Activity,
  HeartPulse,
  Users,
  GraduationCap,
  Smartphone,
  Drama,
  HandHeart,
  UsersRound,
}

export function IconePor({ nome, ...props }: { nome: string } & LucideProps) {
  const Icone = mapa[nome] ?? Activity
  return <Icone {...props} />
}
