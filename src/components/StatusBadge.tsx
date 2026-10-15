import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import { StatusVerificacao } from '@/types'

const config: Record<StatusVerificacao, { texto: string; classe: string; Icone: typeof CheckCircle2 }> = {
  verificado: { texto: 'Verificado recentemente', classe: 'bg-pampa-50 text-alerta-verificado border-pampa-200', Icone: CheckCircle2 },
  revisar: { texto: 'Verificação necessária', classe: 'bg-[#FBF3DF] text-alerta-revisar border-[#EBD8A6]', Icone: AlertTriangle },
  desatualizado: { texto: 'Informação desatualizada', classe: 'bg-[#FBEAE7] text-alerta-desatualizado border-[#F0C4BC]', Icone: AlertCircle },
}

export default function StatusBadge({ status, motivo }: { status: StatusVerificacao; motivo?: string }) {
  const { texto, classe, Icone } = config[status]
  return (
    <span title={motivo} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${classe}`}>
      <Icone className="h-4 w-4" aria-hidden="true" />
      {texto}
    </span>
  )
}
