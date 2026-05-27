import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Listar todos os serviços do petshop logado
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: services, error } = await supabase
      .from('servicos_catalogo')
      .select('*')
      .order('tipo_servico', { ascending: true })

    if (error) {
      console.error('❌ [API Services GET] Erro no Supabase:', error)
      return NextResponse.json({ error: 'Erro ao buscar serviços no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, services })

  } catch (error: any) {
    console.error('❌ [API Services GET] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Criar novo serviço no catálogo
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 1. Validar usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Buscar o petshop_id do usuário logado (RLS isola)
    const { data: petshop, error: petshopError } = await supabase
      .from('petshops')
      .select('id')
      .single()

    if (petshopError || !petshop) {
      return NextResponse.json({ error: 'Petshop não encontrado. Complete o onboarding.' }, { status: 404 })
    }

    // 3. Extrair dados
    const { tipo_servico, preco_base } = await request.json()

    if (!tipo_servico || preco_base == null || isNaN(Number(preco_base))) {
      return NextResponse.json({ error: 'Dados inválidos. Nome e preço base são necessários.' }, { status: 400 })
    }

    // 4. Inserir no catálogo
    const { data: newService, error: insertError } = await supabase
      .from('servicos_catalogo')
      .insert({
        petshop_id: petshop.id,
        tipo_servico,
        preco_base: Number(preco_base),
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [API Services POST] Erro de inserção:', insertError)
      return NextResponse.json({ error: 'Erro ao cadastrar serviço no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, service: newService })

  } catch (error: any) {
    console.error('❌ [API Services POST] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Atualizar um serviço existente
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { id, tipo_servico, preco_base } = await request.json()

    if (!id || !tipo_servico || preco_base == null || isNaN(Number(preco_base))) {
      return NextResponse.json({ error: 'Parâmetros ausentes ou inválidos.' }, { status: 400 })
    }

    // Atualiza respeitando RLS (só atualiza se o petshop_id corresponder ao do usuário)
    const { data: updatedService, error: updateError } = await supabase
      .from('servicos_catalogo')
      .update({
        tipo_servico,
        preco_base: Number(preco_base),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [API Services PUT] Erro de atualização:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar serviço no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, service: updatedService })

  } catch (error: any) {
    console.error('❌ [API Services PUT] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Deletar um serviço
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID do serviço não fornecido.' }, { status: 400 })
    }

    const { error: deleteError } = await supabase
      .from('servicos_catalogo')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ [API Services DELETE] Erro de exclusão:', deleteError)
      return NextResponse.json({ error: 'Erro ao deletar serviço no banco.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ [API Services DELETE] Erro geral:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
