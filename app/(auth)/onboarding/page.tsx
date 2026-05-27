'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StepWhatsApp from '@/components/onboarding/StepWhatsApp'
import StepGoogleCalendar from '@/components/onboarding/StepGoogleCalendar'
import StepPrecos from '@/components/onboarding/StepPrecos'

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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${i <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
            >
              {i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < step ? 'bg-blue-300' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {step === 0 && <StepWhatsApp onNext={next} />}
        {step === 1 && <StepGoogleCalendar onNext={next} />}
        {step === 2 && <StepPrecos onNext={next} />}
      </div>
    </div>
  )
}
