import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent } from '@/lib/google-calendar'
import type { Agendamento } from '@/types/database'

interface CreateAppointmentBody {
  clienteId?: string
  clienteNome?: string
  clienteTelefone?: string
  petId?: string
  petNome?: string
  petEspecie?: string
  petRaca?: string
  petPorte?: 'pequeno' | 'medio' | 'grande'
  tipoServico: string
  valorCobrado: number
  dataHoraInicio: string
  dataHoraFim?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 })
    }

    // 2. Buscar o petshop do usuário logado (RLS isola)
    const { data: petshop, error: petshopError } = await supabase
      .from('petshops')
      .select('id, nome, gcal_access_token, gcal_refresh_token')
      .single()

    if (petshopError || !petshop) {
      return NextResponse.json({ error: 'Petshop não encontrado. Complete o onboarding.' }, { status: 404 })
    }

    // 3. Extrair dados do body
    const body: CreateAppointmentBody = await request.json()
    const { 
      clienteId, clienteNome, clienteTelefone, 
      petId, petNome, petEspecie, petRaca, petPorte,
      tipoServico, valorCobrado, dataHoraInicio, dataHoraFim 
    } = body

    if (!tipoServico || !dataHoraInicio || valorCobrado == null) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 })
    }

    let finalClienteId = clienteId
    let finalPetId = petId

    // 4. Se não fornecido clienteId, criar ou obter o Cliente por telefone (cascateamento inline)
    if (!finalClienteId) {
      if (!clienteNome || !clienteTelefone) {
        return NextResponse.json({ error: 'Nome e telefone do cliente são obrigatórios para novo cadastro.' }, { status: 400 })
      }

      // Upsert para obter cliente de forma segura sem duplicar telefone por petshop
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .upsert(
          { petshop_id: petshop.id, nome: clienteNome, telefone: clienteTelefone.replace(/\D/g, '') },
          { onConflict: 'petshop_id,telefone' }
        )
        .select()
        .single()

      if (clienteError || !cliente) {
        console.error('❌ [API Create Appointment] Erro ao criar/obter cliente:', clienteError)
        return NextResponse.json({ error: 'Erro ao cadastrar cliente.' }, { status: 500 })
      }

      finalClienteId = cliente.id
    }

    // 5. Se não fornecido petId, criar o Pet
    if (!finalPetId) {
      if (!petNome || !petEspecie) {
        return NextResponse.json({ error: 'Nome e espécie do pet são obrigatórios para novo cadastro.' }, { status: 400 })
      }

      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          cliente_id: finalClienteId,
          nome: petNome,
          especie: petEspecie,
          raca: petRaca || null,
          porte: petPorte || null,
        })
        .select()
        .single()

      if (petError || !pet) {
        console.error('❌ [API Create Appointment] Erro ao criar pet:', petError)
        return NextResponse.json({ error: 'Erro ao cadastrar pet.' }, { status: 500 })
      }

      finalPetId = pet.id
    }

    // 6. Criar o Agendamento
    const { data: agendamentoData, error: insertError } = await supabase
      .from('agendamentos')
      .insert({
        petshop_id: petshop.id,
        cliente_id: finalClienteId,
        pet_id: finalPetId,
        tipo_servico: tipoServico,
        status: 'agendado',
        data_hora_inicio: dataHoraInicio,
        data_hora_fim: dataHoraFim || new Date(new Date(dataHoraInicio).getTime() + 60 * 60 * 1000).toISOString(), // 1 hora padrão
        valor_cobrado: Number(valorCobrado),
      })
      .select('*, clientes(nome, telefone), pets(nome, especie)')
      .single()

    if (insertError || !agendamentoData) {
      console.error('❌ [API Create Appointment] Erro ao criar agendamento:', insertError)
      return NextResponse.json({ error: 'Erro ao registrar agendamento.' }, { status: 500 })
    }

    const agendamento = agendamentoData as unknown as Agendamento

    // 7. Sincronização Assíncrona com o Google Calendar
    if (petshop.gcal_access_token && petshop.gcal_refresh_token) {
      const gcalParams = {
        summary: `${tipoServico} - ${agendamento.pets?.nome || 'Pet'}`,
        description: `Tutor: ${agendamento.clientes?.nome || 'Cliente'} | Tel: +${agendamento.clientes?.telefone || ''}`,
        startIso: agendamento.data_hora_inicio,
        endIso: agendamento.data_hora_fim || agendamento.data_hora_inicio,
        accessToken: petshop.gcal_access_token,
        refreshToken: petshop.gcal_refresh_token,
        petshopId: petshop.id,
      }

      console.log(`🚀 [API Create Appointment] Disparando criação de evento no Google Calendar de forma assíncrona...`)
      
      createCalendarEvent(gcalParams).then(async (gcalEvent) => {
        // Persistir o gcal_event_id no agendamento para controle e exclusão futura
        const { createServiceClient } = await import('@/lib/supabase/server')
        const adminSupabase = createServiceClient()
        await adminSupabase
          .from('agendamentos')
          .update({ gcal_event_id: gcalEvent.id })
          .eq('id', agendamento.id)
        
        console.log(`✅ [API Create Appointment] Evento sincronizado no Google Calendar: ${gcalEvent.id}`)
      }).catch(err => {
        console.error('⚠️ [API Create Appointment] Falha ao sincronizar com Google Calendar (Background):', err.message)
      })
    }

    return NextResponse.json({ success: true, agendamento })

  } catch (error: any) {
    console.error('❌ [API Create Appointment] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
