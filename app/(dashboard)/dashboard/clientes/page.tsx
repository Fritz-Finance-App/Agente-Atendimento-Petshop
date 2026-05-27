import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientesClient from '@/components/dashboard/ClientesClient'

export default async function ClientesPage() {
  const supabase = await createClient()

  // 1. Validar login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Buscar clientes (tutors) cadastrados no petshop (isolado por RLS)
  const { data: clientes } = await supabase
    .from('clientes')
    .select('*')
    .order('nome', { ascending: true })

  // 3. Buscar todos os pets associados aos clientes deste petshop (isolado por RLS)
  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .order('nome', { ascending: true })

  // 4. Buscar agendamentos simplificados (isolado por RLS) para análise de retenção
  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('id, cliente_id, data_hora_inicio, tipo_servico, valor_cobrado, status')
    .order('data_hora_inicio', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
          Diretório de Clientes & Pets
        </h2>
        <p className="text-gray-500 text-sm">
          Consulte o histórico dos tutores, adicione pets e mantenha sua base de contatos sempre atualizada.
        </p>
      </div>

      <ClientesClient 
        initialClientes={clientes ?? []} 
        initialPets={pets ?? []} 
        initialAgendamentos={agendamentos ?? []}
      />
    </div>
  )
}
