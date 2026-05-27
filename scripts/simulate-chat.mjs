/**
 * Simulador de conversa — testa o agente IA sem precisar de WhatsApp real.
 * Envia mensagens diretamente para o n8n e exibe as respostas do Claude.
 *
 * Uso: node scripts/simulate-chat.mjs
 *
 * Antes de rodar: edite PETSHOP_ID abaixo com o ID real do seu petshop no Supabase.
 * (Settings > API > Project URL, ou busque na tabela petshops após completar o onboarding)
 */

import { readFileSync } from 'fs'
import { createInterface } from 'readline'
import { resolve } from 'path'

// ── Configuração ──────────────────────────────────────────────────────────────
const PETSHOP_ID  = '8d14af2c-d817-428c-9481-3474ae006bc1'
const CLIENTE_ID  = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const NOME        = 'João Teste'
const PHONE       = '5511999999901'
// ─────────────────────────────────────────────────────────────────────────────

// Carrega .env.local
const envPath = resolve(process.cwd(), '.env.local')
let envVars = {}
try {
  envVars = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
  )
} catch {
  console.error('Erro: .env.local não encontrado. Execute na raiz do projeto.')
  process.exit(1)
}

const N8N_URL = envVars.N8N_WEBHOOK_URL
if (!N8N_URL) {
  console.error('Erro: N8N_WEBHOOK_URL não definida no .env.local')
  process.exit(1)
}

async function enviarMensagem(texto) {
  const payload = {
    petshop_id: PETSHOP_ID,
    has_gcal:   false,
    cliente:    { id: CLIENTE_ID, nome: NOME, telefone: PHONE },
    message:    texto,
    phone:      PHONE,
    timestamp:  new Date().toISOString(),
  }

  try {
    const res = await fetch(N8N_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    return await res.json()
  } catch (err) {
    return { erro: err.message }
  }
}

// ── Interface interativa ──────────────────────────────────────────────────────
const rl = createInterface({ input: process.stdin, output: process.stdout })

console.log('\n┌─────────────────────────────────────────────┐')
console.log('│   🐾  Simulador de Chat — Petshop IA        │')
console.log('└─────────────────────────────────────────────┘')
console.log(`n8n : ${N8N_URL}`)
console.log(`Tel : ${PHONE}  |  Nome: ${NOME}`)
if (PETSHOP_ID === 'COLE_SEU_PETSHOP_ID_AQUI') {
  console.log('\n⚠️  ATENÇÃO: edite PETSHOP_ID no script antes de testar!')
}
console.log('\nDigite mensagens e pressione Enter. Ctrl+C para sair.\n')
console.log('─'.repeat(47))

function perguntar() {
  rl.question('\nVocê  : ', async (msg) => {
    if (!msg.trim()) { perguntar(); return }

    process.stdout.write('Agente: ')
    const inicio = Date.now()
    const res = await enviarMensagem(msg)
    const ms = Date.now() - inicio

    if (res.resposta) {
      console.log(res.resposta)
      if (res.handoff) {
        console.log('\n⚠️  [HANDOFF — responsável seria notificado]')
      }
      console.log(`\n   (${ms}ms)`)
    } else if (res.erro) {
      console.log(`[Erro de conexão: ${res.erro}]`)
    } else {
      console.log('[Sem resposta — verifique o log de execuções no n8n]')
      console.log('   Detalhe:', JSON.stringify(res))
    }

    perguntar()
  })
}

perguntar()
