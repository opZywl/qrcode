"use client"

import { Button } from "@/components/ui/button"
import { LinkIcon, Wifi, User, CalendarDays, Mail, MessageSquare, MapPin, MessageSquareText, Phone } from "lucide-react"
import type { TipoConteudoQR } from "@/hooks/use-qr-code-state"

interface SeletorTipoConteudoProps {
  tipoAtivo: TipoConteudoQR
  onTipoChange: (tipo: TipoConteudoQR) => void
}

const tiposConteudo = [
  { value: "url", Icon: LinkIcon, label: "URL/Texto" },
  { value: "wifi", Icon: Wifi, label: "WiFi" },
  { value: "vcard", Icon: User, label: "Contato" },
  { value: "vevent", Icon: CalendarDays, label: "Evento" },
  { value: "email", Icon: Mail, label: "Email" },
  { value: "sms", Icon: MessageSquare, label: "SMS" },
  { value: "geo", Icon: MapPin, label: "Localização" },
  { value: "whatsapp", Icon: MessageSquareText, label: "WhatsApp" },
  { value: "phone", Icon: Phone, label: "Telefone" },
] as const

export function SeletorTipoConteudo({ tipoAtivo, onTipoChange }: SeletorTipoConteudoProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {tiposConteudo.map(({ value, Icon, label }) => (
        <Button
          key={value}
          variant={tipoAtivo === value ? "default" : "outline"}
          onClick={() => onTipoChange(value as TipoConteudoQR)}
          className={`
            flex flex-col items-center justify-center p-3 h-auto transition-all duration-200
            ${
              tipoAtivo === value
                ? "bg-primary text-primary-foreground shadow-primary-glow border-primary"
                : "hover:bg-muted/80 hover:border-primary/50"
            }
          `}
        >
          <Icon
            className={`w-5 h-5 mb-1 ${
              tipoAtivo === value ? "text-primary-foreground animate-text-glow-primary" : "text-muted-foreground"
            }`}
          />
          <span className="text-xs font-medium text-center leading-tight">{label}</span>
        </Button>
      ))}
    </div>
  )
}
