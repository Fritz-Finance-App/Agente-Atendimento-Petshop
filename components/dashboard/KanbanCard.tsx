'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Agendamento, AgendamentoStatus } from '@/types/database'
import { Dog, Cat, User, Play, Check, Clock, Phone } from 'lucide-react'

const NEXT_STATUS: Partial<Record<AgendamentoStatus, AgendamentoStatus>> = {
  agendado:     'em_andamento',
  em_andamento: 'finalizado',
}

const NEXT_LABEL: Partial<Record<AgendamentoStatus, string>> = {
  agendado:     'Iniciar',
  em_andamento: 'Finalizar',
}

interface KanbanCardProps {
  agendamento: Agendamento
  onStatusChange: (id: string, newStatus: AgendamentoStatus) => void
}

export default function KanbanCard({ agendamento, onStatusChange }: KanbanCardProps) {
  const hora = new Date(agendamento.data_hora_inicio).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const nextStatus = NEXT_STATUS[agendamento.status]
  const nextLabel = NEXT_LABEL[agendamento.status]

  const petNome = (agendamento.pets as { nome?: string } | null)?.nome ?? 'Pet'
  const petEspecie = (agendamento.pets as { especie?: string } | null)?.especie ?? ''
  const clienteNome = (agendamento.clientes as { nome?: string } | null)?.nome ?? ''
  const clienteTelefone = (agendamento.clientes as { telefone?: string } | null)?.telefone ?? ''

  const isGato = petEspecie.toLowerCase() === 'gato'
  const PetIcon = isGato ? Cat : Dog
  const petColorClass = isGato
    ? 'bg-indigo-50/70 text-indigo-700 border-indigo-100/50 dark:bg-indigo-950/20 dark:text-indigo-300'
    : 'bg-rose-50/70 text-rose-700 border-rose-100/50 dark:bg-rose-950/20 dark:text-rose-300'

  const ActionIcon = nextStatus === 'em_andamento' ? Play : Check
  const btnColorClass = nextStatus === 'em_andamento'
    ? 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-gray-600'
    : 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-gray-600'

  return (
    <div className="group relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-800/40 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] hover:border-indigo-200/60 dark:hover:border-indigo-950/60 transition-all duration-300 hover:-translate-y-0.5">
      
      {/* Detalhe de Glow Lateral */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300 ${
        agendamento.status === 'agendado' ? 'bg-indigo-500/40' : agendamento.status === 'em_andamento' ? 'bg-amber-500/40' : 'bg-emerald-500/40'
      }`} />

      <div className="space-y-3">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 space-y-0.5">
            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-1.5 truncate">
              <span className={`p-1 rounded-md ${petColorClass} border shadow-sm`}>
                <PetIcon className="h-3.5 w-3.5" />
              </span>
              {petNome}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 truncate pl-7">
              <User className="h-3 w-3 text-gray-300 shrink-0" />
              {clienteNome || 'Tutor não cadastrado'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 shadow-sm">
            <Clock className="h-3 w-3" />
            {hora}
          </span>
        </div>

        {/* Serviço Executado */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100/60 dark:border-gray-800/30">
          <Badge variant="secondary" className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-gray-400 border border-gray-200/30">
            {agendamento.tipo_servico}
          </Badge>
          
          {agendamento.valor_cobrado != null && (
            <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              R$ {agendamento.valor_cobrado.toFixed(2)}
            </p>
          )}
        </div>

        {/* Botão de Ação */}
        {nextStatus && (
          <Button
            size="sm"
            variant="outline"
            className={`w-full text-[10px] font-bold uppercase tracking-wider h-8 rounded-xl border border-gray-200/60 dark:border-gray-800/60 cursor-pointer shadow-sm ${btnColorClass} transition-all duration-300 flex items-center justify-center gap-1`}
            onClick={() => onStatusChange(agendamento.id, nextStatus)}
          >
            <ActionIcon className="h-3 w-3 animate-pulse group-hover:scale-110" />
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
