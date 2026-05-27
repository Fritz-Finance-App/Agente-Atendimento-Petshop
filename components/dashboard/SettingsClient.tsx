'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Petshop, ServicoCatalogo } from '@/types/database'
import { 
  Building, 
  Settings, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Calendar, 
  Globe, 
  Info, 
  Smartphone, 
  Wifi, 
  Loader2, 
  Sparkles,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react'

interface SettingsClientProps {
  initialPetshop: Petshop
  initialServices: ServicoCatalogo[]
}

export default function SettingsClient({ initialPetshop, initialServices }: SettingsClientProps) {
  const [petshop, setPetshop] = useState<Petshop>(initialPetshop)
  const [services, setServices] = useState<ServicoCatalogo[]>(initialServices)
  const [activeTab, setActiveTab] = useState('perfil')
  const [isPending, startTransition] = useTransition()

  // Estado do Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  function toggleTheme() {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark')
      setIsDarkMode(isDark)
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }

  // Estados dos formulários de Perfil
  const [nome, setNome] = useState(petshop.nome)
  const [whatsapp, setWhatsapp] = useState(petshop.whatsapp_numero || '')
  const [endereco, setEndereco] = useState(petshop.endereco || '')
  const [horarioAbertura, setHorarioAbertura] = useState(petshop.horario_abertura || '08:00')
  const [horarioFechamento, setHorarioFechamento] = useState(petshop.horario_fechamento || '18:00')
  const [diasFuncionamento, setDiasFuncionamento] = useState<string[]>(
    petshop.dias_funcionamento || ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
  )
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false)
  const [saveProfileError, setSaveProfileError] = useState('')

  // Estados do CRUD de Serviços
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false)
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState('')
  const [serviceActionError, setServiceActionError] = useState('')

  // Estados de Edição de Serviço
  const [editingService, setEditingService] = useState<ServicoCatalogo | null>(null)
  const [editServiceName, setEditServiceName] = useState('')
  const [editServicePrice, setEditServicePrice] = useState('')

  // Estados da simulação da Evolution API (WhatsApp)
  const [isMockConnected, setIsMockConnected] = useState(!!petshop.whatsapp_numero)
  const [showQRModal, setShowQRModal] = useState(false)
  const [mockQR, setMockQR] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppMockConnected')

  // ─── 1. Atualizar Perfil do Petshop ──────────────────────────
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaveProfileError('')
    setSaveProfileSuccess(false)

    startTransition(async () => {
      try {
        const res = await fetch('/api/settings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nome, 
            whatsapp_numero: whatsapp, 
            endereco,
            horario_abertura: horarioAbertura,
            horario_fechamento: horarioFechamento,
            dias_funcionamento: diasFuncionamento
          })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Falha ao salvar as alterações.')
        }

        setPetshop(data.petshop)
        setSaveProfileSuccess(true)
        setTimeout(() => setSaveProfileSuccess(false), 3000)
      } catch (err: any) {
        setSaveProfileError(err.message)
      }
    })
  }

  // ─── 2. Criar Serviço no Catálogo ───────────────────────────
  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault()
    setServiceActionError('')

    if (!newServiceName.trim() || !newServicePrice) {
      setServiceActionError('Preencha todos os campos.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo_servico: newServiceName, preco_base: parseFloat(newServicePrice) })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao cadastrar serviço.')
        }

        setServices(prev => [...prev, data.service].sort((a, b) => a.tipo_servico.localeCompare(b.tipo_servico)))
        setIsNewServiceOpen(false)
        setNewServiceName('')
        setNewServicePrice('')
      } catch (err: any) {
        setServiceActionError(err.message)
      }
    })
  }

  // ─── 3. Editar Serviço no Catálogo ──────────────────────────
  async function handleUpdateService(e: React.FormEvent) {
    e.preventDefault()
    if (!editingService) return

    setServiceActionError('')

    startTransition(async () => {
      try {
        const res = await fetch('/api/services', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingService.id,
            tipo_servico: editServiceName,
            preco_base: parseFloat(editServicePrice)
          })
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao salvar alterações.')
        }

        setServices(prev =>
          prev
            .map(s => s.id === editingService.id ? data.service : s)
            .sort((a, b) => a.tipo_servico.localeCompare(b.tipo_servico))
        )
        setEditingService(null)
      } catch (err: any) {
        setServiceActionError(err.message)
      }
    })
  }

  // ─── 4. Deletar Serviço ──────────────────────────────────────
  async function handleDeleteService(id: string) {
    if (!confirm('Deseja realmente remover este serviço do catálogo? Esta ação fará com que a IA pare de oferecê-lo no WhatsApp.')) return

    startTransition(async () => {
      try {
        const res = await fetch(`/api/services?id=${id}`, {
          method: 'DELETE'
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao excluir serviço.')
        }

        setServices(prev => prev.filter(s => s.id !== id))
      } catch (err: any) {
        alert(`Erro: ${err.message}`)
      }
    })
  }

  // ─── 5. Simular Desconexão do WhatsApp ────────────────────────
  function handleDisconnectMockWhatsapp() {
    setIsMockConnected(false)
    setWhatsapp('')
    // Atualiza no banco
    fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: petshop.nome, whatsapp_numero: null, endereco: petshop.endereco })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setPetshop(data.petshop)
      }
    })
  }

  // ─── 6. Simular Conexão do WhatsApp ──────────────────────────
  function handleConnectMockWhatsapp() {
    setIsMockConnected(true)
    const newNum = '5511999999999'
    setWhatsapp(newNum)
    // Atualiza no banco
    fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: petshop.nome, whatsapp_numero: newNum, endereco: petshop.endereco })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setPetshop(data.petshop)
        setShowQRModal(false)
      }
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-slide-up">
      {/* Sidebar de Abas baseada em Fireart Task Board */}
      <div className="w-full md:w-64 shrink-0 flex flex-col space-y-2">
        {[
          { id: 'perfil', label: 'Perfil do Petshop', icon: Building, desc: 'Informações cadastrais' },
          { id: 'catalogo', label: 'Catálogo de Serviços', icon: Database, desc: 'Preços base para IA & Painel' },
          { id: 'integracoes', label: 'Integrações Ativas', icon: Globe, iconColor: 'text-indigo-600', desc: 'Google Calendar e WhatsApp' },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full p-4 rounded-2xl text-left border flex items-center gap-3.5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] dark:shadow-none hover:shadow-md cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-102 font-semibold shadow-[0_10px_20px_-8px_rgba(79,70,229,0.3)]'
                  : 'bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/40 border-gray-200/60 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:border-gray-300/80 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/10 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold block truncate leading-none">{tab.label}</span>
                <span className={`text-[10px] block mt-0.5 truncate leading-none ${isActive ? 'text-white/75' : 'text-gray-400 dark:text-slate-450'}`}>
                  {tab.desc}
                </span>
              </div>
            </button>
          )
        })}

        {/* Divisor */}
        <div className="border-t border-gray-100 dark:border-slate-800 my-3" />

        {/* Botão Alternador de Tema Escuro / Claro */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-full p-4 rounded-2xl text-left border flex items-center gap-3.5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] dark:shadow-none hover:shadow-md cursor-pointer bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/40 border-gray-200/60 dark:border-slate-800 text-gray-700 dark:text-slate-200 hover:border-gray-300/80 dark:hover:border-slate-700"
        >
          <div className="p-2 rounded-xl shrink-0 bg-amber-50 dark:bg-indigo-950/40 text-amber-600 dark:text-indigo-400 animate-scale-in">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold block truncate leading-none">Tema Visual</span>
            <span className="text-[10px] block mt-0.5 truncate leading-none text-gray-400 dark:text-slate-450">
              {isDarkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            </span>
          </div>
        </button>

      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-premium min-h-[480px] transition-colors duration-300">
        {/* ==========================================
            ABA 1: PERFIL DO PETSHOP
            ========================================== */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleUpdateProfile} className="space-y-6 animate-scale-in">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-gray-800">Dados do Petshop</h3>
              <p className="text-xs text-gray-500">Edite as informações exibidas no painel e usadas no prompt básico do seu atendente.</p>
            </div>

            {saveProfileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
                <Check size={16} className="text-emerald-600" />
                Alterações de perfil salvas com sucesso! A IA do WhatsApp já está atualizada.
              </div>
            )}

            {saveProfileError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle size={16} className="text-rose-600" />
                {saveProfileError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-xs font-bold uppercase tracking-wider text-gray-500">Nome do Estabelecimento</Label>
                <Input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Pet da Esquina"
                  className="rounded-xl h-11 focus-visible:ring-indigo-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-wider text-gray-500">Telefone Conectado (Evolution API)</Label>
                <Input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="Ex: 5511999999999"
                  disabled={isMockConnected}
                  className="rounded-xl h-11 focus-visible:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
                />
                {isMockConnected && (
                  <p className="text-[10px] text-gray-400">
                    O WhatsApp está conectado ativamente. Desconecte-o na aba <strong>Integrações</strong> para alterar o número.
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco" className="text-xs font-bold uppercase tracking-wider text-gray-500">Endereço Completo</Label>
                <Input
                  id="endereco"
                  type="text"
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1000 - Cj 52, São Paulo - SP"
                  className="rounded-xl h-11 focus-visible:ring-indigo-600"
                />
              </div>

              {/* Horário de Funcionamento */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Horário de Expediente</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="abertura" className="text-[10px] text-gray-400 font-semibold uppercase">Abertura</Label>
                    <Input
                      id="abertura"
                      type="time"
                      value={horarioAbertura}
                      onChange={e => setHorarioAbertura(e.target.value)}
                      className="rounded-xl h-11 focus-visible:ring-indigo-600 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fechamento" className="text-[10px] text-gray-400 font-semibold uppercase">Fechamento</Label>
                    <Input
                      id="fechamento"
                      type="time"
                      value={horarioFechamento}
                      onChange={e => setHorarioFechamento(e.target.value)}
                      className="rounded-xl h-11 focus-visible:ring-indigo-600 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Dias de Funcionamento */}
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Dias de Funcionamento</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'segunda', label: 'Segunda' },
                    { id: 'terca', label: 'Terça' },
                    { id: 'quarta', label: 'Quarta' },
                    { id: 'quinta', label: 'Quinta' },
                    { id: 'sexta', label: 'Sexta' },
                    { id: 'sabado', label: 'Sábado' },
                    { id: 'domingo', label: 'Domingo' },
                  ].map((day) => {
                    const isSelected = diasFuncionamento.includes(day.id)
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => {
                          setDiasFuncionamento(prev =>
                            prev.includes(day.id)
                              ? prev.filter(d => d !== day.id)
                              : [...prev, day.id]
                          )
                        }}
                        className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex gap-2 text-[10px] text-indigo-900 leading-snug mt-2">
                  <Info size={14} className="text-indigo-650 shrink-0 mt-0.5" />
                  <span>
                    O assistente virtual do WhatsApp (IA) utilizará estes horários e dias úteis configurados para recusar agendamentos fora do expediente de forma inteligente!
                  </span>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 shadow-[0_10px_20px_-8px_rgba(79,70,229,0.3)]">
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Salvando...
                  </>
                ) : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        )}

        {/* ==========================================
            ABA 2: CATÁLOGO DE SERVIÇOS (CRUD)
            ========================================== */}
        {activeTab === 'catalogo' && (
          <div className="space-y-6 animate-scale-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Catálogo de Serviços</h3>
                <p className="text-xs text-gray-500">Cadastre o portfólio de banhos, tosas e consultas que o n8n utiliza para agendar.</p>
              </div>

              <Dialog open={isNewServiceOpen} onOpenChange={setIsNewServiceOpen}>
                <DialogTrigger className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 flex items-center gap-1.5 cursor-pointer shadow-sm text-sm font-semibold">
                  <Plus size={16} /> Novo Serviço
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleCreateService}>
                    <DialogHeader>
                      <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
                      <DialogDescription>
                        Insira os detalhes do serviço. O atendente virtual passará a oferecer este serviço imediatamente.
                      </DialogDescription>
                    </DialogHeader>

                    {serviceActionError && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800 my-2">
                        <AlertCircle size={14} className="text-rose-600 shrink-0" />
                        <span>{serviceActionError}</span>
                      </div>
                    )}

                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service_name" className="text-right text-xs">Serviço</Label>
                        <Input
                          id="service_name"
                          placeholder="Ex: Tosa Bebê"
                          value={newServiceName}
                          onChange={e => setNewServiceName(e.target.value)}
                          className="col-span-3 rounded-lg focus-visible:ring-indigo-600"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="service_price" className="text-right text-xs">Preço Base</Label>
                        <div className="col-span-3 flex items-center gap-1">
                          <span className="text-sm text-gray-500">R$</span>
                          <Input
                            id="service_price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ex: 85.00"
                            value={newServicePrice}
                            onChange={e => setNewServicePrice(e.target.value)}
                            className="rounded-lg focus-visible:ring-indigo-600"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                        {isPending ? 'Salvando...' : 'Cadastrar Serviço'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Listagem Premium de Serviços */}
            {editingService ? (
              // Modo de Edição Ativo
              <form onSubmit={handleUpdateService} className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-2xl space-y-4 animate-scale-in">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Editando Serviço</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit_name" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nome do Serviço</Label>
                    <Input
                      id="edit_name"
                      value={editServiceName}
                      onChange={e => setEditServiceName(e.target.value)}
                      className="bg-white rounded-lg h-10 focus-visible:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit_price" className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Preço Base (R$)</Label>
                    <Input
                      id="edit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editServicePrice}
                      onChange={e => setEditServicePrice(e.target.value)}
                      className="bg-white rounded-lg h-10 focus-visible:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingService(null)} className="rounded-lg h-9">
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9">
                    {isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            ) : null}

            {services.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-gray-200 rounded-3xl space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-400">Catálogo Vazio</p>
                <p className="text-xs text-gray-400">Nenhum serviço cadastrado no momento. Cadastre o primeiro acima!</p>
              </div>
            ) : (
              <div className="border border-gray-200/50 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm divide-y divide-gray-100">
                  <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <tr>
                      <th className="p-4">Serviço</th>
                      <th className="p-4 text-right">Preço Base</th>
                      <th className="p-4 text-center w-28">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {services.map(service => (
                      <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="p-4 font-bold text-gray-800">{service.tipo_servico}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-600">R$ {Number(service.preco_base).toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingService(service)
                                setEditServiceName(service.tipo_servico)
                                setEditServicePrice(String(service.preco_base))
                              }}
                              className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                              title="Editar preço/nome"
                            >
                              <Edit3 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteService(service.id)}
                              className="h-8 w-8 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            ABA 3: INTEGRAÇÕES
            ========================================== */}
        {activeTab === 'integracoes' && (
          <div className="space-y-6 animate-scale-in">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-gray-800">Conexões & Integrações</h3>
              <p className="text-xs text-gray-500">Monitore as integrações da Evolution API e Google Calendar para controle de agendamentos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* WhatsApp Evolution API */}
              <Card className="rounded-2xl border border-gray-200/70 overflow-hidden hover:border-gray-300 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3 bg-slate-50 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 p-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="text-indigo-600" size={18} />
                    <CardTitle className="text-sm font-bold text-gray-800 leading-none">WhatsApp Business</CardTitle>
                  </div>
                  {isMockConnected ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Wifi size={10} className="animate-pulse" /> Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      Pendente
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="text-xs text-gray-500 space-y-2">
                    <p>
                      Conecta o número de atendimento ao webhook do n8n para a recepcionista IA responder clientes e salvar reservas.
                    </p>
                    {isMockConnected && (
                      <div className="bg-gray-50 border p-2.5 rounded-xl text-gray-600 font-mono text-[10px] flex items-center justify-between">
                        <span>Instância: <strong>{petshop.nome.toLowerCase().replace(/\s+/g, '-')}</strong></span>
                        <span>Número: <strong>+{whatsapp}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center gap-2 border-t">
                    {isMockConnected ? (
                      <Button
                        variant="outline"
                        onClick={handleDisconnectMockWhatsapp}
                        className="w-full text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 rounded-xl h-10 transition-colors"
                      >
                        Desconectar WhatsApp
                      </Button>
                    ) : (
                      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
                        <DialogTrigger className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 text-xs shadow-sm cursor-pointer font-semibold flex items-center justify-center">
                          Conectar Nova Instância
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] flex flex-col items-center">
                          <DialogHeader className="text-center w-full">
                            <DialogTitle>Vincular WhatsApp</DialogTitle>
                            <DialogDescription>
                              Escaneie o QR Code com o aplicativo WhatsApp no seu celular (WhatsApp Business recomendado).
                            </DialogDescription>
                          </DialogHeader>

                          <div className="my-4 border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-white shadow-inner flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mockQR} alt="Evolution API QR Code" width={180} height={180} className="rounded-lg" />
                          </div>

                          <DialogFooter className="w-full sm:justify-center">
                            <Button onClick={handleConnectMockWhatsapp} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 text-xs w-full">
                              Simular QR Code Escaneado
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Google Calendar Sync */}
              <Card className="rounded-2xl border border-gray-200/70 overflow-hidden hover:border-gray-300 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3 bg-slate-50 border-b border-gray-100 flex flex-row items-center justify-between space-y-0 p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-indigo-600" size={18} />
                    <CardTitle className="text-sm font-bold text-gray-800 leading-none">Google Calendar</CardTitle>
                  </div>
                  {petshop.gcal_access_token ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      Sincronizado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      Inativo
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="text-xs text-gray-500 space-y-2">
                    <p>
                      Sincroniza todos os agendamentos diretamente na sua agenda Google. Cria bloqueios automáticos no calendário para evitar double booking.
                    </p>
                    <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-xl p-2 text-[10px] text-blue-800 leading-snug">
                      <Info size={12} className="shrink-0 text-blue-600 mt-0.5" />
                      <span>Integração com OAuth 2.0 seguro. Seus dados estão 100% protegidos.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-2 border-t">
                    {petshop.gcal_access_token ? (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (confirm('Deseja realmente remover a sincronização com o Google Calendar? Novos serviços não serão criados no seu calendário.')) {
                            // Limpar tokens no banco
                            const res = await fetch('/api/settings/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ nome: petshop.nome, whatsapp_numero: petshop.whatsapp_numero, endereco: petshop.endereco })
                            })
                            // Forçar recarga da página para limpar tokens (OAuth)
                            window.location.href = '/dashboard/settings'
                          }
                        }}
                        className="w-full text-xs border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 rounded-xl h-10 transition-colors"
                      >
                        Desconectar Google Calendar
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          const params = new URLSearchParams({
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
                            redirect_uri: `${window.location.origin}/api/auth/google/callback`,
                            response_type: 'code',
                            scope: 'https://www.googleapis.com/auth/calendar.events',
                            access_type: 'offline',
                            prompt: 'consent',
                            state: 'settings', // Redirecionará de volta para as settings após conectar
                          })
                          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 text-xs shadow-sm cursor-pointer"
                      >
                        Sincronizar Google Calendar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
