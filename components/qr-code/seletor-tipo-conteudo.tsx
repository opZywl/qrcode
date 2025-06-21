"use client"

import {
  LinkIcon,
  Wifi,
  MessageSquareText,
  Phone,
  User,
  CalendarDays,
  Mail,
  MessageSquare,
  MapPin,
  CreditCard,
  Smartphone,
  Music,
  Video,
  UtensilsCrossed,
  Ticket,
} from "lucide-react"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

interface SeletorTipoConteudoProps {
  tipoAtivo: TipoConteudoQR
  onTipoChange: (tipo: TipoConteudoQR) => void
}

const tiposConteudo = [
  { valor: "url" as const, Icon: LinkIcon, label: "URL", cor: "from-blue-500 to-blue-600" },
  { valor: "wifi" as const, Icon: Wifi, label: "WiFi", cor: "from-green-500 to-green-600" },
  { valor: "whatsapp" as const, Icon: MessageSquareText, label: "WhatsApp", cor: "from-green-400 to-green-500" },
  { valor: "phone" as const, Icon: Phone, label: "Telefone", cor: "from-purple-500 to-purple-600" },
  { valor: "vcard" as const, Icon: User, label: "Contato", cor: "from-orange-500 to-orange-600" },
  { valor: "vevent" as const, Icon: CalendarDays, label: "Evento", cor: "from-red-500 to-red-600" },
  { valor: "email" as const, Icon: Mail, label: "Email", cor: "from-yellow-500 to-yellow-600" },
  { valor: "sms" as const, Icon: MessageSquare, label: "SMS", cor: "from-pink-500 to-pink-600" },
  { valor: "geo" as const, Icon: MapPin, label: "Localização", cor: "from-teal-500 to-teal-600" },
  { valor: "pix" as const, Icon: CreditCard, label: "PIX", cor: "from-emerald-500 to-emerald-600" },
  { valor: "appstore" as const, Icon: Smartphone, label: "App Store", cor: "from-indigo-500 to-indigo-600" },
  { valor: "spotify" as const, Icon: Music, label: "Música", cor: "from-green-600 to-green-700" },
  { valor: "zoom" as const, Icon: Video, label: "Videochamada", cor: "from-blue-600 to-blue-700" },
  { valor: "menu" as const, Icon: UtensilsCrossed, label: "Menu", cor: "from-amber-500 to-amber-600" },
  { valor: "cupom" as const, Icon: Ticket, label: "Cupom", cor: "from-rose-500 to-rose-600" },
]

export function SeletorTipoConteudo({ tipoAtivo, onTipoChange }: SeletorTipoConteudoProps) {
  return (
      <div className="grid grid-cols-3 gap-3 p-1">
        {tiposConteudo.map(({ valor, Icon, label, cor }) => (
            <button
                key={valor}
                onClick={() => onTipoChange(valor)}
                className={`
            group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95
            ${
                    tipoAtivo === valor
                        ? `bg-gradient-to-br ${cor} text-white shadow-lg ring-2 ring-white/20 ring-offset-2 ring-offset-background`
                        : "bg-gradient-to-br from-muted/50 to-muted hover:from-muted hover:to-muted/80 text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/30"
                }
          `}
            >
              <div
                  className={`
            p-2 rounded-lg mb-2 transition-all duration-300
            ${tipoAtivo === valor ? "bg-white/20 backdrop-blur-sm" : "bg-background/50 group-hover:bg-primary/10"}
          `}
              >
                <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                        tipoAtivo === valor
                            ? "text-white drop-shadow-sm"
                            : "text-muted-foreground group-hover:text-primary group-hover:animate-text-glow-primary"
                    }`}
                />
              </div>
              <span
                  className={`text-xs text-center font-medium transition-all duration-300 ${
                      tipoAtivo === valor ? "text-white drop-shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                  }`}
              >
            {label}
          </span>

              {tipoAtivo === valor && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
        ))}
      </div>
  )
}