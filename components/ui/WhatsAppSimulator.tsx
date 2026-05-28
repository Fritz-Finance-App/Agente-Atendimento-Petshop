'use client'
import React, { useState, useEffect } from 'react'
import { Check, CheckCheck, Send } from 'lucide-react'

interface Message {
  id: number
  sender: 'user' | 'bot'
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

const DIALOGO: Message[] = [
  { id: 1, sender: 'user', text: 'Oi! Quero agendar um banho para o meu cachorro.', time: '08:21', status: 'read' },
  { id: 2, sender: 'bot', text: 'Olá! Que delícia! 🐾 Vamos agendar um banho maravilhoso por aqui. Como se chama o seu pet?', time: '08:21' },
  { id: 3, sender: 'user', text: 'Ele se chama Pipoca!', time: '08:21', status: 'read' },
  { id: 4, sender: 'bot', text: 'Que nome fofo! 😍 E qual a raça e o porte do Pipoca (pequeno, médio ou grande)?', time: '08:22' },
  { id: 5, sender: 'user', text: 'É um Beagle de porte médio.', time: '08:22', status: 'read' },
  { id: 6, sender: 'bot', text: 'Perfeito! Para cães de porte médio (como o Beagle), o banho completo fica R$ 65. Qual o melhor dia e horário para vocês?', time: '08:22' },
  { id: 7, sender: 'user', text: 'Amanhã às 14h.', time: '08:23', status: 'read' },
  { id: 8, sender: 'bot', text: 'Excelente! Anotado aqui para amanhã às 14h. Só para garantir a segurança dele: as vacinas (V8/V10 e Raiva) estão em dia?', time: '08:23' },
  { id: 9, sender: 'user', text: 'Sim, tudo em dia e ele é dócil.', time: '08:23', status: 'read' },
  { id: 10, sender: 'bot', text: 'Perfeito! Agendamento 100% confirmado para o Pipoca: Banho Completo amanhã às 14h por R$ 65. Estaremos esperando! 🧼🐶', time: '08:24' }
]

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (currentStep >= DIALOGO.length) {
      // Loop: Reinicia o chat após um tempo
      const resetTimeout = setTimeout(() => {
        setMessages([])
        setCurrentStep(0)
      }, 5000)
      return () => clearTimeout(resetTimeout)
    }

    const nextMsg = DIALOGO[currentStep]
    
    if (nextMsg.sender === 'bot') {
      // Se for a IA respondendo, simula o efeito "digitando..."
      const typingTimeout = setTimeout(() => {
        setIsTyping(true)
        
        const appearanceTimeout = setTimeout(() => {
          setIsTyping(false)
          setMessages(prev => [...prev, nextMsg])
          setCurrentStep(prev => prev + 1)
        }, 2000) // Tempo digitando

        return () => clearTimeout(appearanceTimeout)
      }, 1000) // Delay antes de começar a digitar

      return () => clearTimeout(typingTimeout)
    } else {
      // Se for o usuário escrevendo, aparece de imediato
      const userTimeout = setTimeout(() => {
        setMessages(prev => [...prev, nextMsg])
        setCurrentStep(prev => prev + 1)
      }, 2500) // Intervalo entre as interações do usuário

      return () => clearTimeout(userTimeout)
    }
  }, [currentStep])

  return (
    <div className="w-full max-w-[340px] h-[580px] bg-slate-900 border-[8px] border-slate-950 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col mx-auto select-none scale-95 md:scale-100 transition-transform duration-300 hover:shadow-indigo-500/5">
      
      {/* Celular: Speaker superior (Notch) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-2xl z-30 flex items-center justify-center">
        <div className="w-12 h-1 bg-slate-800 rounded-full" />
      </div>

      {/* WhatsApp Header */}
      <div className="bg-[#075E54] dark:bg-slate-900 text-white pt-7 pb-3 px-4 flex items-center justify-between shadow-md relative z-20 transition-colors duration-300">
        <div className="flex items-center gap-2.5 mt-1">
          {/* Avatar da Lara */}
          <div className="relative h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-sm shadow-sm select-none">
            🐾
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm tracking-tight">Lara 🤖</h3>
            <p className="text-[10px] text-emerald-200 dark:text-emerald-400 font-medium">
              {isTyping ? 'digitando...' : 'online'}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Background / Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col bg-[#efeae2] dark:bg-slate-950 transition-colors duration-300 relative z-10">
        
        {/* Marca d'água sutil de fundo do Whatsapp */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-[0.01]" />

        {messages.map((msg) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm transition-all duration-300 relative ${
                isUser
                  ? 'bg-[#d9fdd3] text-slate-800 self-end rounded-tr-none animate-in slide-in-from-right-3'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 self-start rounded-tl-none animate-in slide-in-from-left-3'
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {/* Rodapé da mensagem: Hora e Status */}
              <div className="flex items-center gap-1 self-end mt-1 text-[9px] text-slate-400">
                <span>{msg.time}</span>
                {isUser && (
                  msg.status === 'read' ? (
                    <CheckCheck size={11} className="text-[#53bdeb]" />
                  ) : (
                    <Check size={11} />
                  )
                )}
              </div>
            </div>
          )
        })}

        {/* Efeito digitando... */}
        {isTyping && (
          <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 self-start rounded-2xl rounded-tl-none px-4 py-3 text-xs shadow-sm flex items-center gap-1 animate-in fade-in duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      {/* WhatsApp Input (Estético) */}
      <div className="bg-[#f0f2f5] dark:bg-slate-900/40 p-2.5 flex items-center gap-2 border-t border-slate-200/40 dark:border-slate-800/20 relative z-20 transition-colors duration-300">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-full px-4 py-2 text-[11px] text-slate-400 flex items-center border border-slate-200/50 dark:border-slate-800/30">
          Mensagem...
        </div>
        <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white shrink-0 shadow-sm cursor-default">
          <Send size={14} className="ml-0.5" />
        </div>
      </div>
    </div>
  )
}
