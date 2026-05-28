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
  Users
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      
      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 bg-white/70 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/60 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <PetAtendeLogo textSize="xl" />
          
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
              className="text-sm font-bold text-slate-650 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* ── SEÇÃO HERO (IMPACTO) ────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        
        {/* Elemento de iluminação (Gradiente) de fundo */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/10 dark:bg-purple-500/5 blur-[140px] pointer-events-none" />

        {/* Texto Hero */}
        <div className="flex-1 space-y-6 text-center lg:text-left relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">
          
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mx-auto lg:mx-0">
            <Sparkles size={13} className="animate-spin [animation-duration:3s]" />
            Atendimento Petshop 2.0
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-[54px] leading-[1.1] font-black tracking-tight text-slate-900 dark:text-white">
            Automatize o WhatsApp do seu PetShop com{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
              Inteligência Artificial
            </span>
          </h2>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
            A Lara atende seus clientes, consulta a agenda livre, calcula preços baseados no porte do pet e confirma agendamentos no WhatsApp 24h por dia. Multiplique as vendas do seu petshop de forma automática!
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 scale-100 hover:scale-[1.02] active:scale-[0.98] duration-200 cursor-pointer"
            >
              Criar Conta Grátis
              <ChevronRight size={16} className="ml-1" />
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold px-7 py-3.5 rounded-xl transition-all"
            >
              Ver Demonstração
            </a>
          </div>

          {/* Provas Sociais Curtas */}
          <div className="pt-6 border-t border-slate-200/50 dark:border-slate-900/60 flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-3 text-xs text-slate-450 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Teste grátis de 7 dias
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Configuração em 5 min
            </div>
          </div>
        </div>

        {/* Simulador Interativo do WhatsApp (Celular) */}
        <div className="flex-1 relative z-10 flex justify-center lg:justify-end w-full animate-in fade-in slide-in-from-right-4 duration-500 [animation-delay:0.1s]">
          <div className="relative">
            {/* Decoração luminosa atrás do celular */}
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
              Gestão e IA Integradas
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Tudo o que seu PetShop precisa em um só lugar
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
              Esqueça planilhas e agendas de papel. Unimos um gerenciador operacional moderno à mais avançada inteligência artificial de atendimento.
            </p>
          </div>

          {/* Grid de Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Card 1: Lara IA */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Atendente Lara 24/7</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4 flex-1">
                Uma inteligência artificial dócil e empática que agenda, tira dúvidas de preços e cadastra pets sem nenhuma digitação manual da sua equipe.
              </p>
            </div>

            {/* Card 2: Kanban de Agenda */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-650 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Calendar size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Painel Operacional Kanban</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4 flex-1">
                Monitore em tempo real os pets que estão agendados, em banho, finalizados ou prontos para retirada através de colunas visuais intuitivas.
              </p>
            </div>

            {/* Card 3: Google Agenda */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-650 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Clock size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sincronização com Google</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4 flex-1">
                Integração nativa de calendários. Quando a Lara confirma o banho no WhatsApp, o evento entra imediatamente no Google Calendar de sua equipe.
              </p>
            </div>

            {/* Card 4: Relatórios */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:scale-[1.02] shadow-sm transition-all duration-300 flex flex-col group">
              <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-650 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={22} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Métricas e Finanças</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4 flex-1">
                Visualize seus faturamentos mensais, serviços mais vendidos e taxa de no-show em gráficos modernos para tomadas de decisão cirúrgicas.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEÇÃO COMO FUNCIONA ──────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Fluxo Sem Atrito
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Como funciona a operação no dia a dia?
          </h3>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
            Entenda como a automação da PetAtende economiza horas de trabalho de sua equipe.
          </p>
        </div>

        {/* Passos Visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          
          {/* Passo 1 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              1
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">O Cliente Envia Mensagem</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              Seu cliente envia uma mensagem de WhatsApp solicitando banho ou tosa em qualquer horário (mesmo na madrugada!).
            </p>
          </div>

          {/* Passo 2 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-purple-50 dark:bg-purple-950/30 text-purple-650 dark:text-purple-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              2
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Lara Realiza a Triagem</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              A IA faz o cadastro, busca os serviços, recalcula o valor conforme o porte do pet e reserva a vaga direto no sistema em segundos.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="space-y-4 text-center relative">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400 text-2xl font-black flex items-center justify-center mx-auto shadow-sm">
              3
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pronto na Agenda e Kanban</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
              O evento aparece sincronizado no seu Google Agenda e o pet entra na coluna "Agendados" do seu painel administrativo.
            </p>
          </div>

        </div>
      </section>

      {/* ── SEÇÃO PREÇOS ────────────────────────────────────────────────────────── */}
      <section id="precos" className="bg-white dark:bg-slate-900/40 py-20 md:py-28 transition-colors duration-300 border-y border-slate-200/40 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Retorno sobre o Investimento
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Planos simples que cabem no seu bolso
            </h3>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-medium">
              Recupere o valor investido logo no primeiro dia de automação. Teste grátis por 7 dias.
            </p>
          </div>

          {/* Cards de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Plano Mensal */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 hover:scale-[1.01] transition-transform duration-300 flex flex-col relative overflow-hidden">
              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Plano Mensal Flex</h4>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-5xl font-black tracking-tight">149</span>
                  <span className="text-slate-400 ml-1 text-xs">/mês</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Ideal para petshops individuais que querem experimentar e ter total flexibilidade de assinatura.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 flex-1 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Atendente Lara IA no WhatsApp 24/7
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Painel Kanban Completo e Multi-tenant
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Integração com Google Agenda (Sinc)
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Cadastro de Clientes, Pets e Serviços
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Suporte técnico prioritário por chat
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-indigo-650 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 font-extrabold py-3.5 rounded-xl transition-all"
              >
                Experimentar Grátis
              </Link>
            </div>

            {/* Plano Anual */}
            <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-3xl border-2 border-indigo-600 dark:border-indigo-500 hover:scale-[1.01] transition-transform duration-300 flex flex-col relative overflow-hidden shadow-xl shadow-indigo-500/5">
              
              {/* Badge Popular */}
              <div className="absolute top-4 right-4 bg-indigo-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                Melhor Economia
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Plano Anual Premium</h4>
                <div className="flex items-baseline text-slate-900 dark:text-white">
                  <span className="text-2xl font-bold">R$</span>
                  <span className="text-5xl font-black tracking-tight">119</span>
                  <span className="text-slate-400 ml-1 text-xs">/mês</span>
                </div>
                <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-bold">
                  Cobrado anualmente (R$ 1.428). Economize R$ 360 por ano comparado ao plano mensal!
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-650 dark:text-slate-350 flex-1 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-500 shrink-0" />
                  <strong>Tudo do Plano Mensal</strong>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Redução automática de 20% no valor mensal
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Métricas financeiras e estatísticas avançadas
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Prioridade em novos recursos lançados
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-500 shrink-0" />
                  Gerente de Sucesso do Cliente dedicado
                </li>
              </ul>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Garantir Plano Premium
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEÇÃO FAQ (DÚVIDAS FREQUENTES) ───────────────────────────────────────── */}
      <section id="faq" className="py-20 md:py-28 max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center space-y-3 mb-16">
          <HelpCircle size={32} className="mx-auto text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Perguntas Frequentes
          </h3>
          <p className="text-sm text-slate-400 font-medium">
            Restou alguma dúvida sobre o PetAtende? Veja as respostas das perguntas mais comuns.
          </p>
        </div>

        {/* FAQ Accordion usando <details> e <summary> nativos (Perfeito para SEO e Estabilidade) */}
        <div className="space-y-4">
          
          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              <span>Como funciona a inteligência artificial do PetAtende?</span>
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white transition group-open:-rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
              A Lara se conecta diretamente ao WhatsApp do seu PetShop através de nossa integração segura. Ela entende mensagens em linguagem natural dos seus clientes, consulta a agenda livre do banco de dados, cadastra pets novos, recalcula preços baseados no porte do pet e confirma agendamentos no WhatsApp em segundos, sem nenhuma intervenção humana.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              <span>Eu preciso instalar algum aplicativo ou programa no meu computador?</span>
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white transition group-open:-rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
              Não! O PetAtende é uma plataforma online em nuvem (SaaS). Você pode gerenciar seu Kanban de banho e tosa, ver relatórios financeiros e monitorar a IA de qualquer lugar, direto do navegador do seu computador, tablet ou celular.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              <span>Posso usar o meu número atual de WhatsApp do meu PetShop?</span>
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white transition group-open:-rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
              Sim! Nós integramos a inteligência artificial diretamente no seu número atual de WhatsApp comercial (Business) ou pessoal. O processo de conexão leva menos de 5 minutos via leitura de QR Code.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              <span>E se a IA não souber responder alguma pergunta complexa do cliente?</span>
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white transition group-open:-rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
              A Lara é programada com filtros de segurança rigorosos. Caso um cliente demonstre irritação profunda, exija falar com um gerente ou traga alguma dúvida complexa sobre saúde (ex: sintomas de doenças), ela aciona o protocolo de *Handoff* imediatamente, silenciando o robô e alertando a sua equipe no painel para assumir o atendimento humano no mesmo instante.
            </p>
          </details>

          <details className="group bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all duration-300">
            <summary className="flex items-center justify-between font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              <span>O sistema se integra com o Google Agenda?</span>
              <span className="ml-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-900 dark:text-white transition group-open:-rotate-180">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-450 font-medium">
              Com certeza! O PetAtende se integra nativamente ao Google Calendar. Assim que a Lara fecha um agendamento com o cliente no WhatsApp, o evento é sincronizado automaticamente na sua Google Agenda, permitindo que toda a equipe da loja acompanhe o fluxo de banhos direto de seus celulares.
            </p>
          </details>

        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <PetAtendeLogo iconSize={26} textSize="lg" />
          <p className="text-xs text-slate-450 font-medium">
            © {new Date().getFullYear()} PetAtende. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-450 font-bold uppercase tracking-wider">
            <a href="#recursos" className="hover:text-indigo-650 dark:hover:text-indigo-400">Recursos</a>
            <a href="#precos" className="hover:text-indigo-650 dark:hover:text-indigo-400">Preços</a>
            <Link href="/login" className="hover:text-indigo-650 dark:hover:text-indigo-400">Acessar Painel</Link>
          </div>
        </div>
      </footer>

      {/* Botão de WhatsApp Comercial Flutuante */}
      <WhatsAppButton />

    </div>
  )
}
