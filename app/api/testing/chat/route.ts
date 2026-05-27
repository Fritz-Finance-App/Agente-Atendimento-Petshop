import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RequestBody {
  message: string
  phone: string
  nome: string
  id?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar autenticação do usuário logado (Dono do Petshop)
    const { data: { user } } = await supabase.auth.getUser()
    
    let petshop: any = null
    let mockClientIdFallback = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' // UUID válido para evitar quebras de sintaxe no banco
    let mockClientNameFallback = 'Cliente Simulado'
    let mockClientPhoneFallback = '5511999999901'

    if (!user) {
      // 🛠️ BYPASS DE DESENVOLVIMENTO (SENIOR DEV WORKAROUND)
      // Permite testar o playground localmente sem exigir fluxo complexo de Magic Link/OTP no localhost
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.warn('⚠️ [Sandbox Bypass] Usuário não logado. Usando Service Role Key para carregar dados de teste.');
        const { createClient: createAdminClient } = await import('@supabase/supabase-js')
        const adminSupabase = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        // 1. Carrega o primeiro petshop
        const { data: firstPetshop, error: pError } = await adminSupabase
          .from('petshops')
          .select('id, nome, gcal_access_token')
          .limit(1)
          .single()

        if (pError || !firstPetshop) {
          return NextResponse.json(
            { error: 'Erro no Bypass: Nenhum petshop cadastrado no Supabase. Execute o onboarding primeiro.' },
            { status: 404 }
          )
        }
        petshop = firstPetshop

        // 2. Tenta carregar o primeiro cliente real do banco para simular perfeitamente com UUID e telefone reais!
        const { data: realClient } = await adminSupabase
          .from('clientes')
          .select('id, nome, telefone')
          .eq('petshop_id', petshop.id)
          .limit(1)
          .single()

        if (realClient) {
          console.warn(`🎯 [Sandbox Bypass] Cliente real encontrado e injetado: ${realClient.nome} (${realClient.id})`);
          mockClientIdFallback = realClient.id
          mockClientNameFallback = realClient.nome
          mockClientPhoneFallback = realClient.telefone
        }
      } else {
        return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 })
      }
    } else {
      // 2. Obter o Petshop do usuário logado (respeitando as regras de RLS)
      const { data: userPetshop, error: petshopError } = await supabase
        .from('petshops')
        .select('id, nome, gcal_access_token')
        .single()

      if (petshopError || !userPetshop) {
        return NextResponse.json(
          { error: 'Nenhum petshop cadastrado ou ativo para este usuário. Complete o onboarding.' },
          { status: 404 }
        )
      }
      petshop = userPetshop
    }

    // 3. Obter os dados da mensagem e do cliente simulado
    const { message, phone, nome, id }: RequestBody = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensagem vazia não permitida.' }, { status: 400 })
    }

    // 4. Estruturar o payload para o n8n seguindo o padrão de produção
    const n8nPayload = {
      petshop_id: petshop.id,
      instance: 'playground', // Instância simulada para indicar que é do sandbox
      has_gcal: !!petshop.gcal_access_token,
      cliente: {
        id: id || mockClientIdFallback,
        nome: nome || mockClientNameFallback,
        telefone: phone || mockClientPhoneFallback,
      },
      message,
      phone: phone || mockClientPhoneFallback,
      timestamp: new Date().toISOString(),
    }

    // Usar a URL do sandbox ou fallback para produção
    const n8nUrl = process.env.N8N_PLAYGROUND_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL

    if (!n8nUrl) {
      return NextResponse.json(
        { error: 'Webhook URL do n8n não configurado no .env.local.' },
        { status: 500 }
      )
    }

    // 5. Enviar síncronamente ao n8n medindo latência com mecanismo de retry robusto (Exponential Backoff)
    const start = performance.now()
    let n8nResponse: any = null
    const MAX_RETRIES = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 1) {
          console.warn(`🔄 [Playground Proxy] Tentativa de re-conexão ${attempt}/${MAX_RETRIES} com o n8n...`);
        }
        
        const response = await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(n8nPayload),
        })

        if (!response.ok) {
          throw new Error(`n8n retornou status HTTP ${response.status}`);
        }

        // Lê como texto primeiro para fazer o parse de forma segura contra respostas em branco
        const text = await response.text();
        if (!text || text.trim() === '') {
          throw new Error('n8n respondeu com corpo vazio (empty body). Isso costuma indicar que o fluxo caiu no meio da execução antes de responder.');
        }

        try {
          n8nResponse = JSON.parse(text);
        } catch {
          throw new Error(`Resposta do n8n não pôde ser decodificada como JSON: ${text.slice(0, 150)}...`);
        }

        // Sucesso absoluto! Quebra o loop de retries
        break;
      } catch (err: any) {
        lastError = err;
        console.error(`❌ [Playground Proxy] Falha na tentativa ${attempt}: ${err.message}`);
        
        if (attempt < MAX_RETRIES) {
          const delay = Math.pow(2, attempt) * 1000; // 2 segundos na 1ª falha, 4 segundos na 2ª
          console.warn(`⏳ VPS sob estresse ou instabilidade. Aguardando ${delay}ms antes de tentar novamente...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (!n8nResponse) {
      console.error(`🚨 [Playground Proxy] Falha crítica: conexão esgotada após ${MAX_RETRIES} tentativas.`);
      return NextResponse.json({
        error: `Erro ao conectar com o n8n após ${MAX_RETRIES} tentativas: ${lastError.message}. Isso acontece quando a VPS sofre picos de CPU/RAM durante consultas complexas de IA. Tente enviar a mensagem novamente.`,
        payloadSent: n8nPayload,
      }, { status: 502 })
    }

    const durationMs = Math.round(performance.now() - start)

    // 6. Retornar dados completos com estatísticas de debug
    return NextResponse.json({
      ok: true,
      resposta: n8nResponse.resposta || n8nResponse.response || null,
      handoff: !!(n8nResponse.handoff),
      durationMs,
      payloadSent: n8nPayload,
      payloadReceived: n8nResponse,
    })

  } catch (err: any) {
    console.error('Erro no handler do playground:', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
