'use client'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, QrCode } from 'lucide-react'

// In production, the QR code comes from the Evolution API /instance/connect endpoint.
// For the MVP we generate a static mock QR.
const MOCK_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppMockPetshop'

export default function StepWhatsApp({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState(false)

  return (
    <Card className="bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl shadow-slate-200/30 dark:shadow-none transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm">
          <QrCode className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl font-extrabold tracking-tight">Conectar WhatsApp</CardTitle>
        <CardDescription className="dark:text-slate-400 font-medium text-xs">
          Escaneie o QR code com o WhatsApp Business do seu petshop
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-6">
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-950 shadow-inner relative group transition-transform duration-300">
          <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={MOCK_QR} 
            alt="QR Code WhatsApp" 
            width={200} 
            height={200} 
            className="rounded-lg dark:invert dark:opacity-90 dark:brightness-110"
          />
        </div>

        <p className="text-[11px] text-slate-450 dark:text-slate-400 text-center leading-relaxed font-semibold max-w-xs bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-900">
          Abra o WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
        </p>

        {connected ? (
          <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/50 py-1.5 px-3 rounded-lg flex items-center gap-1.5 animate-bounce [animation-iteration-count:2]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            WhatsApp Conectado!
          </Badge>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setConnected(true)}
            className="text-xs font-bold border-indigo-200/60 dark:border-indigo-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-650 dark:text-indigo-450 rounded-lg cursor-pointer"
          >
            Simular Conexão Rápida
          </Button>
        )}

        <Button 
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 hover:opacity-90 font-bold transition-all text-white py-5 shadow-lg shadow-indigo-500/10 cursor-pointer" 
          disabled={!connected} 
          onClick={onNext}
        >
          Continuar para Próxima Etapa
        </Button>
      </CardContent>
    </Card>
  )
}
