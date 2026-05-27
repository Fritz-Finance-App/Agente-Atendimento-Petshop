'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Bot, 
  User, 
  Terminal, 
  MessageSquare, 
  Plus, 
  Clock, 
  Sparkles, 
  AlertTriangle, 
  FileJson, 
  HelpCircle,
  Database,
  ArrowRight
} from 'lucide-react'

// Interfaces do Simulador
interface Message {
  id: string
  sender: 'user' | 'agent'
  text: string
  timestamp: Date
  durationMs?: number
}

interface SimulatedClient {
  id: string
  nome: string
  telefone: string
  pet_nome?: string
  pet_especie?: string
}

export default function PlaygroundPage() {
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Estados de Carregamento e Dados
  const [loading, setLoading] = useState(false)
  const [dbClients, setDbClients] = useState<SimulatedClient[]>([])
  const [selectedClient, setSelectedClient] = useState<SimulatedClient>({
    id: 'mock-joao-id',
    nome: 'João Silva (Teste)',
    telefone: '5511999999901',
    pet_nome: 'Rex',
    pet_especie: 'Cão'
  })

  // Estado da conversa e entrada
  const [inputValue, setInputValue] = useState('')
  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    'mock-joao-id': [
      {
        id: 'welcome',
        sender: 'agent',
        text: 'Olá! Sou a recepcionista virtual. Em que posso ajudar seu pet hoje?',
        timestamp: new Date()
      }
    ]
  })

  // Console do Desenvolvedor
  const [lastPayloadSent, setLastPayloadSent] = useState<any>(null)
  const [lastPayloadReceived, setLastPayloadReceived] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'console' | 'services'>('console')
  const [servicos, setServicos] = useState<any[]>([])

  // Modal de Criação de Cliente Simulado
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')
  const [newClientPet, setNewClientPet] = useState('')
  const [newClientSpecies, setNewClientSpecies] = useState('')

  // RLS Helper: Buscar clientes reais do petshop
  useEffect(() => {
    async function loadClients() {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome, telefone')
          .order('nome', { ascending: true })
          .limit(10)

        if (data) {
          const mapped: SimulatedClient[] = data.map(c => ({
            id: c.id,
            nome: c.nome,
            telefone: c.telefone
          }))
          setDbClients(mapped)
        }
      } catch (err) {
        console.error('Erro ao carregar clientes do Supabase:', err)
      }
    }

    async function loadServices() {
      try {
        const { data } = await supabase
          .from('servicos_catalogo')
          .select('tipo_servico, preco_base')
        if (data) setServicos(data)
      } catch {}
    }

    loadClients()
    loadServices()
  }, [])

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, selectedClient.id])

  // Recupera mensagens do cliente selecionado
  const currentMessages = conversations[selectedClient.id] || []

  // Adiciona mensagem ao histórico
  const addMessage = (clientId: string, msg: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...msg,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date()
    }
    setConversations(prev => ({
      ...prev,
      [clientId]: [...(prev[clientId] || []), newMessage]
    }))
  }

  // Enviar Mensagem para o Route Handler Local
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || loading) return

    const textToSend = inputValue
    setInputValue('')
    setLoading(true)

    // 1. Adicionar mensagem do Usuário ao Chat
    addMessage(selectedClient.id, {
      sender: 'user',
      text: textToSend
    })

    try {
      // 2. Chamar o proxy seguro de API
      const res = await fetch('/api/testing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          phone: selectedClient.telefone,
          nome: selectedClient.nome,
          id: selectedClient.id.startsWith('mock') ? undefined : selectedClient.id
        })
      })

      const data = await res.json()

      // 3. Atualizar consoles do Dev
      if (data.payloadSent) setLastPayloadSent(data.payloadSent)
      if (data.payloadReceived) setLastPayloadReceived(data.payloadReceived)

      if (res.ok && data.ok) {
        // 4. Adicionar a resposta da IA ao Chat com latência
        addMessage(selectedClient.id, {
          sender: 'agent',
          text: data.resposta || 'Não compreendi muito bem. Poderia repetir?',
          durationMs: data.durationMs
        })

        // Se houver sinalização de handoff
        if (data.handoff) {
          addMessage(selectedClient.id, {
            sender: 'agent',
            text: '⚠️ [SISTEMA] O agente IA ativou o modo Handoff (atendimento humano solicitado).'
          })
        }
      } else {
        addMessage(selectedClient.id, {
          sender: 'agent',
          text: `❌ Erro de Simulação: ${data.error || 'Erro desconhecido'}`
        })
      }
    } catch (err: any) {
      addMessage(selectedClient.id, {
        sender: 'agent',
        text: `❌ Falha na conexão com o proxy local: ${err.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  // Criar Cliente Simulado Manualmente
  const handleCreateMockClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClientName || !newClientPhone) return

    const mockId = `mock-${Math.random().toString(36).substring(7)}`
    const newClient: SimulatedClient = {
      id: mockId,
      nome: `${newClientName} (Simulado)`,
      telefone: newClientPhone.replace(/\D/g, ''),
      pet_nome: newClientPet || undefined,
      pet_especie: newClientSpecies || undefined
    }

    // Inicializa histórico de chat
    setConversations(prev => ({
      ...prev,
      [mockId]: [
        {
          id: 'welcome',
          sender: 'agent',
          text: `Olá, ${newClientName}! Seja bem-vindo(a) com seu pet ${newClientPet || 'amiguinho'}. Como posso ajudar?`,
          timestamp: new Date()
        }
      ]
    }))

    setSelectedClient(newClient)
    setIsNewClientOpen(false)

    // Reset formulário
    setNewClientName('')
    setNewClientPhone('')
    setNewClientPet('')
    setNewClientSpecies('')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden">
      
      {/* 1. COLUNA ESQUERDA: LISTA DE CONTATOS / SIMULAÇÃO */}
      <div className="w-full lg:w-80 flex flex-col shrink-0 bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Contatos de Teste</h3>
            <p className="text-xs text-gray-500">Selecione para conversar</p>
          </div>
          
          <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
            <DialogTrigger className="h-8 w-8 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center cursor-pointer bg-white transition-colors">
              <Plus size={16} />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateMockClient}>
                <DialogHeader>
                  <DialogTitle>Simular Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Crie um contato fictício com dados específicos para testar os cenários de IA.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Tutor</Label>
                    <Input 
                      id="name" 
                      placeholder="Ex: Carlos Costa" 
                      className="col-span-3"
                      value={newClientName}
                      onChange={e => setNewClientName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Telefone</Label>
                    <Input 
                      id="phone" 
                      placeholder="Ex: 5511998765432" 
                      className="col-span-3" 
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pet" className="text-right">Pet</Label>
                    <Input 
                      id="pet" 
                      placeholder="Ex: Pipoca" 
                      className="col-span-3"
                      value={newClientPet}
                      onChange={e => setNewClientPet(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="species" className="text-right">Espécie</Label>
                    <Input 
                      id="species" 
                      placeholder="Ex: Gato" 
                      className="col-span-3"
                      value={newClientSpecies}
                      onChange={e => setNewClientSpecies(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Adicionar ao Simulator</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {/* Contato Inicial Fictício Padrão */}
          <button 
            onClick={() => setSelectedClient({
              id: 'mock-joao-id',
              nome: 'João Silva (Teste)',
              telefone: '5511999999901',
              pet_nome: 'Rex',
              pet_especie: 'Cão'
            })}
            className={`w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-gray-50
              ${selectedClient.id === 'mock-joao-id' ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''}`}
          >
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
              J
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800 truncate">João Silva</span>
                <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700 border-none font-medium hover:bg-blue-100">Mock Padrão</Badge>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">Rex (Cão) • +55 11 99999-9901</p>
            </div>
          </button>

          {/* Clientes Customizados Simulado */}
          {Object.values(selectedClient.id.startsWith('mock') && selectedClient.id !== 'mock-joao-id' ? [selectedClient] : []).map(client => (
            <button 
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-gray-50
                ${selectedClient.id === client.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''}`}
            >
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold shrink-0">
                {client.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-800 truncate">{client.nome.replace(' (Simulado)', '')}</span>
                  <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 border-none font-medium hover:bg-indigo-100">Simulado</Badge>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {client.pet_nome ? `${client.pet_nome} (${client.pet_especie || 'Pet'})` : 'Nenhum pet associado'} • +{client.telefone}
                </p>
              </div>
            </button>
          ))}

          {/* Divisor de Clientes Reais */}
          {dbClients.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              Clientes Reais do Banco
            </div>
          )}

          {/* Clientes Reais */}
          {dbClients.map(client => (
            <button 
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-gray-50
                ${selectedClient.id === client.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''}`}
            >
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold shrink-0">
                {client.nome.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-gray-800 truncate block">{client.nome}</span>
                <p className="text-xs text-gray-500 truncate mt-0.5">+{client.telefone}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. COLUNA CENTRAL: JANELA DE CHAT WHATSAPP */}
      <div className="flex-1 flex flex-col bg-slate-50 border rounded-xl overflow-hidden shadow-sm h-full">
        {/* Topo do Chat */}
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              IA
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                IA Recepcionista Virtual
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="text-xs text-gray-500">
                Simulando conversa com: <strong className="text-gray-700">{selectedClient.nome}</strong> (+{selectedClient.telefone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-1">
              Evolution Simulator
            </Badge>
          </div>
        </div>

        {/* Corpo do Chat - Mensagens */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#efeae2] relative patterns-whatsapp">
          {currentMessages.map((msg) => {
            const isAgent = msg.sender === 'agent'
            const isSystem = msg.text.startsWith('⚠️ [SISTEMA]')

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 flex items-center gap-2 text-xs text-amber-800 shadow-sm max-w-md">
                    <AlertTriangle size={14} className="shrink-0 text-amber-600" />
                    <span>{msg.text.replace('⚠️ [SISTEMA] ', '')}</span>
                  </div>
                </div>
              )
            }

            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[70%] rounded-xl px-4 py-2.5 shadow-sm relative transition-all duration-300
                  ${isAgent 
                    ? 'bg-white text-gray-800 rounded-tl-none' 
                    : 'bg-[#d9fdd3] text-gray-800 rounded-tr-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line break-words leading-relaxed">{msg.text}</p>
                  
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <span className="text-[9px] text-gray-400">
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isAgent && msg.durationMs !== undefined && (
                      <span className="text-[9px] text-gray-400 flex items-center gap-0.5 bg-gray-100 rounded-md px-1 py-0.2 shrink-0 border">
                        <Clock size={8} /> {msg.durationMs}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Balão de "Digitando..." animado */}
          {loading && (
            <div className="flex w-full justify-start">
              <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white shrink-0">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder={`Enviar mensagem como ${selectedClient.nome.split(' ')[0]}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              className="flex-1 bg-gray-50 border-gray-200 h-11 focus-visible:ring-blue-600 rounded-lg text-sm"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || loading}
              className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>

      {/* 3. COLUNA DIREITA: CONSOLE DO DESENVOLVEDOR */}
      <div className="w-full lg:w-96 shrink-0 bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
            <Terminal size={16} className="text-blue-600" />
            Console Dev & Debug
          </h3>
          <p className="text-xs text-gray-500">Inspecione os payloads do n8n em tempo real</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col min-h-0">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-10 w-full p-0 flex gap-2">
              <TabsTrigger 
                value="console"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent shadow-none"
              >
                Payloads JSON
              </TabsTrigger>
              <TabsTrigger 
                value="services"
                className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent shadow-none"
              >
                Serviços do Petshop
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-4 overflow-y-auto min-h-0">
            <TabsContent value="console" className="h-full space-y-4 m-0">
              {/* Payload Enviado */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Último Payload Enviado (X-Webhook)</span>
                <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
                  {lastPayloadSent ? (
                    <pre>{JSON.stringify(lastPayloadSent, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">Nenhuma requisição enviada nesta sessão. Digite algo no chat para gerar o payload.</span>
                  )}
                </div>
              </div>

              {/* Payload Recebido */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Último Payload Recebido (n8n Response)</span>
                <div className="bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-cyan-400 overflow-x-auto max-h-56">
                  {lastPayloadReceived ? (
                    <pre>{JSON.stringify(lastPayloadReceived, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-500 italic">Aguardando resposta do n8n...</span>
                  )}
                </div>
              </div>

              {/* Dica do Especialista */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 flex gap-3 text-xs text-blue-800">
                  <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold mb-1">Como refinar o estilo da conversa?</strong>
                    Você pode alterar as tabelas de preços e detalhes dos seus serviços cadastrados no Supabase. O n8n playground coletará esses dados atualizados em tempo real no próximo envio de mensagem!
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="h-full m-0 space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Serviços Atuais Cadastrados no Banco</span>
              
              {servicos.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 italic">
                  Nenhum serviço cadastrado na tabela `servicos_catalogo`.
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {servicos.map((servico, i) => (
                    <div key={i} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-semibold text-gray-700">{servico.tipo_servico}</span>
                      </div>
                      <span className="font-mono text-gray-800 font-bold">R$ {parseFloat(servico.preco_base).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <Card className="bg-gray-50 border-gray-200 mt-4">
                <CardContent className="p-4 text-xs text-gray-600 space-y-2">
                  <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                    <Database size={14} className="text-gray-500" />
                    <span>Conexão Supabase RLS ativa</span>
                  </div>
                  <p>Estes são os dados que o n8n lê dinamicamente via nó "Buscar Serviços" ao formular o contexto da IA recepcionista.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

    </div>
  )
}
