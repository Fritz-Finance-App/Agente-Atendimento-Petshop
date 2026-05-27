'use client'

import { useState, useMemo, useTransition } from 'react'
import type { Cliente, Pet, ServicoCatalogo, Agendamento, AgendamentoStatus } from '@/types/database'
import ModalNovoAgendamento from './ModalNovoAgendamento'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Dog, 
  Cat, 
  User, 
  TrendingUp, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Slash,
  AlertTriangle,
  Play,
  Check,
  XCircle,
  ExternalLink
} from 'lucide-react'

interface AgendaClientProps {
  initialAgendamentos: Agendamento[]
  clientes: Cliente[]
  pets: Pet[]
  servicos: ServicoCatalogo[]
}

export default function AgendaClient({
  initialAgendamentos,
  clientes,
  pets,
  servicos,
}: AgendaClientProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(initialAgendamentos)
  const [isPending, startTransition] = useTransition()

  // Controle de Visualização (Calendário Semanal vs Histórico Geral)
  const [activeView, setActiveView] = useState<'calendario' | 'historico'>('calendario')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Estados de busca e filtro
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('todos')
  const [selectedService, setSelectedService] = useState<string>('todos')

  // Controle do modal de Novo Agendamento
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)

  // Controle da data selecionada na barra semanal
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Data de referência do início da semana exibida (para scroll de dias)
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })

  // Gera os 7 dias da barra semanal a partir de weekStartDate
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate)
      d.setDate(weekStartDate.getDate() + i)
      days.push(d)
    }
    return days
  }, [weekStartDate])

  // Retroceder e avançar a semana na barra
  function handlePrevWeek() {
    const prev = new Date(weekStartDate)
    prev.setDate(weekStartDate.getDate() - 7)
    setWeekStartDate(prev)
  }

  function handleNextWeek() {
    const next = new Date(weekStartDate)
    next.setDate(weekStartDate.getDate() + 7)
    setWeekStartDate(next)
  }

  // Ir para Hoje
  function handleGoToToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setSelectedDate(today)
    setWeekStartDate(today)
  }

  // Filtragem e busca avançada de agendamentos
  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(a => {
      // 1. Filtro por data selecionada
      const appDate = new Date(a.data_hora_inicio)
      const sameDay = 
        appDate.getFullYear() === selectedDate.getFullYear() &&
        appDate.getMonth() === selectedDate.getMonth() &&
        appDate.getDate() === selectedDate.getDate()
      
      if (!sameDay) return false

      // 2. Filtro por Status
      if (selectedStatus !== 'todos' && a.status !== selectedStatus) return false

      // 3. Filtro por Serviço
      if (selectedService !== 'todos' && a.tipo_servico !== selectedService) return false

      // 4. Busca por Texto (Tutor, Pet ou Serviço)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const petNome = (a.pets as { nome?: string } | null)?.nome?.toLowerCase() ?? ''
        const clienteNome = (a.clientes as { nome?: string } | null)?.nome?.toLowerCase() ?? ''
        const servicoName = a.tipo_servico.toLowerCase()
        
        return petNome.includes(query) || clienteNome.includes(query) || servicoName.includes(query)
      }

      return true
    }).sort((a, b) => new Date(a.data_hora_inicio).getTime() - new Date(b.data_hora_inicio).getTime())
  }, [agendamentos, selectedDate, selectedStatus, selectedService, searchTerm])

  // Filtragem de histórico geral (sem restrição de data)
  const filteredHistorico = useMemo(() => {
    setCurrentPage(1) // Reseta para a primeira página quando os filtros mudam
    return agendamentos.filter(a => {
      // 1. Filtro por Status
      if (selectedStatus !== 'todos' && a.status !== selectedStatus) return false

      // 2. Filtro por Serviço
      if (selectedService !== 'todos' && a.tipo_servico !== selectedService) return false

      // 3. Busca por Texto (Tutor, Pet ou Serviço)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const petNome = (a.pets as { nome?: string } | null)?.nome?.toLowerCase() ?? ''
        const clienteNome = (a.clientes as { nome?: string } | null)?.nome?.toLowerCase() ?? ''
        const servicoName = a.tipo_servico.toLowerCase()
        
        return petNome.includes(query) || clienteNome.includes(query) || servicoName.includes(query)
      }

      return true
    }).sort((a, b) => new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime()) // Recentes primeiro
  }, [agendamentos, selectedStatus, selectedService, searchTerm])

  const paginatedHistorico = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredHistorico.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredHistorico, currentPage])

  const totalPages = Math.ceil(filteredHistorico.length / itemsPerPage)

  // Sucesso na criação do agendamento
  function handleCreateSuccess(newAgendamento: Agendamento) {
    setAgendamentos(prev => [newAgendamento, ...prev])
    // Se o agendamento criado for na data selecionada, ótimo, já vai listar!
    const appDate = new Date(newAgendamento.data_hora_inicio)
    appDate.setHours(0, 0, 0, 0)
    setSelectedDate(appDate)
    setWeekStartDate(appDate)
  }

  // Atualizar status diretamente da listagem (inclui cancelamento)
  function handleStatusUpdate(id: string, newStatus: AgendamentoStatus) {
    // Optimistic Update
    const oldAgendamentos = [...agendamentos]
    setAgendamentos(prev =>
      prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
    )

    startTransition(async () => {
      try {
        const res = await fetch('/api/agendamentos/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agendamentoId: id, status: newStatus }),
        })

        if (!res.ok) {
          throw new Error('Falha ao salvar status')
        }
      } catch (error) {
        console.error('❌ [AgendaClient] Erro ao atualizar status:', error)
        // Rollback
        setAgendamentos(oldAgendamentos)
        alert('Erro ao atualizar o status do agendamento.')
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Alternador de Abas de Visualização (Calendário vs Histórico) (Estilo Fireart) */}
      <div className="flex items-center gap-1.5 bg-gray-150/60 p-1.5 rounded-2xl border border-gray-200/40 backdrop-blur-md self-start inline-flex animate-scale-in">
        <button
          onClick={() => {
            setActiveView('calendario')
            setSearchTerm('')
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeView === 'calendario'
              ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50 scale-102 font-extrabold'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-white/40'
          }`}
        >
          <Calendar size={13} />
          Calendário Semanal
        </button>
        <button
          onClick={() => {
            setActiveView('historico')
            setSearchTerm('')
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            activeView === 'historico'
              ? 'bg-indigo-600 text-white shadow-sm border border-indigo-700 scale-102 font-extrabold'
              : 'text-gray-500 hover:text-indigo-600 hover:bg-white/40'
          }`}
        >
          <Clock size={13} />
          Histórico Geral
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────
          GRID SUPERIOR: CONTROLES & FILTROS (ESTILO FIREART)
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-5 shadow-premium flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-scale-in">
        
        {/* Barra de Pesquisa */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-3.5 text-gray-400">
            <Search size={16} />
          </span>
          <Input
            type="text"
            placeholder={activeView === 'calendario' ? "Buscar por pet, tutor ou serviço..." : "Buscar no histórico..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 rounded-xl h-11 border-gray-200/70 focus-visible:ring-indigo-600 bg-gray-50/50"
          />
        </div>

        {/* Filtros Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-1.5 bg-gray-150 p-1 rounded-xl border border-gray-200/50 bg-slate-50/70 text-xs">
            <span className="text-gray-400 p-1">
              <Filter size={13} />
            </span>
            
            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none focus:outline-none py-1.5 px-2.5 font-bold text-gray-700 cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="agendado">A Fazer</option>
              <option value="em_andamento">No Banho & Tosa</option>
              <option value="finalizado">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>

            {/* Service Select */}
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="bg-transparent border-none focus:outline-none py-1.5 px-2.5 font-bold text-gray-700 cursor-pointer border-l"
            >
              <option value="todos">Todos os Serviços</option>
              {servicos.map(s => (
                <option key={s.id} value={s.tipo_servico}>
                  {s.tipo_servico}
                </option>
              ))}
            </select>
          </div>

          <Button 
            onClick={() => setIsNewAppointmentOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 flex items-center gap-1.5 font-bold tracking-wide shadow-[0_10px_20px_-8px_rgba(79,70,229,0.3)] shrink-0 cursor-pointer text-xs"
          >
            <Plus size={16} /> Novo Agendamento
          </Button>

        </div>

      </div>

      {activeView === 'calendario' ? (
        <>
          {/* ────────────────────────────────────────────────────────
              BARRA DE DIAS DA SEMANA (Weekly Datepicker Premium)
              ──────────────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200/60 rounded-3xl p-5 shadow-premium space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-indigo-700">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">
                    {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Seletor Semanal</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleGoToToday} className="rounded-xl h-9 text-xs font-bold hover:bg-gray-50">
                  Hoje
                </Button>
                
                <div className="flex items-center border border-gray-200/50 rounded-xl overflow-hidden bg-slate-50/50">
                  <Button variant="ghost" size="icon" onClick={handlePrevWeek} className="h-9 w-9 text-gray-500 rounded-none hover:bg-gray-100">
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNextWeek} className="h-9 w-9 text-gray-500 rounded-none hover:bg-gray-100 border-l">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Carousel de Dias da Semana */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3.5">
              {weekDays.map((day, i) => {
                const isSelected = 
                  day.getFullYear() === selectedDate.getFullYear() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getDate() === selectedDate.getDate()
                
                const isToday = 
                  day.getDate() === new Date().getDate() &&
                  day.getMonth() === new Date().getMonth() &&
                  day.getFullYear() === new Date().getFullYear()

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`py-3.5 px-2 rounded-2xl text-center border transition-all duration-300 flex flex-col items-center gap-1.5 relative cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_10px_20px_-8px_rgba(79,70,229,0.4)] scale-102 font-bold'
                        : 'bg-slate-50/30 hover:bg-gray-50 border-gray-200/60 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {/* Nome do Dia abreviado */}
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                    </span>
                    
                    {/* Número do Dia */}
                    <span className="text-base font-extrabold leading-none">{day.getDate()}</span>

                    {/* Marcador de Hoje */}
                    {isToday && (
                      <span className={`absolute bottom-2.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-600'} shadow-sm animate-pulse`} />
                    )}
                  </button>
                )
              })}
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────
              LISTAGEM PRINCIPAL DE AGENDAMENTOS (ESTILO FIREART CARDS)
              ──────────────────────────────────────────────────────── */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                Compromissos para: <strong className="text-gray-600">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
              </span>
              {isPending && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                  <Loader2 className="animate-spin text-indigo-600" size={13} />
                  Salvando...
                </div>
              )}
            </div>

            {filteredAgendamentos.length === 0 ? (
              <div className="bg-white border border-gray-200/60 rounded-3xl p-16 text-center shadow-premium space-y-3 animate-scale-in">
                <div className="inline-flex p-4 rounded-3xl bg-indigo-50 border border-indigo-100/50 text-indigo-700">
                  <Calendar size={28} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Nenhum compromisso agendado</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Não existem reservas que correspondam aos filtros ativos no dia selecionado.
                </p>
                <Button variant="outline" onClick={() => setIsNewAppointmentOpen(true)} className="rounded-xl text-xs font-bold mt-2">
                  Reservar Horário
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 animate-scale-in">
                {filteredAgendamentos.map(a => {
                  const petNome = (a.pets as { nome?: string } | null)?.nome ?? 'Pet'
                  const petEspecie = (a.pets as { especie?: string } | null)?.especie ?? ''
                  const tutorNome = (a.clientes as { nome?: string } | null)?.nome ?? ''
                  const tutorTelefone = (a.clientes as { telefone?: string } | null)?.telefone ?? ''
                  const isGato = petEspecie.toLowerCase() === 'gato'
                  const PetIcon = isGato ? Cat : Dog
                  const petColorClass = isGato
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20'
                    : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20'

                  const hora = new Date(a.data_hora_inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  return (
                    <div 
                      key={a.id} 
                      className={`group relative overflow-hidden bg-white/95 rounded-2xl border p-4.5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-premium-hover hover:border-indigo-200/70 hover:-translate-y-0.5 ${
                        a.status === 'cancelado' ? 'opacity-65 border-gray-150/70 hover:shadow-none hover:translate-y-0' : 'border-gray-200/50'
                      }`}
                    >
                      
                      {/* Status Indicator Stripe */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                        a.status === 'agendado' 
                          ? 'bg-indigo-500/40' 
                          : a.status === 'em_andamento' 
                          ? 'bg-amber-500/40' 
                          : a.status === 'finalizado'
                          ? 'bg-emerald-500/40'
                          : 'bg-slate-350'
                      }`} />

                      {/* Coluna 1: Horário e Pet */}
                      <div className="flex items-start gap-3.5 min-w-[200px] pl-1.5">
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm shrink-0 self-center">
                          <Clock size={12} />
                          {hora}
                        </span>

                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5 truncate">
                            <span className={`p-1 rounded-lg ${petColorClass} border shadow-sm`}>
                              <PetIcon size={12} />
                            </span>
                            {petNome}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1 truncate">
                            <User size={10} />
                            {tutorNome || 'Sem Tutor'}
                          </p>
                        </div>
                      </div>

                      {/* Coluna 2: Serviço e Preço */}
                      <div className="flex items-center gap-4 md:mx-auto">
                        <Badge variant="secondary" className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-200/30 text-gray-500">
                          {a.tipo_servico}
                        </Badge>
                        
                        {a.valor_cobrado != null && (
                          <p className="text-xs font-black text-emerald-600">
                            R$ {a.valor_cobrado.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Coluna 3: Ações e Status Visual */}
                      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        
                        {/* Exibe badges correspondentes ao Status finalizado ou cancelado */}
                        {a.status === 'finalizado' && (
                          <Badge className="bg-emerald-50 border border-emerald-250 text-emerald-700 rounded-lg text-[10px] py-0.8 px-2 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={10} /> Concluído
                          </Badge>
                        )}

                        {a.status === 'cancelado' && (
                          <Badge variant="outline" className="bg-slate-50 border-slate-200 text-gray-400 rounded-lg text-[10px] py-0.8 px-2 flex items-center gap-1">
                            <XCircle size={10} /> Cancelado
                          </Badge>
                        )}

                        {/* Exibe ações rápidas de avanço se pendente */}
                        {a.status === 'agendado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(a.id, 'em_andamento')}
                            className="text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg border hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Play size={10} className="animate-pulse" /> Iniciar
                          </Button>
                        )}

                        {a.status === 'em_andamento' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(a.id, 'finalizado')}
                            className="text-[10px] font-bold uppercase tracking-wider h-8 rounded-lg border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 flex items-center gap-1 cursor-pointer transition-all"
                          >
                            <Check size={10} /> Finalizar
                          </Button>
                        )}

                        {/* Botão de Cancelar rápido se não finalizado ou cancelado */}
                        {a.status !== 'finalizado' && a.status !== 'cancelado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('Deseja realmente cancelar esta reserva? Isso notificará o Google Calendar e cancelará o bloqueio da agenda.')) {
                                handleStatusUpdate(a.id, 'cancelado')
                              }
                            }}
                            className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Cancelar Agendamento"
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}

                        {/* Se tiver sincronização do Google Calendar, exibe link para debugar */}
                        {a.gcal_event_id && (
                          <a
                            href="https://calendar.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Ver no Google Agenda"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}

                      </div>

                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </>
      ) : (
        // RENDERIZAÇÃO DO HISTÓRICO GERAL (TABELA INTERATIVA)
        <div className="bg-white border border-gray-200/60 rounded-3xl shadow-premium overflow-hidden animate-scale-in">
          
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Histórico de Atendimentos</h3>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Auditoria e controle financeiro completo</p>
            </div>
            
            <Badge variant="secondary" className="bg-indigo-50 border border-indigo-150 text-indigo-750 font-extrabold text-xs px-2.5 py-0.5 rounded-lg">
              {filteredHistorico.length} {filteredHistorico.length === 1 ? 'registro' : 'registros'}
            </Badge>
          </div>

          {filteredHistorico.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-50 border border-indigo-100/50 text-indigo-750">
                <Clock size={28} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Nenhum agendamento encontrado</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Não existem reservas que correspondam aos filtros de pesquisa ativos no histórico.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="p-4 pl-6">Tutor & Pet</th>
                    <th className="p-4">Serviço</th>
                    <th className="p-4">Data & Horário</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/70">
                  {paginatedHistorico.map(a => {
                    const petNome = (a.pets as { nome?: string } | null)?.nome ?? 'Pet'
                    const petEspecie = (a.pets as { especie?: string } | null)?.especie ?? ''
                    const tutorNome = (a.clientes as { nome?: string } | null)?.nome ?? ''
                    const isGato = petEspecie.toLowerCase() === 'gato'
                    const PetIcon = isGato ? Cat : Dog
                    const petColorClass = isGato
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'

                    const dataFormatada = new Date(a.data_hora_inicio).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                    const horaFormatada = new Date(a.data_hora_inicio).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        
                        {/* Tutor & Pet */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <span className={`p-1.5 rounded-lg border shadow-sm ${petColorClass} shrink-0`}>
                              <PetIcon size={12} />
                            </span>
                            <div>
                              <span className="font-bold text-gray-800 block">{petNome}</span>
                              <span className="text-[10px] text-gray-400 font-semibold">{tutorNome || 'Sem Tutor'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Serviço */}
                        <td className="p-4">
                          <Badge variant="secondary" className="bg-slate-100 border border-slate-200/50 text-gray-600 font-semibold rounded-lg text-[9px] px-2 py-0.5 uppercase tracking-wide">
                            {a.tipo_servico}
                          </Badge>
                        </td>

                        {/* Data & Horário */}
                        <td className="p-4">
                          <div className="font-semibold text-gray-700">{dataFormatada}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{horaFormatada}</div>
                        </td>

                        {/* Valor */}
                        <td className="p-4 font-mono font-bold text-emerald-600">
                          {a.valor_cobrado != null ? `R$ ${a.valor_cobrado.toFixed(2)}` : '—'}
                        </td>

                        {/* Status */}
                        <td className="p-4">
                          {a.status === 'agendado' && (
                            <Badge className="bg-indigo-50 border border-indigo-150 text-indigo-700 rounded-lg text-[9px] font-bold py-0.5 px-1.5">
                              Agendado
                            </Badge>
                          )}
                          {a.status === 'em_andamento' && (
                            <Badge className="bg-amber-50 border border-amber-150 text-amber-700 rounded-lg text-[9px] font-bold py-0.5 px-1.5 animate-pulse">
                              No Banho
                            </Badge>
                          )}
                          {a.status === 'finalizado' && (
                            <Badge className="bg-emerald-50 border border-emerald-150 text-emerald-700 rounded-lg text-[9px] font-bold py-0.5 px-1.5">
                              Concluído
                            </Badge>
                          )}
                          {a.status === 'cancelado' && (
                            <Badge className="bg-slate-100 border border-slate-200 text-gray-400 rounded-lg text-[9px] font-bold py-0.5 px-1.5">
                              Cancelado
                            </Badge>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {a.status === 'agendado' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(a.id, 'em_andamento')}
                                className="h-7 px-2 text-[9px] font-bold uppercase rounded-lg border text-indigo-600 border-indigo-200 hover:bg-indigo-50 cursor-pointer animate-scale-in"
                              >
                                Iniciar
                              </Button>
                            )}
                            {a.status === 'em_andamento' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(a.id, 'finalizado')}
                                className="h-7 px-2 text-[9px] font-bold uppercase rounded-lg border text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-pointer animate-scale-in"
                              >
                                Finalizar
                              </Button>
                            )}
                            {a.status !== 'finalizado' && a.status !== 'cancelado' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Deseja realmente cancelar este agendamento?')) {
                                    handleStatusUpdate(a.id, 'cancelado')
                                  }
                                }}
                                className="h-7 w-7 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer flex items-center justify-center p-0 transition-colors"
                                title="Cancelar"
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                            {a.gcal_event_id && (
                              <a
                                href="https://calendar.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-7 w-7 flex items-center justify-center text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Ver no Google Agenda"
                              >
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação do Histórico */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-450 font-medium">
                Página <strong className="text-gray-700">{currentPage}</strong> de <strong className="text-gray-700">{totalPages}</strong> ({filteredHistorico.length} registros)
              </span>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="h-8 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={13} />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="h-8 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Próximo
                  <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modal Inteligente Novo Agendamento */}
      <ModalNovoAgendamento
        isOpen={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        clientes={clientes}
        pets={pets}
        servicos={servicos}
        onSuccess={handleCreateSuccess}
      />

    </div>
  )
}
