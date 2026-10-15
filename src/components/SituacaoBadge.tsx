import { Lock, Clock } from 'lucide-react'
import type { InfoSituacao } from '@/utils/situacao'

export default function SituacaoBadge({ info }: { info: InfoSituacao }) {
  if (!info.rotulo) return null
  const Icone = info.situacao === 'inscricoes_fechadas' ? Lock : Clock
  return (
    <span
      title={info.mensagem}
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#F0C4BC] bg-[#FBEAE7] px-3 py-1 text-sm font-semibold text-alerta-desatualizado"
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      {info.rotulo}
    </span>
  )
}
