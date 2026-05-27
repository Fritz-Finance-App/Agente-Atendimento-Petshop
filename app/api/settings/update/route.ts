import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 })
    }

    // 2. Extrair dados do corpo da requisição
    const { nome, whatsapp_numero, endereco, horario_abertura, horario_fechamento, dias_funcionamento } = await request.json()

    if (!nome) {
      return NextResponse.json({ error: 'O nome do Petshop é obrigatório.' }, { status: 400 })
    }

    // 3. Atualizar dados do petshop do usuário logado (RLS garante que só atualiza o próprio)
    const { data, error } = await supabase
      .from('petshops')
      .update({
        nome,
        whatsapp_numero: whatsapp_numero || null,
        endereco: endereco || null,
        horario_abertura: horario_abertura || '08:00',
        horario_fechamento: horario_fechamento || '18:00',
        dias_funcionamento: dias_funcionamento || ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'],
      })
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ [API Settings Update] Erro no Supabase:', error)
      return NextResponse.json({ error: 'Erro ao atualizar dados no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, petshop: data })

  } catch (error: any) {
    console.error('❌ [API Settings Update] Erro geral na rota:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
