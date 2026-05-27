import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Evolution API webhook payload (simplified — only the fields we use)
interface EvolutionPayload {
  event: string
  instance: string
  data: {
    key: { remoteJid: string; fromMe: boolean; id: string }
    message?: {
      conversation?: string
      extendedTextMessage?: { text: string }
    }
    messageType: string
    pushName?: string
  }
}

export async function POST(request: NextRequest) {
  // Basic auth: callers must include the shared secret in X-Webhook-Secret
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload: EvolutionPayload = await request.json()

  // Only handle incoming text messages; ignore outbound, media, status updates
  if (payload.event !== 'messages.upsert' || payload.data.key.fromMe) {
    return NextResponse.json({ ok: true })
  }

  const rawPhone = payload.data.key.remoteJid
    .replace('@s.whatsapp.net', '')
    .replace('@g.us', '')

  const messageText =
    payload.data.message?.conversation ??
    payload.data.message?.extendedTextMessage?.text ??
    ''

  const senderName = payload.data.pushName ?? 'Cliente'

  if (!messageText) return NextResponse.json({ ok: true })

  // Use service-role to bypass RLS — this endpoint runs outside user auth context
  const supabase = createServiceClient()

  // Map Evolution API instance name → petshop
  const { data: petshop } = await supabase
    .from('petshops')
    .select('id, gcal_access_token')
    .eq('whatsapp_numero', payload.instance)
    .single()

  if (!petshop) {
    return NextResponse.json(
      { error: `No petshop found for instance: ${payload.instance}` },
      { status: 404 }
    )
  }

  // Upsert the sender as a cliente (create on first contact)
  const { data: cliente } = await supabase
    .from('clientes')
    .upsert(
      { petshop_id: petshop.id, nome: senderName, telefone: rawPhone },
      { onConflict: 'petshop_id,telefone', ignoreDuplicates: false }
    )
    .select('id, nome, telefone')
    .single()

  // Structured payload forwarded to n8n for LLM orchestration
  const n8nPayload = {
    petshop_id: petshop.id,
    instance:   payload.instance,
    has_gcal:   !!petshop.gcal_access_token,
    cliente:    cliente ?? { telefone: rawPhone, nome: senderName },
    message:    messageText,
    phone:      rawPhone,
    timestamp:  new Date().toISOString(),
  }

  // Fire-and-forget to n8n — don't block the WhatsApp response
  const n8nUrl = process.env.N8N_WEBHOOK_URL
  if (n8nUrl) {
    fetch(n8nUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(n8nPayload),
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true, payload: n8nPayload })
}
