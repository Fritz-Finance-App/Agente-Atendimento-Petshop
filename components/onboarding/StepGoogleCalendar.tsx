'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// OAuth flow:
// 1. User clicks "Conectar Google Calendar"
// 2. Browser redirects to Google's consent screen
// 3. Google redirects to /api/auth/google/callback?code=...
// 4. Callback exchanges code for tokens and stores them in petshops table
// 5. Callback redirects back to /onboarding?gcal=connected
export default function StepGoogleCalendar({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Check if we just came back from the OAuth callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('gcal') === 'connected') setConnected(true)
  }, [])

  function handleConnect() {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '',
      redirect_uri: `${window.location.origin}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.events',
      access_type: 'offline',
      prompt: 'consent',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conectar Google Calendar</CardTitle>
        <CardDescription>
          Permita que a IA crie eventos na sua agenda automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Seus agendamentos aparecerão automaticamente</p>
          <p>no Google Calendar do petshop.</p>
        </div>

        {connected ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            Google Calendar Conectado!
          </Badge>
        ) : (
          <Button onClick={handleConnect} className="gap-2">
            Conectar Google Calendar
          </Button>
        )}

        <Button
          className="w-full"
          onClick={onNext}
          variant={connected ? 'default' : 'outline'}
        >
          {connected ? 'Continuar' : 'Pular por agora'}
        </Button>
      </CardContent>
    </Card>
  )
}
