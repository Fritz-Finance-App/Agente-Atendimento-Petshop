import { createClient } from '@/lib/supabase/server'
import MetricCard from '@/components/dashboard/MetricCard'
import KanbanBoard from '@/components/dashboard/KanbanBoard'
import type { Agendamento } from '@/types/database'
import Link from 'next/link'
import { Calendar, Filter, Sparkles } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { filter } = await searchParams
  const activeFilter = filter || 'hoje'

  const now = new Date()
  let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  let endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()

  let pageSubtitle = 'Aqui está a operação do seu Petshop hoje.'

  if (activeFilter === 'amanha') {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()).toISOString()
    endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59, 999).toISOString()
    pageSubtitle = 'Veja a agenda e prepare o dia de amanhã.'
  } else if (activeFilter === 'semana') {
    startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6)
    endOfDay = new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 23, 59, 59, 999).toISOString()
    pageSubtitle = 'Agendamentos programados para os próximos 7 dias.'
  } else if (activeFilter === 'todos') {
    startOfDay = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString()
    endOfDay = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString()
    pageSubtitle = 'Visão geral histórica e futuros agendamentos integrados.'
  }

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('*, clientes(nome, telefone), pets(nome, especie)')
    .gte('data_hora_inicio', startOfDay)
    .lte('data_hora_inicio', endOfDay)
    .order('data_hora_inicio', { ascending: true })

  const list = (agendamentos ?? []) as unknown as Agendamento[]

  const faturamentoHoje = list
    .filter(a => a.status === 'finalizado' && a.valor_cobrado)
    .reduce((sum, a) => sum + (a.valor_cobrado ?? 0), 0)

  const realizados = list.filter(a => a.status === 'finalizado').length
  const pendentes = list.filter(a => a.status === 'agendado' || a.status === 'em_andamento').length

  const dateLabel = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // ────────────────────────────────────────────────────────
  // CÁLCULO DE MÉTRICAS SEMANAIS (SEGUNDA A DOMINGO)
  // ────────────────────────────────────────────────────────
  const currentDay = now.getDay()
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const { data: agendamentosSemana } = await supabase
    .from('agendamentos')
    .select('id, tipo_servico, status, valor_cobrado')
    .gte('data_hora_inicio', monday.toISOString())
    .lte('data_hora_inicio', sunday.toISOString())

  const weeklyList = agendamentosSemana ?? []

  // Faturamento Realizado Semanal (finalizados)
  const fatRealizadoSemanal = weeklyList
    .filter(a => a.status === 'finalizado' && a.valor_cobrado)
    .reduce((sum, a) => sum + (a.valor_cobrado ?? 0), 0)

  // Faturamento Estimado Semanal (todos da semana)
  const fatEstimadoSemanal = weeklyList
    .filter(a => a.valor_cobrado)
    .reduce((sum, a) => sum + (a.valor_cobrado ?? 0), 0)

  // Quantidade de cada serviço na semana
  const contagemServicos: Record<string, number> = {}
  weeklyList.forEach(a => {
    contagemServicos[a.tipo_servico] = (contagemServicos[a.tipo_servico] || 0) + 1
  })

  const servicosSemanais = Object.entries(contagemServicos)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)

  const totalServicosSemanais = weeklyList.length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-gray-100 dark:border-slate-800 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Operations
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 dark:from-slate-100 dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent capitalize">
            {activeFilter === 'hoje' ? dateLabel : `${activeFilter.replace('amanha', 'Amanhã').replace('semana', 'Esta Semana').replace('todos', 'Todos os Serviços')}`}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">{pageSubtitle}</p>
        </div>

        {/* Seletor de Períodos Premium */}
        <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-800 backdrop-blur-md self-start lg:self-center">
          <span className="text-gray-400 dark:text-slate-500 p-1.5 hidden sm:inline">
            <Filter className="h-3.5 w-3.5" />
          </span>
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'amanha', label: 'Amanhã' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'todos', label: 'Todos' },
          ].map((item) => {
            const isActive = activeFilter === item.id
            return (
              <Link
                key={item.id}
                href={`?filter=${item.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-sm border border-gray-200/50 dark:border-slate-700 scale-102 font-bold'
                    : 'text-gray-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Métricas Re-estilizadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          title="Faturamento Acumulado"
          value={`R$ ${faturamentoHoje.toFixed(2)}`}
          description="Apenas serviços finalizados"
          color="green"
        />
        <MetricCard
          title="Serviços Realizados"
          value={String(realizados)}
          description="Concluídos com sucesso"
          color="blue"
        />
        <MetricCard
          title="Agendamentos Ativos"
          value={String(pendentes)}
          description="Pendentes ou no banho"
          color="yellow"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-premium grid grid-cols-1 lg:grid-cols-2 gap-8 animate-scale-in transition-colors duration-300">
        
        {/* Lado Esquerdo: Faturamento Semanal Realizado vs Estimado */}
        <div className="space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Metas & Estimativas</span>
            <h3 className="text-base font-extrabold text-gray-800 dark:text-slate-100">Faturamento da Semana Atual</h3>
            <p className="text-xs text-gray-400 dark:text-slate-450">Projeções financeiras calculadas de segunda-feira a domingo.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl transition-colors">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block mb-1">Faturamento Concluído</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">R$ {fatRealizadoSemanal.toFixed(2)}</p>
              <span className="text-[9px] text-gray-400 dark:text-slate-400 mt-1 block">Apenas serviços finalizados</span>
            </div>
            
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl transition-colors">
              <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase block mb-1">Faturamento Estimado</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">R$ {fatEstimadoSemanal.toFixed(2)}</p>
              <span className="text-[9px] text-gray-400 dark:text-slate-400 mt-1 block">Total de reservas da semana</span>
            </div>
          </div>

          {/* Barra de Progresso Realizado vs Estimado */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-505 dark:text-slate-400">Progresso de Realização Financeira</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                {fatEstimadoSemanal > 0 
                  ? `${Math.round((fatRealizadoSemanal / fatEstimadoSemanal) * 100)}%` 
                  : '0%'
                }
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden transition-colors">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                style={{ 
                  width: `${fatEstimadoSemanal > 0 ? Math.min((fatRealizadoSemanal / fatEstimadoSemanal) * 100, 100) : 0}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Lado Direito: Volume de cada Serviço Semanal */}
        <div className="space-y-5 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-800 pt-5 lg:pt-0 lg:pl-8 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Performance de Portfólio</span>
            <h3 className="text-base font-extrabold text-gray-800 dark:text-slate-100">Serviços Mais Procurados na Semana</h3>
            <p className="text-xs text-gray-400 dark:text-slate-450">Total de agendamentos realizados agrupados por tipo.</p>
          </div>

          {servicosSemanais.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 dark:text-slate-450 italic">
              Nenhum serviço registrado para a semana atual.
            </div>
          ) : (
            <div className="space-y-3.5">
              {servicosSemanais.map((servico, i) => {
                const percent = totalServicosSemanais > 0 ? (servico.qtd / totalServicosSemanais) * 100 : 0
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 dark:text-slate-200">{servico.nome}</span>
                      <span className="font-mono text-gray-500 dark:text-slate-400">
                        {servico.qtd} {servico.qtd === 1 ? 'reserva' : 'reservas'} ({Math.round(percent)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden transition-colors">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <KanbanBoard initialAgendamentos={list} />
    </div>
  )
}
