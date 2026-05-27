'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert, MailCheck, ShieldCheck } from 'lucide-react'

function LoginContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
      },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          PetShop Manager
        </CardTitle>
        <CardDescription className="dark:text-slate-400">
          Entre com seu e-mail para acessar o painel
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Banner de erro de licença não autorizada */}
        {error === 'unauthorized_license' && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 transition-all duration-300 flex gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500 animate-pulse mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold tracking-tight">Licença Não Ativada</p>
              <p className="text-xs leading-relaxed opacity-90">
                O e-mail informado não está cadastrado na whitelist da plataforma. Entre em contato com a equipe Fritz Finance para liberar o seu acesso comercial.
              </p>
            </div>
          </div>
        )}

        {/* Banner genérico de erro no callback */}
        {error === 'auth_callback_failed' && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 transition-all flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Falha na Autenticação</p>
              <p className="text-xs leading-relaxed opacity-90">
                O link de login expirou ou já foi utilizado. Por favor, solicite um novo link abaixo.
              </p>
            </div>
          </div>
        )}

        {sent ? (
          <div className="text-center py-6 space-y-3 animate-in fade-in duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
              <MailCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Verifique seu E-mail</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                Enviamos um link de login seguro (Magic Link) para o e-mail informado.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-605 dark:text-slate-300 font-medium text-sm">E-mail Corporativo</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@petshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white dark:bg-slate-900/80 border-gray-200 dark:border-slate-800 focus:ring-indigo-500 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 hover:opacity-90 font-bold transition-all text-white py-5 shadow-lg shadow-indigo-500/10 cursor-pointer" disabled={loading}>
              {loading ? 'Enviando link seguro...' : 'Solicitar Acesso'}
            </Button>
          </form>
        )}
      </CardContent>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/85 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none transition-all duration-300">
        <Suspense fallback={
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
            Carregando formulário seguro...
          </div>
        }>
          <LoginContent />
        </Suspense>
      </Card>
    </div>
  )
}
