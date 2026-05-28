'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepWhatsApp from '@/components/onboarding/StepWhatsApp'
import StepGoogleCalendar from '@/components/onboarding/StepGoogleCalendar'
import StepPrecos from '@/components/onboarding/StepPrecos'
import { PetAtendeLogo } from '@/components/ui/PetAtendeLogo'
import { Check } from 'lucide-react'

const STEPS = ['WhatsApp', 'Google Calendar', 'Tabela de Preços']

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const router = useRouter()

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Elementos de gradiente de iluminação premium no fundo */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-600/10 dark:bg-indigo-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-72 h-72 rounded-full bg-purple-600/10 dark:bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="mb-8 flex flex-col items-center relative z-10">
        <PetAtendeLogo iconSize={32} textSize="xl" />
        <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold mt-2 uppercase tracking-widest">
          Configuração de Inicialização
        </p>
      </div>

      {/* Step Indicator Premium */}
      <div className="flex items-center gap-2 mb-8 relative z-10 w-full max-w-lg justify-between sm:justify-center px-4">
        {STEPS.map((label, i) => {
          const isCompleted = i < step
          const isActive = i === step
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm
                  ${isCompleted 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/10' 
                    : isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-600/20' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
              >
                {isCompleted ? <Check size={14} className="stroke-[3]" /> : i + 1}
              </div>
              <span 
                className={`text-xs hidden sm:block transition-all duration-300 font-bold uppercase tracking-wider
                  ${isActive 
                    ? 'text-indigo-650 dark:text-indigo-400' 
                    : isCompleted 
                      ? 'text-emerald-650 dark:text-emerald-450' 
                      : 'text-slate-400 dark:text-slate-550'
                  }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-[2px] transition-all duration-500 w-6 sm:w-10 rounded-full
                  ${i < step 
                    ? 'bg-emerald-500' 
                    : i === step 
                      ? 'bg-indigo-300 dark:bg-indigo-900' 
                      : 'bg-slate-200 dark:bg-slate-900'
                  }`} 
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Main card box container */}
      <div className="w-full max-w-lg relative z-10 animate-in fade-in duration-300">
        {step === 0 && <StepWhatsApp onNext={next} />}
        {step === 1 && <StepGoogleCalendar onNext={next} />}
        {step === 2 && <StepPrecos onNext={next} />}
      </div>
    </div>
  )
}
