'use client'

import { useState, useMemo, useTransition } from 'react'
import type { Cliente, Pet } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Users, 
  Search, 
  Plus, 
  Dog, 
  Cat, 
  Smartphone, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Info,
  CalendarDays,
  UserPlus
} from 'lucide-react'

interface ClientesClientProps {
  initialClientes: Cliente[]
  initialPets: Pet[]
  initialAgendamentos: {
    id: string
    cliente_id: string | null
    data_hora_inicio: string
    tipo_servico: string
    valor_cobrado: number | null
    status: string
  }[]
}

export default function ClientesClient({ initialClientes, initialPets, initialAgendamentos }: ClientesClientProps) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [isPending, startTransition] = useTransition()

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'ativos' | 'retencao'>('ativos')

  // Controle de disparos de reatração
  const [disparandoClienteId, setDisparandoClienteId] = useState<string | null>(null)
  const [reatraidosIds, setReatraidosIds] = useState<Set<string>>(new Set())
  const [retencaoError, setRetencaoError] = useState<string | null>(null)
  const [retencaoSuccess, setRetencaoSuccess] = useState<string | null>(null)

  // Buscador textual
  const [searchTerm, setSearchTerm] = useState('')

  // Controla ID do cliente expandido (Sanbox/Accordion visual)
  const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null)

  // Estados de criação de cliente
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [clientError, setClientError] = useState('')

  // Estados de criação de pet
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [newPetTutorId, setNewPetTutorId] = useState('')
  const [newPetName, setNewPetName] = useState('')
  const [newPetSpecies, setNewPetSpecies] = useState('Cão')
  const [newPetBreed, setNewPetBreed] = useState('')
  const [newPetSize, setNewPetSize] = useState<'pequeno' | 'medio' | 'grande'>('medio')
  const [petError, setPetError] = useState('')

  // Toggle Accordion do cliente
  function toggleExpand(id: string) {
    if (expandedClienteId === id) {
      setExpandedClienteId(null)
    } else {
      setExpandedClienteId(id)
    }
  }

  // Filtragem inteligente de contatos por Tutor ou Pet associado
  const filteredClientes = useMemo(() => {
    return clientes.filter(c => {
      const query = searchTerm.toLowerCase()
      const clientName = c.nome.toLowerCase()
      const clientPhone = c.telefone.toLowerCase()
      
      // Busca se o nome ou telefone do tutor contém a query
      if (clientName.includes(query) || clientPhone.includes(query)) return true

      // Busca se algum pet do tutor contém a query no nome
      const tutorPets = pets.filter(p => p.cliente_id === c.id)
      return tutorPets.some(p => p.nome.toLowerCase().includes(query) || p.especie.toLowerCase().includes(query))
    })
  }, [clientes, pets, searchTerm])

  // LÓGICA DE INATIVIDADE (30+ DIAS) PARA CAMPANHA DE RETENÇÃO
  const clientesInativos = useMemo(() => {
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)

    return clientes.map(c => {
      const tutorAgendamentos = initialAgendamentos.filter(a => a.cliente_id === c.id && a.status !== 'cancelado')
      
      if (tutorAgendamentos.length === 0) {
        // Se nunca agendou e o cadastro é antigo (mais de 30 dias)
        const dataCadastro = new Date(c.created_at)
        const isAntigo = dataCadastro <= trintaDiasAtras
        return {
          cliente: c,
          ultimoAgendamento: null,
          diasInativo: isAntigo ? Math.floor((Date.now() - dataCadastro.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          inativo: isAntigo
        }
      }

      // Ordena por data decrescente
      const ordenados = [...tutorAgendamentos].sort((a, b) => 
        new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime()
      )

      const ultimo = ordenados[0]
      const dataUltimo = new Date(ultimo.data_hora_inicio)
      
      // Verifica se tem agendamento futuro
      const temFuturo = tutorAgendamentos.some(a => 
        new Date(a.data_hora_inicio) > new Date() && (a.status === 'agendado' || a.status === 'em_andamento')
      )

      const isInativo = dataUltimo <= trintaDiasAtras && !temFuturo
      const diasInativo = isInativo ? Math.floor((Date.now() - dataUltimo.getTime()) / (1000 * 60 * 60 * 24)) : 0

      return {
        cliente: c,
        ultimoAgendamento: ultimo,
        diasInativo,
        inativo: isInativo
      }
    }).filter(item => item.inativo)
  }, [clientes, initialAgendamentos])

  // Filtragem dos inativos para a busca textual
  const filteredInativos = useMemo(() => {
    return clientesInativos.filter(item => {
      const query = searchTerm.toLowerCase()
      const clientName = item.cliente.nome.toLowerCase()
      const clientPhone = item.cliente.telefone.toLowerCase()
      
      if (clientName.includes(query) || clientPhone.includes(query)) return true

      const tutorPets = pets.filter(p => p.cliente_id === item.cliente.id)
      return tutorPets.some(p => p.nome.toLowerCase().includes(query) || p.especie.toLowerCase().includes(query))
    })
  }, [clientesInativos, pets, searchTerm])

  // Handler para disparar a reatração n8n/WhatsApp
  async function handleReatrair(clienteId: string, ultimoAgendamento: any) {
    setRetencaoError(null)
    setRetencaoSuccess(null)
    setDisparandoClienteId(clienteId)

    try {
      const res = await fetch('/api/clientes/reatrair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId, ultimoAgendamento })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar campanha de reatração.')
      }

      setReatraidosIds(prev => {
        const next = new Set(prev)
        next.add(clienteId)
        return next
      })
      
      // Feedback temporário
      setRetencaoSuccess(`Campanha enviada com sucesso para ${clientes.find(c => c.id === clienteId)?.nome}!`)
      setTimeout(() => setRetencaoSuccess(null), 5000)
    } catch (err: any) {
      setRetencaoError(err.message)
      setTimeout(() => setRetencaoError(null), 7000)
    } finally {
      setDisparandoClienteId(null)
    }
  }

  // ─── 1. Submeter Criação de Tutor ──────────────────────────
  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault()
    setClientError('')

    if (!newClientName.trim() || !newClientPhone.trim()) {
      setClientError('Nome e telefone são obrigatórios.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/clientes/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: newClientName, telefone: newClientPhone })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao cadastrar tutor.')
        }

        // Adiciona de forma reativa ordenando
        setClientes(prev => [...prev, data.cliente].sort((a, b) => a.nome.localeCompare(b.nome)))
        setIsNewClientOpen(false)
        setNewClientName('')
        setNewClientPhone('')
        setExpandedClienteId(data.cliente.id) // Já expande o novo cadastrado!
      } catch (err: any) {
        setClientError(err.message)
      }
    })
  }

  // ─── 2. Submeter Associação de Pet ─────────────────────────
  async function handleCreatePet(e: React.FormEvent) {
    e.preventDefault()
    setPetError('')

    if (!newPetTutorId || !newPetName.trim() || !newPetSpecies) {
      setPetError('Dados obrigatórios ausentes.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/pets/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteId: newPetTutorId,
            nome: newPetName,
            especie: newPetSpecies,
            raca: newPetBreed,
            porte: newPetSize
          })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao cadastrar pet.')
        }

        setPets(prev => [...prev, data.pet].sort((a, b) => a.nome.localeCompare(b.nome)))
        setIsNewPetOpen(false)
        setNewPetName('')
        setNewPetBreed('')
        setNewPetSize('medio')
      } catch (err: any) {
        setPetError(err.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      
      {/* Feedbacks de Retenção */}
      {retencaoSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800 animate-slide-up shadow-sm">
          <Sparkles className="text-emerald-500 animate-pulse h-4 w-4 shrink-0" />
          <span className="font-bold">{retencaoSuccess}</span>
        </div>
      )}

      {retencaoError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-800 animate-slide-up shadow-sm">
          <AlertCircle className="text-rose-500 h-4 w-4 shrink-0" />
          <span className="font-bold">{retencaoError}</span>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────
          GRID SUPERIOR: CONTROLES & FILTROS (ESTILO FIREART)
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4 animate-scale-in">
        
        {/* Barra de Busca */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3.5 top-3.5 text-gray-400">
            <Search size={16} />
          </span>
          <Input
            type="text"
            placeholder={activeTab === 'ativos' ? "Buscar por tutor, pet ou espécie..." : "Buscar inativos..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 rounded-xl h-11 border-gray-200/70 focus-visible:ring-indigo-600 bg-gray-50/50"
          />
        </div>

        {/* Alternador de Abas Premium (Estilo Fireart) */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 backdrop-blur-md self-start md:self-center">
          <button
            onClick={() => {
              setActiveTab('ativos')
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
              activeTab === 'ativos'
                ? 'bg-white text-indigo-700 shadow-sm border border-gray-200/50 scale-102'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            Todos os Clientes
          </button>
          <button
            onClick={() => {
              setActiveTab('retencao')
              setSearchTerm('')
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'retencao'
                ? 'bg-indigo-600 text-white shadow-sm border border-indigo-700 scale-102 font-extrabold'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            <Sparkles size={12} className={activeTab === 'retencao' ? 'animate-pulse' : ''} />
            Retenção IA
            {clientesInativos.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.2 text-[9px] rounded-full font-black ${
                activeTab === 'retencao' ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
              }`}>
                {clientesInativos.length}
              </span>
            )}
          </button>
        </div>

        {/* Cadastro Novo Tutor (Dialog) */}
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-5 flex items-center gap-1.5 font-bold tracking-wide shadow-[0_10px_20px_-8px_rgba(79,70,229,0.3)] shrink-0 cursor-pointer text-xs font-semibold flex justify-center">
            <UserPlus size={16} /> Cadastrar Tutor
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <form onSubmit={handleCreateClient}>
              <DialogHeader>
                <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles size={14} className="animate-pulse" /> Cadastro de Tutor
                </div>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription className="text-xs">
                  Adicione um cliente no banco de dados. Os dados estarão disponíveis na IA e nos painéis.
                </DialogDescription>
              </DialogHeader>

              {clientError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800 my-2">
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <span>{clientError}</span>
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="c_name" className="text-xs">Nome Completo</Label>
                  <Input
                    id="c_name"
                    placeholder="Ex: Carlos Costa"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c_phone" className="text-xs">WhatsApp (Número)</Label>
                  <Input
                    id="c_phone"
                    placeholder="Ex: 11998765432"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider">
                  {isPending ? 'Salvando...' : 'Salvar Tutor'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      {/* ────────────────────────────────────────────────────────
          LISTAGEM PRINCIPAL: CONTATOS / GRID DE CARDS Expansíveis
          ──────────────────────────────────────────────────────── */}
      {activeTab === 'ativos' ? (
        filteredClientes.length === 0 ? (
          <div className="bg-white border border-gray-200/60 rounded-3xl p-16 text-center shadow-premium space-y-3 animate-scale-in">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-50 border border-indigo-100/50 text-indigo-700">
              <Users size={28} />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">Nenhum tutor encontrado</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Não existem clientes que correspondam à sua pesquisa no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
            {filteredClientes.map(c => {
              const tutorPets = pets.filter(p => p.cliente_id === c.id)
              const isExpanded = expandedClienteId === c.id

              return (
                <Card 
                  key={c.id}
                  className={`group rounded-3xl border transition-all duration-300 shadow-premium hover:shadow-premium-hover ${
                    isExpanded ? 'border-indigo-400 bg-indigo-50/5' : 'border-gray-200/50 bg-white'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    
                    {/* Cabeçalho do Card */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100/30 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-sm">
                          {c.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{c.nome}</h4>
                          <p className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5 leading-none mt-0.5">
                            <Smartphone size={10} /> +{c.telefone}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleExpand(c.id)}
                        className={`h-8 w-8 rounded-xl border flex items-center justify-center cursor-pointer transition-colors shadow-sm ${
                          isExpanded 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-slate-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Resumo de Pets (sempre visível de forma compacta) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-gray-100/70">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mr-1">Pets:</span>
                      {tutorPets.length === 0 ? (
                        <span className="text-[10px] text-gray-400 italic">Nenhum pet cadastrado</span>
                      ) : (
                        tutorPets.map(p => {
                          const isCat = p.especie.toLowerCase() === 'gato'
                          const Icon = isCat ? Cat : Dog
                          return (
                            <Badge 
                              key={p.id} 
                              variant="secondary" 
                              className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                                isCat 
                                  ? 'bg-indigo-50/60 border-indigo-100 text-indigo-700' 
                                  : 'bg-rose-50/60 border-rose-100 text-rose-700'
                              }`}
                            >
                              <Icon size={10} /> {p.nome}
                            </Badge>
                          )
                        })
                      )}
                    </div>

                    {/* Detalhes Expandidos (Pets Completo + Adicionar Pet) */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-gray-150 space-y-4 animate-scale-in">
                        
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Ficha dos Animais</span>
                          
                          {/* Cadastrar Pet Dialog */}
                          <Dialog open={isNewPetOpen} onOpenChange={(open) => {
                            setIsNewPetOpen(open)
                            if (open) {
                              setNewPetTutorId(c.id)
                              setPetError('')
                            }
                          }}>
                            <DialogTrigger className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 hover:underline cursor-pointer bg-transparent border-none">
                              <Plus size={11} /> Adicionar Pet
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                              <form onSubmit={handleCreatePet}>
                                <DialogHeader>
                                  <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                                    <Sparkles size={14} className="animate-pulse" /> Cadastro de Pet
                                  </div>
                                  <DialogTitle>Associar Pet ao Tutor</DialogTitle>
                                  <DialogDescription className="text-xs">
                                    Cadastre as fichas dos animais. Vinculados diretamente ao CPF/Tutor.
                                  </DialogDescription>
                                </DialogHeader>

                                {petError && (
                                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800 my-2">
                                    <AlertCircle size={14} className="text-rose-600 shrink-0" />
                                    <span>{petError}</span>
                                  </div>
                                )}

                                <div className="grid gap-3.5 py-4">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5 col-span-2">
                                      <Label htmlFor="p_name" className="text-xs">Nome do Pet</Label>
                                      <Input
                                        id="p_name"
                                        placeholder="Ex: Rex"
                                        value={newPetName}
                                        onChange={e => setNewPetName(e.target.value)}
                                        className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1.5 col-span-1">
                                      <Label htmlFor="p_species" className="text-xs">Espécie</Label>
                                      <select
                                        id="p_species"
                                        value={newPetSpecies}
                                        onChange={e => setNewPetSpecies(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg h-10 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                                      >
                                        <option value="Cão">Cão</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Outro">Outro</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label htmlFor="p_breed" className="text-xs">Raça (Opcional)</Label>
                                    <Input
                                      id="p_breed"
                                      placeholder="Ex: Golden Retriever"
                                      value={newPetBreed}
                                      onChange={e => setNewPetBreed(e.target.value)}
                                      className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs block mb-1">Porte do Animal</Label>
                                    <div className="flex gap-2">
                                      {(['pequeno', 'medio', 'grande'] as const).map(p => (
                                        <button
                                          key={p}
                                          type="button"
                                          onClick={() => setNewPetSize(p)}
                                          className={`flex-1 py-1.5 text-xs font-bold capitalize border rounded-lg transition-all cursor-pointer ${
                                            newPetSize === p
                                              ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-extrabold shadow-sm'
                                              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                                          }`}
                                        >
                                          {p}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider">
                                    {isPending ? 'Salvando...' : 'Salvar Ficha do Pet'}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>

                        </div>

                        {/* Grade de Fichas dos Pets */}
                        {tutorPets.length === 0 ? (
                          <p className="text-[10px] text-gray-400 italic">Cadastre o primeiro pet clicando no link acima.</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2.5">
                            {tutorPets.map(p => {
                              const isGato = p.especie.toLowerCase() === 'gato'
                              const AnimalIcon = isGato ? Cat : Dog
                              return (
                                <div key={p.id} className="flex justify-between items-center bg-gray-50/70 border border-gray-100 p-3 rounded-2xl text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg border shadow-sm ${isGato ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' : 'bg-rose-50/50 text-rose-600 border-rose-100'}`}>
                                      <AnimalIcon size={12} />
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-800 block leading-tight">{p.nome}</span>
                                      <span className="text-[9px] text-gray-400 font-semibold uppercase leading-none block mt-0.5">
                                        {p.especie} {p.raca ? `• ${p.raca}` : ''}
                                      </span>
                                    </div>
                                  </div>

                                  {p.porte && (
                                    <Badge className="bg-white border text-gray-500 rounded-lg text-[9px] uppercase tracking-wide px-1.5 py-0.2 capitalize">
                                      Porte: {p.porte}
                                    </Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Dica de Agendamento Rápido */}
                        <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-2xl p-2.5 flex gap-2 text-[9px] text-indigo-900 leading-snug">
                          <Info size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                          <span>Este tutor e seus pets estão totalmente catalogados e aptos a realizar agendamentos dinâmicos pela aba <strong>Agenda</strong>.</span>
                        </div>

                      </div>
                    )}

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        // RENDERIZAÇÃO ABA CAMPANHA DE RETENÇÃO
        filteredInativos.length === 0 ? (
          <div className="bg-white border border-gray-200/60 rounded-3xl p-16 text-center shadow-premium space-y-3 animate-scale-in">
            <div className="inline-flex p-4 rounded-3xl bg-indigo-50 border border-indigo-100/50 text-indigo-700 animate-bounce">
              <Sparkles size={28} />
            </div>
            <h4 className="font-bold text-gray-800 text-sm">Todos os clientes estão ativos!</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Excelente! Nenhum cliente está inativo há mais de 30 dias. Sua operação está rodando com máxima engajamento e retenção! 🎉
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
            {filteredInativos.map(({ cliente: c, ultimoAgendamento, diasInativo }) => {
              const tutorPets = pets.filter(p => p.cliente_id === c.id)
              const disparando = disparandoClienteId === c.id
              const jaEnviado = reatraidosIds.has(c.id)

              return (
                <Card 
                  key={c.id}
                  className="rounded-3xl border border-gray-250 bg-white shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    
                    {/* Linha Superior: Info Tutor & Tag de Inatividade */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100/40 flex items-center justify-center text-amber-600 font-extrabold shrink-0 text-sm">
                          {c.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm truncate">{c.nome}</h4>
                          <p className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5 leading-none mt-0.5">
                            <Smartphone size={10} /> +{c.telefone}
                          </p>
                        </div>
                      </div>

                      <Badge 
                        variant="secondary"
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                          diasInativo >= 60 
                            ? 'bg-rose-50 border-rose-150 text-rose-700 animate-pulse' 
                            : 'bg-amber-55/60 border-amber-150 text-amber-800'
                        }`}
                      >
                        Inativo há {diasInativo} dias
                      </Badge>
                    </div>

                    {/* Pets Associados */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-gray-100/70">
                      <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mr-1">Pets:</span>
                      {tutorPets.length === 0 ? (
                        <span className="text-[10px] text-gray-400 italic font-medium">Sem pets cadastrados</span>
                      ) : (
                        tutorPets.map(p => {
                          const isCat = p.especie.toLowerCase() === 'gato'
                          const Icon = isCat ? Cat : Dog
                          return (
                            <Badge 
                              key={p.id} 
                              variant="secondary" 
                              className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                                isCat 
                                  ? 'bg-indigo-50/60 border-indigo-100 text-indigo-700' 
                                  : 'bg-rose-50/60 border-rose-100 text-rose-700'
                              }`}
                            >
                              <Icon size={10} /> {p.nome}
                            </Badge>
                          )
                        })
                      )}
                    </div>

                    {/* Informações do Último Serviço */}
                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-3 text-xs space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block">Histórico de Atendimento</span>
                      {ultimoAgendamento ? (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">
                            Último serviço: <span className="text-indigo-600 font-bold">{ultimoAgendamento.tipo_servico}</span>
                          </span>
                          <span className="text-gray-450 font-mono text-[10px] font-bold">
                            {new Date(ultimoAgendamento.data_hora_inicio).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Nenhum serviço registrado anteriormente.</span>
                      )}
                    </div>

                    {/* Botão de Ação de Reatração IA */}
                    <button
                      disabled={disparando || jaEnviado}
                      onClick={() => handleReatrair(c.id, ultimoAgendamento)}
                      className={`w-full rounded-2xl h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 border ${
                        jaEnviado
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-600 hover:opacity-95 shadow-[0_6px_15px_-4px_rgba(79,70,229,0.25)] active:scale-98'
                      }`}
                    >
                      {disparando ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" />
                          Disparando campanha...
                        </>
                      ) : jaEnviado ? (
                        <>
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                          Campanha Disparada
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="animate-pulse" />
                          Reatrair com WhatsApp IA
                        </>
                      )}
                    </button>

                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      )}

    </div>
  )
}
