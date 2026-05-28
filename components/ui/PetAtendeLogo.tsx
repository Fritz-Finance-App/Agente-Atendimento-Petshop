import React from 'react'

interface PetAtendeLogoProps {
  className?: string
  iconSize?: number
  textSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  hideText?: boolean
}

export function PetAtendeLogo({
  className = '',
  iconSize = 32,
  textSize = '2xl',
  hideText = false
}: PetAtendeLogoProps) {
  
  // Mapeamento de tamanho do texto
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl font-black'
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Ícone Logotipo: Patinha estilizada integrada com balão de chat */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-indigo-600 dark:text-indigo-400 filter drop-shadow-sm transition-transform hover:scale-105 duration-300"
      >
        {/* Balão de Diálogo (Base do Chat) */}
        <path
          d="M42 22C42 32.5 33.5 41 23 41C19.8 41 16.8 40.2 14.2 38.8L6 41L8.2 32.8C6.8 30.2 6 27.2 6 24C6 13.5 14.5 5 25 5C35.5 5 42 13.5 42 22Z"
          fill="url(#logo-grad)"
          className="opacity-15 dark:opacity-20"
        />
        <path
          d="M42 22C42 32.5 33.5 41 23 41C19.8 41 16.8 40.2 14.2 38.8L6 41L8.2 32.8C6.8 30.2 6 27.2 6 24C6 13.5 14.5 5 25 5C35.5 5 42 13.5 42 22Z"
          stroke="url(#logo-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Almofadas da Patinha (Pads) */}
        {/* Dedos da pata superior */}
        <circle cx="17" cy="18" r="3" fill="currentColor" />
        <circle cx="25" cy="14" r="3" fill="currentColor" />
        <circle cx="33" cy="18" r="3" fill="currentColor" />
        
        {/* Almofada central (Pata maior) em formato de coração/diálogo */}
        <path
          d="M25 21C21.7 21 19 23.7 19 27C19 29.8 21.2 31 25 34C28.8 31 31 29.8 31 27C31 23.7 28.3 21 25 21Z"
          fill="currentColor"
        />

        {/* Gradiente de Cores */}
        <defs>
          <linearGradient id="logo-grad" x1="6" y1="5" x2="42" y2="41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4f46e5" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      {/* Texto da Marca */}
      {!hideText && (
        <span className={`font-black tracking-tight ${sizeClasses[textSize]} transition-colors duration-300`}>
          <span className="text-slate-800 dark:text-white">Pet</span>
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 dark:from-indigo-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
            Atende
          </span>
        </span>
      )}
    </div>
  )
}
