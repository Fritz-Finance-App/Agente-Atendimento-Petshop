'use client'
import React from 'react'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppButton({
  phoneNumber = '5511999999999', // Número comercial padrão (usuário mudará depois)
  message = 'Olá! Gostaria de saber mais sobre o PetAtende.'
}: WhatsAppButtonProps) {
  
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-55 group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Falar conosco no WhatsApp"
    >
      {/* Círculo com efeito de onda (Pulse Wave) */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-35 group-hover:opacity-40 animate-ping z-0 pointer-events-none" />

      {/* Ícone do WhatsApp */}
      <svg
        className="w-5.5 h-5.5 relative z-10 fill-current"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.022-.079-.186-.285-.413-.4l-.58-.29c-.228-.113-.393-.113-.538.113l-.228.293c-.143.197-.285.228-.512.113-.228-.115-.963-.354-1.835-1.134-.678-.605-1.136-1.353-1.27-1.58-.135-.228-.015-.35.099-.463l.255-.3c.115-.135.15-.228.228-.38.077-.152.039-.285-.02-.4l-.228-.535c-.218-.522-.38-.522-.513-.522l-.44-.015c-.15 0-.394.058-.6.285-.203.228-.778.76-.778 1.85 0 1.092.793 2.146.902 2.3.11.15 1.56 2.38 3.78 3.342.528.228 1.066.38 1.482.51.528.168.97.142 1.34.086.413-.062 1.27-.522 1.452-1.002.18-.48.18-.89.126-.974l-.24-.136zM12.14 21.847q-.003.003 0 0l-.004.004C9.75 21.85 7.6 20.85 6.002 19.3L5.4 18.905l-2.455.645.656-2.39-.43-.687c-1.7-2.7-1.845-6.05-.436-8.918 1.41-2.868 4.25-4.7 7.42-4.782 4.3-.08 7.85 3.3 8.002 7.6C18.847 16.3 16.05 20.35 12.14 21.847zM12 2C6.477 2 2 6.477 2 12c0 1.91.53 3.69 1.46 5.23L2 22l4.9-1.28c1.47.8 3.12 1.28 4.9 1.28 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
      </svg>

      {/* Texto do Botão */}
      <span className="relative z-10 text-xs tracking-tight uppercase font-extrabold pr-1">
        Fale diretamente com nós
      </span>
    </a>
  )
}
