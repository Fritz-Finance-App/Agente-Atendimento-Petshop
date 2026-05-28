'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

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
    <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm">
          <Calendar className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-extrabold tracking-tight">Google Calendar</CardTitle>
        <CardDescription className="dark:text-slate-400 font-medium text-xs">
          Permita que a Lara crie e gerencie os agendamentos na sua agenda automaticamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-6">
        <div className="text-center text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-semibold max-w-xs space-y-1">
          <p>Todos os horários marcados pela IA serão</p>
          <p>sincronizados em tempo real no Google Calendar.</p>
        </div>

        {connected ? (
          <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/50 py-1.5 px-3 rounded-lg flex items-center gap-1.5 animate-bounce [animation-iteration-count:2]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Google Calendar Conectado!
          </Badge>
        ) : (
          <Button 
            onClick={handleConnect} 
            className="w-full rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-all py-5 shadow-sm cursor-pointer"
          >
            Conectar com minha Conta Google
          </Button>
        )}

        <Button
          className={`w-full rounded-xl py-5 font-bold transition-all cursor-pointer ${
            connected 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 hover:opacity-90 text-white shadow-lg shadow-indigo-500/10' 
              : 'bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
          onClick={onNext}
        >
          {connected ? 'Continuar para Próxima Etapa' : 'Pular esta etapa por enquanto'}
        </Button>
      </CardContent>
    </Card>
  )
}
