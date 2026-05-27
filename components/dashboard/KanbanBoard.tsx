'use client'
import { useState, useTransition, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import KanbanCard from './KanbanCard'
import type { Agendamento, AgendamentoStatus } from '@/types/database'
import { LayoutGrid, Loader2 } from 'lucide-react'

const COLUMNS: { status: AgendamentoStatus; label: string; accent: string; bgHeader: string; textCol: string; dotColor: string }[] = [
  { status: 'agendado',     label: 'A Fazer',            accent: 'border-t-indigo-500 shadow-[inset_0_4px_0_0_rgba(99,102,241,1)]', bgHeader: 'bg-indigo-500/5', textCol: 'text-indigo-950 dark:text-indigo-200', dotColor: 'bg-indigo-500' },
  { status: 'em_andamento', label: 'No Banho & Tosa',    accent: 'border-t-amber-500 shadow-[inset_0_4px_0_0_rgba(245,158,11,1)]', bgHeader: 'bg-amber-500/5', textCol: 'text-amber-950 dark:text-amber-200', dotColor: 'bg-amber-500' },
  { status: 'finalizado',   label: 'Pronto para Buscar', accent: 'border-t-emerald-500 shadow-[inset_0_4px_0_0_rgba(16,185,129,1)]', bgHeader: 'bg-emerald-500/5', textCol: 'text-emerald-950 dark:text-emerald-200', dotColor: 'bg-emerald-500' },
]

export default function KanbanBoard({ initialAgendamentos }: { initialAgendamentos: Agendamento[] }) {
  const [agendamentos, setAgendamentos] = useState(initialAgendamentos)
  const [isPending, startTransition] = useTransition()

  // Sincronizar estado local se os props iniciais mudarem (por exemplo, ao alterar filtros rápidos na URL)
  useEffect(() => {
    setAgendamentos(initialAgendamentos)
  }, [initialAgendamentos])

  function handleStatusChange(id: string, newStatus: AgendamentoStatus) {
    // Optimistic update — muda no local instantaneamente para a UI não travar
    setAgendamentos(prev =>
      prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
    )

    // Persiste no Supabase e dispara notificação em background via API Route
    startTransition(async () => {
      try {
        const res = await fetch('/api/agendamentos/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ agendamentoId: id, status: newStatus }),
        })

        if (!res.ok) {
          throw new Error('Erro ao salvar novo status')
        }
      } catch (error) {
        console.error('❌ [KanbanBoard] Erro ao salvar novo status, revertendo...', error)
        // Rollback se falhar
        setAgendamentos(prev =>
          prev.map(a => a.id === id ? { ...a, status: agendamentos.find(x => x.id === id)!.status } : a)
        )
      }
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4.5 w-4.5 text-gray-500" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Board Operacional</h3>
        </div>
        {isPending && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
            Salvando...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => {
          const cards = agendamentos.filter(a => a.status === col.status)
          return (
            <div
              key={col.status}
              className={`bg-slate-50/50 dark:bg-slate-900/5 rounded-2xl border border-gray-200/60 dark:border-gray-800/40 p-4 min-h-[420px] flex flex-col space-y-4 ${col.accent} backdrop-blur-sm transition-all duration-300`}
            >
              {/* Header Coluna Premium */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${col.bgHeader} border border-gray-200/10`}>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dotColor} shadow-[0_0_8px_currentColor] animate-pulse`} />
                  <h4 className={`font-black text-[11px] uppercase tracking-wider ${col.textCol}`}>{col.label}</h4>
                </div>
                <span className={`text-[10px] font-black bg-white dark:bg-slate-950 border border-gray-200/50 dark:border-gray-800/60 rounded-full px-2 py-0.5 ${col.textCol} shadow-sm`}>
                  {cards.length}
                </span>
              </div>

              {/* Grid dos Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 pr-1">
                {cards.map(a => (
                  <KanbanCard
                    key={a.id}
                    agendamento={a}
                    onStatusChange={handleStatusChange}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-2 border border-dashed border-gray-200/60 dark:border-gray-800/40 rounded-xl">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Fila Vazia</p>
                    <p className="text-[10px] text-gray-400">Nenhum pet pendente nesta etapa</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
