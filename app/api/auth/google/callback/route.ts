import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/onboarding?error=gcal_no_code`)
  }

  // Exchange the authorization code for access + refresh tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  `${origin}/api/auth/google/callback`,
      grant_type:    'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return NextResponse.redirect(`${origin}/onboarding?error=gcal_token_failed`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase
      .from('petshops')
      .update({
        gcal_access_token:  tokens.access_token,
        gcal_refresh_token: tokens.refresh_token ?? null,
      })
      .eq('owner_id', user.id)
  }

  const state = searchParams.get('state')
  const redirectTo = state === 'settings' ? '/dashboard/settings' : '/onboarding'

  return NextResponse.redirect(`${origin}${redirectTo}?gcal=connected`)
}
