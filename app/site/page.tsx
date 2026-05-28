import React from 'react'
import Link from 'next/link'
import { PetAtendeLogo } from '@/components/ui/PetAtendeLogo'
import { WhatsAppSimulator } from '@/components/ui/WhatsAppSimulator'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  HelpCircle,
  MessageSquare,
  BadgeAlert
} from 'lucide-react'

export const metadata = {
  title: 'PetAtende - Automatize o WhatsApp do seu PetShop com IA',
  description: 'A Lara atende seus clientes, agenda banho e tosa, calcula preços por porte do pet e salva tudo na agenda 24h por dia.',
}

export default function SiteVendasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 bg-white/70 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <PetAtendeLogo iconSize={32} textSize="xl" />
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Recursos
            </a>
            <a href="#como-funciona" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Como Funciona
            </a>
            <a href="#precos" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Preços
            </a>
            <a href="#faq" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Entrar no Painel
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-750 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── SEÇÃO HERO (IMPACTO COMERCIAL) ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Elemento de iluminação (Gradiente) de fundo */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/10 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

        {/* Texto Hero */}
        <div className="flex-1 space-y-6 text-center lg:text-left relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
            <Sparkles size={13} className="animate-spin [animation-duration:3s]" />
            Atendimento Automático 24h
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[54px] leading-[1.1] font-black tracking-tight text-slate-900 dark:text-white">
            Seu PetShop com Atendimento por{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              Inteligência Artificial
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-550 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-semibold">
            A Lara atende seus clientes no WhatsApp de forma humanizada, consulta sua agenda operacional, calcula o preço exato conforme o porte do pet e confirma os agendamentos na hora. Pare de perder banhos e tosas fora do horário comercial!
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 scale-100 hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
            >
              Criar Conta e Testar Grátis
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all"
            >
              Ver Como Funciona
            </a>
          </div>

          {/* Provas Sociais Curtas */}
          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-900/60 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-xs text-slate-450 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Teste grátis de 7 dias
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Sem taxa de instalação
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Instalação em 5 minutos
            </div>
          </div>
        </div>

        {/* Simulador Interativo do WhatsApp (Celular) */}
        <div className="flex-1 relative z-10 flex justify-center lg:justify-end w-full animate-in fade-in slide-in-from-right-4 duration-500 [animation-delay:0.1s]">
          <div className="relative">
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-indigo-500 to-purple-500 blur-2xl opacity-15 dark:opacity-20 animate-pulse pointer-events-none" />
            <WhatsAppSimulator />
          </div>
        </div>
      </section>

      {/* ── SEÇÃO RECURSOS ──────────────────────────────────────────────────────── */}
      <section id="recursos" className="bg-white dark:bg-slate-900/40 py-20 md:py-28 transition-colors duration-300 border-y border-slate-200/40 dark:border-slate-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Vantagens Comerciais
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Sua Recepção Operando no Piloto Automático
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-semibold">
              Esqueça atendimentos perdidos no WhatsApp. Unimos a melhor inteligência artificial do mercado pet a uma plataforma de vendas e controle de ponta.
            </p>
          </div>

          {/* Grid de Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1: Lara IA */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Atendimento Lara 24/7</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-4 flex-1">
                Uma assistente dócil, empática e prestativa que atende, cadastra pets, resolve dúvidas de preços e fecha agendamentos sem cansar ou errar.
              </p>
            </div>

            {/* Card 2: Kanban de Agenda */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-650 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Calendar size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Painel Operacional Kanban</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-4 flex-1">
                Monitore visualmente em tempo real o fluxo dos animais: agendados, aguardando banho, em execução ou prontos para retirada pela família.
              </p>
            </div>

            {/* Card 3: Google Agenda */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Clock size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Google Agenda Sincronizado</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-4 flex-1">
                Assim que a Lara confirma o banho e tosa no WhatsApp do cliente, o compromisso entra automaticamente no calendário digital de sua equipe.
              </p>
            </div>

            {/* Card 4: Métricas */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-650 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Métricas e Faturamento</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-4 flex-1">
                Acompanhe o faturamento mensal, serviços mais vendidos da semana e o crescimento dos agendamentos em gráficos dinâmicos de alta legibilidade.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEÇÃO COMO FUNCIONA ──────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Jornada do Cliente
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Como funciona a operação no dia a dia?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-semibold">
            Uma experiência incrivelmente simples e automatizada para o tutor do pet e para sua equipe.
          </p>
        </div>

        {/* Passos Visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {/* Passo 1 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Envio da Mensagem</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-xs mx-auto font-semibold">
              O cliente entra em contato com o WhatsApp do seu petshop perguntando sobre horários livres ou preços de banho e tosa.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Triagem Inteligente</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-xs mx-auto font-semibold">
              A Lara IA entra em ação: entende a intenção, identifica o pet, confere o porte, consulta os valores e agenda o melhor horário vago.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirmação Operacional</h3>
            <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed max-w-xs mx-auto font-semibold">
              O horário é reservado na nuvem. Ele é automaticamente sincronizado com sua equipe no Google Agenda e no painel Kanban da loja.
            </p>
          </div>

        </div>
      </section>

      {/* ── SEÇÃO PREÇOS OFICIAIS ─────────────────────────────────────────────────── */}
      <section id="precos" className="bg-white dark:bg-slate-900/40 py-20 md:py-28 transition-colors duration-300 border-y border-slate-200/40 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Planos e Assinaturas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Investimento Justo que se Paga no Primeiro Dia
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-semibold">
              Recupere clientes perdidos por demora no atendimento imediatamente. Cancele quando quiser.
            </p>
          </div>

          {/* Cards de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Plano Lara Essencial */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 hover:scale-[1.01] transition-transform duration-300 flex flex-col relative overflow-hidden">
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lara Essencial</h3>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-5xl font-black tracking-tight">350</span>
                  <span className="text-slate-400 ml-1 text-xs">/mês</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Perfeito para petshops focados unicamente na automatização de agendamentos e atendimento no WhatsApp.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 flex-1 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Atendente Lara IA no WhatsApp 24/7
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Atendimento em Linguagem Natural
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Cadastro Ilimitado de Clientes & Pets
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Configuração de Catálogo & Preços
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Suporte técnico completo por chat
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-indigo-650 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 font-extrabold py-3.5 rounded-xl transition-all shadow-sm"
              >
                Começar Teste Grátis
              </Link>
            </div>

            {/* Plano PetAtende Pro */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border-2 border-indigo-600 dark:border-indigo-500 hover:scale-[1.01] transition-transform duration-300 flex flex-col relative overflow-hidden shadow-xl shadow-indigo-500/5">
              
              {/* Badge Melhor Escolha */}
              <div className="absolute top-4 right-4 bg-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                Melhor Escolha
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">PetAtende Pro</h3>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-5xl font-black tracking-tight">500</span>
                  <span className="text-slate-400 ml-1 text-xs">/mês</span>
                </div>
                <p className="text-xs text-slate-455 dark:text-slate-400 leading-relaxed font-bold">
                  A solução de gestão operacional, financeira e de atendimento definitiva para o seu petshop.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 flex-1 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <strong>Tudo do Plano Lara Essencial</strong>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Plataforma de Onboarding Prática & Integrada
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Painel Operacional Kanban Completo
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Sincronização com Google Agenda (Equipe)
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Métricas financeiras e estatísticas avançadas
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Garantir Plano Completo
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEÇÃO FAQ (DÚVIDAS FREQUENTES) ───────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center space-y-3 mb-16">
          <HelpCircle size={32} className="mx-auto text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-sm text-slate-400 font-semibold">
            Restou alguma dúvida sobre o funcionamento do PetAtende? Veja as respostas mais comuns.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          
          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden cursor-pointer select-none">
            <summary className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              Como funciona a inteligência artificial do PetAtende?
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white group-open:rotate-180 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              A Lara se conecta diretamente ao WhatsApp do seu PetShop através de nossa integração em nuvem. Ela entende mensagens em linguagem natural dos clientes, consulta a agenda livre do banco de dados, cadastra pets novos, recalcula preços baseados no porte e realiza o agendamento de banho e tosa em segundos de forma dócil e sem intervenção humana.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden cursor-pointer select-none">
            <summary className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              Eu preciso instalar algum aplicativo ou programa no meu computador?
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white group-open:rotate-180 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Não! O PetAtende é um sistema 100% online em nuvem (SaaS). Você pode gerenciar seu Kanban, ver relatórios financeiros e monitorar a IA de qualquer lugar, direto do navegador do seu computador ou celular.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden cursor-pointer select-none">
            <summary className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              Posso usar o meu número atual de WhatsApp do PetShop?
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white group-open:rotate-180 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Sim! Nós conectamos a IA diretamente no seu número atual do WhatsApp Business ou pessoal. A transição é rápida e você não perde nenhum contato ou histórico de cliente.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 transition-all duration-300 [&_summary::-webkit-details-marker]:hidden cursor-pointer select-none">
            <summary className="flex items-center justify-between text-slate-900 dark:text-white font-bold text-sm sm:text-base">
              E se a IA não souber responder alguma pergunta complexa do cliente?
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white group-open:rotate-180 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
              Caso o cliente exija falar com o responsável humano ou demonstre alguma insatisfação, a Lara executa o nosso protocolo de *Handoff* imediatamente: ela avisa o cliente que um atendente irá assumir, silencia a automação e envia uma notificação no painel de controle para que sua equipe assuma o atendimento humano no mesmo instante.
            </p>
          </details>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <PetAtendeLogo iconSize={28} textSize="lg" />
          <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold">
            &copy; {new Date().getFullYear()} PetAtende SaaS. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Botão de WhatsApp Comercial oficial fixo no rodapé */}
      <WhatsAppButton />
    </div>
  )
}
