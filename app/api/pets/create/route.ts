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
    const { clienteId, nome, especie, raca, porte } = await request.json()

    if (!clienteId || !nome || !especie) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 })
    }

    // 3. Inserir o Pet (o RLS garante que o clienteId pertence ao petshop do usuário)
    const { data: pet, error: insertError } = await supabase
      .from('pets')
      .insert({
        cliente_id: clienteId,
        nome,
        especie,
        raca: raca || null,
        porte: porte || null,
      })
      .select()
      .single()

    if (insertError || !pet) {
      console.error('❌ [API Create Pet] Erro no Supabase:', insertError)
      return NextResponse.json({ error: 'Erro ao cadastrar pet no banco. Verifique as permissões.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, pet })

  } catch (error: any) {
    console.error('❌ [API Create Pet] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
