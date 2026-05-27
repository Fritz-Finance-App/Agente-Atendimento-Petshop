import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError) {
      // 1. Obter o usuário recém-autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.email) {
        // 2. Verificar se o e-mail do usuário está na lista de e-mails autorizados (Whitelist)
        // Usamos o próprio cliente supabase que opera sob as políticas de segurança RLS (mais seguro e resiliente).
        const { data: authorized, error: dbError } = await supabase
          .from('emails_autorizados')
          .select('email')
          .eq('email', user.email)
          .single()

        // 3. Se não estiver autorizado, desconecta e bloqueia imediatamente
        if (dbError || !authorized) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=unauthorized_license`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

