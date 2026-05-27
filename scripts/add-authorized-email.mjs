/**
 * Script Utilitário: Adicionar E-mail à Whitelist do Supabase
 * 
 * Uso:
 *   node scripts/add-authorized-email.mjs <email> "<descricao>"
 * 
 * Exemplo:
 *   node scripts/add-authorized-email.mjs contato@petshop.com "Patinhas PetShop - Dono"
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// 1. Obter argumentos do terminal
const email = process.argv[2]?.trim().toLowerCase()
const descricao = process.argv[3]?.trim() || 'Cadastrado via CLI'

if (!email) {
  console.error('\n❌ Erro: Por favor, forneça um e-mail válido.')
  console.log('Uso: node scripts/add-authorized-email.mjs <email> "<descricao>"\n')
  process.exit(1)
}

// 2. Carregar configurações do .env.local
const envPath = resolve(process.cwd(), '.env.local')
let envVars = {}
try {
  envVars = Object.fromEntries(
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { 
        const i = l.indexOf('='); 
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()] 
      })
  )
} catch {
  console.error('\n❌ Erro: Arquivo .env.local não encontrado na raiz do projeto.\n')
  process.exit(1)
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ Erro: Chaves NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas no .env.local\n')
  process.exit(1)
}

// 3. Inicializar o cliente Supabase Administrativo
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function run() {
  console.log(`\n🔑 Conectando ao Supabase em: ${supabaseUrl}`)
  console.log(`📬 Cadastrando e-mail: ${email} (${descricao})...`)

  // Inserir o e-mail na tabela
  const { data, error } = await supabase
    .from('emails_autorizados')
    .insert([{ email, descricao }])
    .select()

  if (error) {
    if (error.code === '23505') {
      console.error(`\n⚠️  Aviso: O e-mail "${email}" já possui acesso ativo na plataforma!\n`)
    } else {
      console.error('\n❌ Erro ao inserir no banco:', error.message)
      console.log('Detalhes:', error)
    }
    process.exit(1)
  }

  console.log('\n✅ Sucesso! O acesso da plataforma foi liberado para o cliente:')
  console.log('──────────────────────────────────────────────────')
  console.log(`📧 E-mail    : ${data[0].email}`)
  console.log(`📝 Descrição  : ${data[0].descricao}`)
  console.log(`📅 Criado em  : ${new Date(data[0].created_at).toLocaleString('pt-BR')}`)
  console.log('──────────────────────────────────────────────────\n')
}

run()
