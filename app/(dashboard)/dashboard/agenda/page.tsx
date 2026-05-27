import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AgendaClient from '@/components/dashboard/AgendaClient'
import type { Agendamento } from '@/types/database'

export default async function AgendaPage() {
  const supabase = await createClient()

  // 1. Validar login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Buscar agendamentos (ordenados por data de início de forma decrescente)
  const { data: agendamentosData } = await supabase
    .from('agendamentos')
    .select('*, clientes(nome, telefone), pets(nome, especie, raca, porte)')
    .order('data_hora_inicio', { ascending: false })

  const agendamentos = (agendamentosData ?? []) as unknown as Agendamento[]

  // 3. Buscar clientes cadastrados (para dropdown de Novo Agendamento)
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nome', { ascending: true })

  // 4. Buscar pets cadastrados
  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .order('nome', { ascending: true })

  // 5. Buscar catálogo de serviços
  const { data: servicos } = await supabase
    .from('servicos_catalogo')
    .select('*')
    .order('tipo_servico', { ascending: true })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
          Agenda do Petshop
        </h2>
        <p className="text-gray-500 text-sm">
          Planeje sua escala operacional, consulte compromissos e agende novos serviços.
        </p>
      </div>

      <AgendaClient 
        initialAgendamentos={agendamentos ?? []} 
        clientes={clientes ?? []} 
        pets={pets ?? []} 
        servicos={servicos ?? []} 
      />
    </div>
  )
}
