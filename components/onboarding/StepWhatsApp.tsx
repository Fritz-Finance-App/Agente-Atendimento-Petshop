'use client'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// In production, the QR code comes from the Evolution API /instance/connect endpoint.
// For the MVP we generate a static mock QR.
const MOCK_QR = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WhatsAppMockPetshop'

export default function StepWhatsApp({ onNext }: { onNext: () => void }) {
  const [connected, setConnected] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conectar WhatsApp</CardTitle>
        <CardDescription>
          Escaneie o QR code com o WhatsApp Business do seu petshop
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MOCK_QR} alt="QR Code WhatsApp" width={200} height={200} />
        </div>

        <p className="text-xs text-gray-500 text-center">
          Abra o WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
        </p>

        {connected ? (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            WhatsApp Conectado!
          </Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setConnected(true)}>
            Simular conexão (dev)
          </Button>
        )}

        <Button className="w-full" disabled={!connected} onClick={onNext}>
          Continuar
        </Button>
      </CardContent>
    </Card>
  )
}
