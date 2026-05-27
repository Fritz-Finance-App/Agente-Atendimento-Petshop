import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from '@/components/dashboard/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Validar login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Buscar dados do petshop (isolado por RLS)
  const { data: petshop, error: petshopError } = await supabase
    .from('petshops')
    .select('*')
    .single()

  if (petshopError || !petshop) {
    // Se não tiver petshop associado, manda para o onboarding
    redirect('/onboarding')
  }

  // 3. Buscar catálogo de serviços atual
  const { data: services } = await supabase
    .from('servicos_catalogo')
    .select('*')
    .order('tipo_servico', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
          Configurações da Plataforma
        </h2>
        <p className="text-gray-500 text-sm">
          Gerencie o perfil do seu petshop, edite serviços do catálogo e controle integrações de IA.
        </p>
      </div>

      <SettingsClient initialPetshop={petshop} initialServices={services ?? []} />
    </div>
  )
}
