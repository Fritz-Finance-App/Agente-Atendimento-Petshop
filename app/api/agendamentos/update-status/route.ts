import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { agendamentoId, status } = await request.json()

    console.log(`📥 [API Update Status] Recebida requisição para atualizar agendamento ${agendamentoId} para status: "${status}"`)

    if (!agendamentoId || !status) {
      return NextResponse.json({ error: 'Parâmetros ausentes' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Atualizar o status do agendamento no Supabase
    const { data: updated, error: updateError } = await supabase
      .from('agendamentos')
      .update({ status })
      .eq('id', agendamentoId)
      .select('*, clientes(nome, telefone), pets(nome, especie)')
      .single()

    if (updateError) {
      console.error('❌ [API Update Status] Erro no Supabase:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar no banco' }, { status: 500 })
    }

    // 2. Se o status for 'finalizado', disparar a notificação assíncrona para o n8n
    if (status === 'finalizado') {
      const agendamento = updated as any
      const clienteNome = agendamento.clientes?.nome || 'Tutor'
      const clienteTel = agendamento.clientes?.telefone || ''
      const petNome = agendamento.pets?.nome || 'Pet'
      const tipoServico = agendamento.tipo_servico || 'Serviço'

      const n8nWebhookUrl = process.env.N8N_NOTIFY_WEBHOOK_URL || 'http://2.24.95.177:5678/webhook/agendamento-finalizado'

      const payload = {
        agendamentoId,
        tipoServico,
        valorCobrado: agendamento.valor_cobrado,
        clienteNome,
        clienteTelefone: clienteTel,
        petNome,
        status: 'finalizado'
      }

      console.log(`🚀 [API Update Status] Disparando webhook para o n8n para notificar ${clienteNome} sobre o pet ${petNome}...`)

      // Executa em background sem dar await para não bloquear o tempo de resposta do Kanban (Performance AAA)
      fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) {
          console.error(`⚠️ [API Update Status] Falha ao enviar para o n8n: Status ${res.status}`)
        } else {
          console.log(`✅ [API Update Status] Notificação encaminhada ao n8n com sucesso!`)
        }
      }).catch(err => {
        console.error('❌ [API Update Status] Erro de rede ao disparar webhook para o n8n:', err)
      })
    }

    // 3. Se o status for 'cancelado' e houver gcal_event_id, deletar do Google Calendar
    if (status === 'cancelado' && (updated as any).gcal_event_id) {
      const { data: petshop } = await supabase
        .from('petshops')
        .select('id, gcal_access_token, gcal_refresh_token')
        .eq('id', (updated as any).petshop_id)
        .single()

      if (petshop && petshop.gcal_access_token && petshop.gcal_refresh_token) {
        const { deleteCalendarEvent } = await import('@/lib/google-calendar')
        
        console.log(`🚀 [API Update Status] Disparando exclusão de evento no Google Calendar de forma assíncrona...`)
        
        deleteCalendarEvent({
          eventId: (updated as any).gcal_event_id,
          accessToken: petshop.gcal_access_token,
          refreshToken: petshop.gcal_refresh_token,
          petshopId: petshop.id
        }).then(() => {
          console.log(`✅ [API Update Status] Evento ${(updated as any).gcal_event_id} removido da agenda.`)
        }).catch(err => {
          console.error(`⚠️ [API Update Status] Falha ao excluir evento no Google Calendar:`, err.message)
        })
      }
    }

    return NextResponse.json({ success: true, updated })

  } catch (error: any) {
    console.error('❌ [API Update Status] Erro geral na rota:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
