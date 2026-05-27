import Link from 'next/link'
import { Home, Calendar, Settings, LogOut, MessageSquare, Users } from 'lucide-react'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar se o e-mail do usuário ainda está autorizado comercialmente
  if (user.email) {
    const serviceClient = createServiceClient()
    const { data: authorized, error: dbError } = await serviceClient
      .from('emails_autorizados')
      .select('email')
      .eq('email', user.email)
      .single()

    if (dbError || !authorized) {
      await supabase.auth.signOut()
      redirect('/login?error=unauthorized_license')
    }
  }


  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside className="w-56 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors duration-300">
        <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <h1 className="font-extrabold text-base bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent tracking-tight">
            PetShop Manager
          </h1>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
          >
            <Home size={16} className="text-gray-550 dark:text-slate-400" /> Dashboard
          </Link>
          <Link
            href="/dashboard/agenda"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
          >
            <Calendar size={16} className="text-gray-550 dark:text-slate-400" /> Agenda
          </Link>
          <Link
            href="/dashboard/clientes"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
          >
            <Users size={16} className="text-gray-550 dark:text-slate-400" /> Clientes & Pets
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
          >
            <Settings size={16} className="text-gray-550 dark:text-slate-400" /> Configurações
          </Link>
          <Link
            href="/dashboard/playground"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-all"
          >
            <MessageSquare size={16} className="text-gray-550 dark:text-slate-400" /> Playground IA
          </Link>
        </nav>

        <form action="/api/auth/signout" method="POST" className="p-3 border-t border-gray-100 dark:border-slate-800">
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 w-full rounded-xl text-sm font-bold text-gray-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all cursor-pointer"
          >
            <LogOut size={16} /> Sair
          </button>
        </form>
      </aside>

      <main className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100">{children}</main>
    </div>
  )
}
