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

    // 2. Buscar petshop do inquilino
    const { data: petshop, error: petshopError } = await supabase
      .from('petshops')
      .select('id')
      .single()

    if (petshopError || !petshop) {
      return NextResponse.json({ error: 'Petshop não encontrado. Complete o onboarding.' }, { status: 404 })
    }

    // 3. Extrair dados
    const { nome, telefone } = await request.json()

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios.' }, { status: 400 })
    }

    // 4. Inserir/obter o cliente (evitando duplicar telefone no mesmo petshop)
    const { data: cliente, error: insertError } = await supabase
      .from('clientes')
      .upsert(
        { petshop_id: petshop.id, nome, telefone: telefone.replace(/\D/g, '') },
        { onConflict: 'petshop_id,telefone' }
      )
      .select()
      .single()

    if (insertError || !cliente) {
      console.error('❌ [API Create Cliente] Erro de inserção:', insertError)
      return NextResponse.json({ error: 'Erro ao cadastrar tutor no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, cliente })

  } catch (error: any) {
    console.error('❌ [API Create Cliente] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
