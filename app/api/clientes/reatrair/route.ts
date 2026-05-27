import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar login
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Extrair dados
    const { clienteId, ultimoAgendamento } = await request.json()
    if (!clienteId) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório.' }, { status: 400 })
    }

    // 3. Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single()

    if (clienteError || !cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
    }

    // 4. Buscar pets do cliente
    const { data: pets, error: petsError } = await supabase
      .from('pets')
      .select('*')
      .eq('cliente_id', clienteId)

    // 5. Buscar dados do petshop
    const { data: petshop, error: petshopError } = await supabase
      .from('petshops')
      .select('*')
      .eq('id', cliente.petshop_id)
      .single()

    if (petshopError || !petshop) {
      return NextResponse.json({ error: 'Petshop não cadastrado ou não encontrado.' }, { status: 404 })
    }

    // 6. Configurar webhook do n8n
    // Usamos N8N_WEBHOOK_URL do arquivo env. Se houver alguma URL específica no futuro, ela tem prioridade
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://2.24.95.177:5678/webhook/petshop-whatsapp'

    const payload = {
      action: 'reatracao',
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
      },
      pets: (pets ?? []).map(p => ({
        id: p.id,
        nome: p.nome,
        especie: p.especie,
        raca: p.raca,
        porte: p.porte
      })),
      petshop: {
        id: petshop.id,
        nome: petshop.nome,
        whatsapp_numero: petshop.whatsapp_numero,
        endereco: petshop.endereco
      },
      ultimo_agendamento: ultimoAgendamento ? {
        data_hora_inicio: ultimoAgendamento.data_hora_inicio,
        tipo_servico: ultimoAgendamento.tipo_servico,
        valor_cobrado: ultimoAgendamento.valor_cobrado
      } : null
    }

    console.log('📤 [Retenção IA] Enviando payload para o n8n:', JSON.stringify(payload, null, 2))

    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const responseText = await response.text()
        console.error('❌ [Retenção IA] Erro na resposta do n8n:', response.status, responseText)
        return NextResponse.json({ 
          error: `Webhook do n8n retornou status ${response.status}. Certifique-se de que o fluxo do n8n está ativo.`
        }, { status: 502 })
      }

      console.log('✅ [Retenção IA] Campanha disparada com sucesso no n8n!')
      return NextResponse.json({ success: true, message: 'Campanha de reatração disparada com sucesso via WhatsApp!' })

    } catch (fetchError: any) {
      console.error('❌ [Retenção IA] Erro ao conectar ao webhook do n8n:', fetchError)
      return NextResponse.json({ 
        error: `Não foi possível conectar ao n8n (${fetchError.message || 'Erro de rede'}). Verifique as configurações de rede ou se o servidor do n8n está online.` 
      }, { status: 503 })
    }

  } catch (error: any) {
    console.error('❌ [API Reatrair Cliente] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
