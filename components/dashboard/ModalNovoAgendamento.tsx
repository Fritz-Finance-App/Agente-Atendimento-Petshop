'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Cliente, Pet, ServicoCatalogo, Agendamento } from '@/types/database'
import { Plus, Check, Loader2, AlertCircle, Info, Sparkles, UserPlus } from 'lucide-react'

interface ModalNovoAgendamentoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clientes: Cliente[]
  pets: Pet[]
  servicos: ServicoCatalogo[]
  onSuccess: (newAgendamento: Agendamento) => void
}

export default function ModalNovoAgendamento({
  isOpen,
  onOpenChange,
  clientes,
  pets,
  servicos,
  onSuccess,
}: ModalNovoAgendamentoProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState('')

  // ─── Controladores de Fluxo de Form ────────────────────────
  const [isNewTutor, setIsNewTutor] = useState(false)
  const [isNewPet, setIsNewPet] = useState(false)

  // ─── Dados de Cliente/Tutor ────────────────────────────────
  const [selectedClienteId, setSelectedClienteId] = useState('')
  const [newTutorName, setNewTutorName] = useState('')
  const [newTutorPhone, setNewTutorPhone] = useState('')

  // ─── Dados de Pet ──────────────────────────────────────────
  const [filteredPets, setFilteredPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState('')
  const [newPetName, setNewPetName] = useState('')
  const [newPetSpecies, setNewPetSpecies] = useState('Cão')
  const [newPetBreed, setNewPetBreed] = useState('')
  const [newPetSize, setNewPetSize] = useState<'pequeno' | 'medio' | 'grande'>('medio')

  // ─── Dados do Serviço e Agenda ─────────────────────────────
  const [selectedServiceType, setSelectedServiceType] = useState('')
  const [valorCobrado, setValorCobrado] = useState('')
  const [dataHoraInicio, setDataHoraInicio] = useState('')

  // ─── Efeitos de Relacionamento ──────────────────────────────
  // Quando muda o tutor selecionado, filtra os pets dele
  useEffect(() => {
    if (selectedClienteId) {
      const clientPets = pets.filter(p => p.cliente_id === selectedClienteId)
      setFilteredPets(clientPets)
      setSelectedPetId(clientPets[0]?.id || '')
      setIsNewPet(clientPets.length === 0)
    } else {
      setFilteredPets([])
      setSelectedPetId('')
      setIsNewPet(true)
    }
  }, [selectedClienteId, pets])

  // Quando escolhe o serviço, preenche automaticamente o preço base do catálogo
  useEffect(() => {
    if (selectedServiceType) {
      const service = servicos.find(s => s.tipo_servico === selectedServiceType)
      if (service) {
        setValorCobrado(String(service.preco_base))
      }
    }
  }, [selectedServiceType, servicos])

  // Resetar campos ao abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      setIsNewTutor(clientes.length === 0)
      setSelectedClienteId(clientes[0]?.id || '')
      setNewTutorName('')
      setNewTutorPhone('')
      setNewPetName('')
      setNewPetSpecies('Cão')
      setNewPetBreed('')
      setNewPetSize('medio')
      setSelectedServiceType(servicos[0]?.tipo_servico || '')
      setValorCobrado(servicos[0] ? String(servicos[0].preco_base) : '')
      
      // Auto-preencher data/hora atual arredondada para a próxima hora
      const now = new Date()
      now.setMinutes(0, 0, 0)
      now.setHours(now.getHours() + 1)
      const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(now.getTime() - tzOffset)).toISOString().slice(0, 16);
      setDataHoraInicio(localISOTime)
    }
  }, [isOpen, clientes, servicos])

  // ─── Envio do Formulário ────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!selectedServiceType) {
      setErrorMsg('Escolha um serviço do catálogo.')
      return
    }

    if (!dataHoraInicio) {
      setErrorMsg('Defina a data e hora do serviço.')
      return
    }

    const payload = {
      clienteId: isNewTutor ? undefined : selectedClienteId,
      clienteNome: isNewTutor ? newTutorName : undefined,
      clienteTelefone: isNewTutor ? newTutorPhone : undefined,
      petId: (isNewTutor || isNewPet) ? undefined : selectedPetId,
      petNome: (isNewTutor || isNewPet) ? newPetName : undefined,
      petEspecie: (isNewTutor || isNewPet) ? newPetSpecies : undefined,
      petRaca: (isNewTutor || isNewPet) ? newPetBreed : undefined,
      petPorte: (isNewTutor || isNewPet) ? newPetSize : undefined,
      tipoServico: selectedServiceType,
      valorCobrado: parseFloat(valorCobrado) || 0,
      dataHoraInicio: new Date(dataHoraInicio).toISOString(),
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/agendamentos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Erro ao agendar serviço.')
        }

        onSuccess(data.agendamento)
        onOpenChange(false)
      } catch (err: any) {
        setErrorMsg(err.message)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={14} className="animate-pulse" /> Novo Agendamento
          </div>
          <DialogTitle className="text-xl font-extrabold text-gray-900 leading-none">Reservar Horário</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Cadastre agendamentos no painel. O sistema sincroniza na hora com a agenda do Google.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800 my-1 animate-scale-in">
            <AlertCircle size={14} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          {/* ================= SEÇÃO: TUTOR / CLIENTE ================= */}
          <div className="space-y-2 border-b pb-3 border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dados do Tutor</span>
              <button
                type="button"
                onClick={() => setIsNewTutor(!isNewTutor)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <UserPlus size={12} />
                {isNewTutor ? 'Selecionar Tutor Existente' : 'Cadastrar Novo Tutor'}
              </button>
            </div>

            {isNewTutor ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-scale-in">
                <div className="space-y-1">
                  <Label htmlFor="tutor_name" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Nome Completo</Label>
                  <Input
                    id="tutor_name"
                    placeholder="Ex: Carlos Costa"
                    value={newTutorName}
                    onChange={e => setNewTutorName(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tutor_phone" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">WhatsApp (Telefone)</Label>
                  <Input
                    id="tutor_phone"
                    placeholder="Ex: 11998765432"
                    value={newTutorPhone}
                    onChange={e => setNewTutorPhone(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-scale-in">
                <Label htmlFor="tutor_select" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pesquisar Tutor</Label>
                <select
                  id="tutor_select"
                  value={selectedClienteId}
                  onChange={e => setSelectedClienteId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg h-10 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} (+{c.telefone})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ================= SEÇÃO: PET ================= */}
          <div className="space-y-2 border-b pb-3 border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Dados do Pet</span>
              {!isNewTutor && filteredPets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsNewPet(!isNewPet)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  {isNewPet ? 'Selecionar Pet do Tutor' : 'Cadastrar Outro Pet'}
                </button>
              )}
            </div>

            {isNewTutor || isNewPet ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-scale-in">
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="pet_name" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Nome do Pet</Label>
                  <Input
                    id="pet_name"
                    placeholder="Ex: Pipoca"
                    value={newPetName}
                    onChange={e => setNewPetName(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                    required
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="pet_species" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Espécie</Label>
                  <select
                    id="pet_species"
                    value={newPetSpecies}
                    onChange={e => setNewPetSpecies(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg h-10 text-sm px-2 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                  >
                    <option value="Cão">Cão</option>
                    <option value="Gato">Gato</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <Label htmlFor="pet_breed" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Raça (Opcional)</Label>
                  <Input
                    id="pet_breed"
                    placeholder="Ex: Golden"
                    value={newPetBreed}
                    onChange={e => setNewPetBreed(e.target.value)}
                    className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                  />
                </div>
                <div className="space-y-1 col-span-3">
                  <Label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-1">Porte do Pet</Label>
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
            ) : (
              <div className="space-y-1 animate-scale-in">
                <Label htmlFor="pet_select" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Selecionar Pet</Label>
                <select
                  id="pet_select"
                  value={selectedPetId}
                  onChange={e => setSelectedPetId(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg h-10 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                >
                  {filteredPets.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.especie} {p.raca ? `• ${p.raca}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ================= SEÇÃO: SERVIÇO, PREÇO E DATA ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <Label htmlFor="service_select" className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Escolher Serviço</Label>
              <select
                id="service_select"
                value={selectedServiceType}
                onChange={e => setSelectedServiceType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg h-10 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
              >
                {servicos.map(s => (
                  <option key={s.id} value={s.tipo_servico}>
                    {s.tipo_servico} (R$ {Number(s.preco_base).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="price_input" className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Preço Cobrado (R$)</Label>
              <Input
                id="price_input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={valorCobrado}
                onChange={e => setValorCobrado(e.target.value)}
                className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600 font-mono font-bold text-emerald-600"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="datetime_input" className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Data e Horário</Label>
              <Input
                id="datetime_input"
                type="datetime-local"
                value={dataHoraInicio}
                onChange={e => setDataHoraInicio(e.target.value)}
                className="rounded-lg h-10 text-sm focus-visible:ring-indigo-600"
                required
              />
            </div>

          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 flex gap-2 text-[10px] text-indigo-900 leading-snug">
            <Info size={14} className="text-indigo-600 shrink-0 mt-0.5 animate-bounce" />
            <span>
              Ao criar o agendamento, o cliente será avisado pelo WhatsApp da IA e o compromisso aparecerá imediatamente no dashboard Kanban!
            </span>
          </div>

          <DialogFooter className="pt-2 border-t border-gray-100">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 text-xs font-bold uppercase tracking-wider shadow-[0_10px_20px_-8px_rgba(79,70,229,0.3)]"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-1" /> Agendando...
                </>
              ) : 'Confirmar Reserva'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
